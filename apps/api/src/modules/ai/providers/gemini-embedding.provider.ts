import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  AIProvider,
  GenerationOptions,
  GenerationResult,
  EmbeddingResult,
} from './ai-provider.interface.js';

// text-embedding-004: free tier, 768 dimensions
const EMBEDDING_COST_PER_TOKEN = 0.000025 / 1_000_000; // effectively $0

@Injectable()
export class GeminiEmbeddingProvider implements AIProvider {
  readonly name = 'gemini-text-embedding-004';
  private readonly client: GoogleGenerativeAI;
  private readonly logger = new Logger(GeminiEmbeddingProvider.name);

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const start = Date.now();
    const model = this.client.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const response = await model.embedContent(text);
    const latencyMs = Date.now() - start;

    const inputTokens = text.split(/\s+/).length; // approximation, API doesn't return token count

    this.logger.debug(
      `generateEmbedding: ~${inputTokens}tokens ${latencyMs}ms`,
    );

    return {
      embedding: response.embedding.values,
      inputTokens,
      costUsd: inputTokens * EMBEDDING_COST_PER_TOKEN,
      latencyMs,
    };
  }

  generateText(
    _prompt: string,
    _options?: GenerationOptions,
  ): Promise<GenerationResult> {
    throw new Error('Use GeminiProvider for text generation.');
  }

  generateJSON<T>(_prompt: string, _options?: GenerationOptions): Promise<T> {
    throw new Error('use GeminiProvider for text generation.');
  }
}
