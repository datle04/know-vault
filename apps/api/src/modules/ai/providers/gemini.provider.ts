import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  AIProvider,
  GenerationOptions,
  GenerationResult,
  EmbeddingResult,
} from './ai-provider.interface.js';

const INPUT_COST_PER_TOKEN = 0.075 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 0.3 / 1_000_000;

@Injectable()
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini-1.5-flash';
  private readonly client: GoogleGenerativeAI;
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateText(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<GenerationResult> {
    const start = Date.now();
    const model = this.client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    });

    const response = await model.generateContent(prompt);
    const latencyMs = Date.now() - start;

    const inputTokens = response.response.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens =
      response.response.usageMetadata?.candidatesTokenCount ?? 0;
    const costUsd =
      inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;

    this.logger.debug(
      `generateText: ${inputTokens}in/${outputTokens}out $${costUsd.toFixed(6)} ${latencyMs}`,
    );

    return {
      text: response.response.text(),
      inputTokens,
      outputTokens,
      costUsd,
      latencyMs,
    };
  }

  async generateJSON<T>(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<T> {
    const result = await this.generateText(prompt, {
      ...options,
      temperature: options?.temperature ?? 0.2,
    });

    const cleaned = result.text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned) as T;
  }

  generateEmbedding(_text: string): Promise<EmbeddingResult> {
    throw new Error('use GeminiEmbeddingProvider for embeddings.');
  }
}
