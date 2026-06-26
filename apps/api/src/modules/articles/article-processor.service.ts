import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service.js';
import {
  AIProvider,
  AI_GENERATION_PROVIDER,
  AI_EMBEDDING_PROVIDER,
} from '../ai/providers/ai-provider.interface.js';
import { extractConceptsV1 } from '../ai/prompt-templates/extract-concept.v1.js';
import { generateQuestionsV1 } from '../ai/prompt-templates/generate-questions.v1.js';

@Injectable()
export class ArticleProcessorService {
  private readonly logger = new Logger(ArticleProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(AI_GENERATION_PROVIDER) private readonly generator: AIProvider,
    @Inject(AI_EMBEDDING_PROVIDER) private readonly embedder: AIProvider,
  ) {}

  async process(articleId: string, userId: string): Promise<void> {
    this.logger.log(`Processing article ${articleId}`);
    const startedAt = Date.now();
    let totalCost = 0;

    await this.prisma.article.update({
      where: { id: articleId },
      data: { status: 'PROCESSING' },
    });

    try {
      const article = await this.prisma.article.findUniqueOrThrow({
        where: { id: articleId },
      });

      // Stage 2: Chunking
      const chunks = this.chunkContent(article.content);
      await this.prisma.articleChunk.createMany({
        data: chunks.map((content, order) => ({
          articleId,
          order,
          content,
          tokenCount: content.split(/\s+/).length,
        })),
      });
      this.logger.log(`Stage 2 done: ${chunks.length} chunks`);

      // Stage 3: Embedding
      const createdChunks = await this.prisma.articleChunk.findMany({
        where: { articleId },
        orderBy: { order: 'asc' },
      });

      for (const chunk of createdChunks) {
        const result = await this.embedder.generateEmbedding(chunk.content);
        totalCost += result.costUsd;

        await this.prisma.$executeRaw`
                    UPDATE "ArticleChunk"
                    SET embedding = ${`[${result.embedding.join(',')}]`}::vector
                    WHERE id = ${chunk.id}
                `;

        await this.logAICall(
          userId,
          'gemini-embedding',
          'embed_chunk',
          result.inputTokens,
          0,
          result.costUsd,
          result.latencyMs,
          true,
        );
      }

      this.logger.log(`Stage 3 done: embeddings generated`);

      // Stage 4: Concept extraction
      const conceptResult = await this.generator.generateJSON<
        Array<{ name: string; confidence: number }>
      >(
        [
          extractConceptsV1.systemPrompt,
          extractConceptsV1.buildUserPrompt({
            title: article.title,
            content: article.content,
          }),
        ].join('\n\n'),
        { temperature: 0.2 },
      );
      const extractedConcepts = extractConceptsV1.parseResponse(
        JSON.stringify(conceptResult),
      );
      totalCost += 0; // cost tracked inside generateJSON via logger - Phase 8 will add explicit tracking

      for (const extracted of extractedConcepts) {
        const nameSlug = extracted.name.toLowerCase().replace(/\s+/g, '-');

        const concept = await this.prisma.concept.upsert({
          where: { userId_nameSlug: { userId, nameSlug } },
          update: {},
          create: {
            userId,
            name: extracted.name,
            nameSlug,
            description: extracted.description,
          },
        });

        await this.prisma.articleConcept.upsert({
          where: { articleId_conceptId: { articleId, conceptId: concept.id } },
          update: { confidence: extracted.confidence },
          create: {
            articleId,
            conceptId: concept.id,
            confidence: extracted.confidence,
          },
        });
      }

      this.logger.log(`Stage 4 done: ${extractedConcepts.length} concepts`);

      // Stage 5: Question generation
      const questions = await this.generator.generateJSON<
        Array<{
          text: string;
          expectedAnswer: string;
          difficulty: string;
          conceptName: string;
        }>
      >(
        [
          generateQuestionsV1.systemPrompt,
          generateQuestionsV1.buildUserPrompt({
            title: article.title,
            content: article.content,
            concepts: extractedConcepts.map((c) => c.name),
          }),
        ].join('\n\n'),
        { temperature: 0.3, maxTokens: 8192 },
      );

      for (const q of questions) {
        const difficulty = (
          ['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty)
            ? q.difficulty
            : 'MEDIUM'
        ) as 'EASY' | 'MEDIUM' | 'HARD';
        const nameSlug = q.conceptName.toLowerCase().replace(/\s+/g, '-');

        const question = await this.prisma.question.create({
          data: {
            articleId,
            text: q.text,
            expectedAnswer: q.expectedAnswer,
            difficulty,
          },
        });

        await this.prisma.review.create({
          data: { questionId: question.id },
        });

        const concept = await this.prisma.concept.findUnique({
          where: { userId_nameSlug: { userId, nameSlug } },
        });
        if (concept) {
          await this.prisma.questionConcept.create({
            data: { questionId: question.id, conceptId: concept.id },
          });
        }
      }

      this.logger.log(`Stage 5 done: ${questions.length} questions`);

      await this.prisma.article.update({
        where: { id: articleId },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
          aiCost: totalCost,
        },
      });

      this.logger.log(
        `Article ${articleId} processed in ${Date.now() - startedAt}ms`,
      );
    } catch (error) {
      await this.prisma.article.update({
        where: { id: articleId },
        data: {
          status: 'FAILED',
          processingError:
            error instanceof Error ? error.message : 'Unknown Error',
        },
      });
      throw error;
    }
  }

  private chunkContent(content: string): string[] {
    // Simple paragraph-based chunking - target ~600 words per chunk
    const paragraphs = content.split(/\n{2,}/);
    const chunks: string[] = [];
    let current = '';

    for (const para of paragraphs) {
      const combined = current ? `${current}\n\n${para}` : para;
      if (combined.split(/\s+/).length > 600 && current) {
        chunks.push(current.trim());
        current = para;
      } else {
        current = combined;
      }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks.length > 0 ? chunks : [content];
  }

  private async logAICall(
    userId: string,
    provider: string,
    operation: string,
    inputTokens: number,
    outputTokens: number,
    costUsd: number,
    latencyMs: number,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    await this.prisma.aICallLog.create({
      data: {
        userId,
        provider,
        operation,
        inputTokens,
        outputTokens,
        costUsd,
        latencyMs,
        success,
        errorMessage,
      },
    });
  }
}
