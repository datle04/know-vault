import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import type {
  AIProvider,
  GenerationOptions,
  GenerationResult,
  EmbeddingResult,
} from './ai-provider.interface.js';

@Injectable()
export class GeminiEmbeddingProvider implements AIProvider {
  readonly name = 'gemini-embedding-001';
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(GeminiEmbeddingProvider.name);

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const start = Date.now();

    const response = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        outputDimensionality: 768, // Truncates the vector to 768 dimensions
      },
    });

    const latencyMs = Date.now() - start;
    const embedding = response.embeddings?.[0]?.values ?? [];
    const inputTokens = text.split(/\s+/).length;

    this.logger.debug(
      `generateEmbedding: ~${inputTokens}tokens ${latencyMs}ms`,
    );

    return { embedding, inputTokens, costUsd: 0, latencyMs };
  }

  generateText(
    _prompt: string,
    _options?: GenerationOptions,
  ): Promise<GenerationResult> {
    throw new Error('Use GeminiProvider for text generation.');
  }

  generateJSON<T>(_prompt: string, _options?: GenerationOptions): Promise<T> {
    throw new Error('Use GeminiProvider for text generation.');
  }
}
