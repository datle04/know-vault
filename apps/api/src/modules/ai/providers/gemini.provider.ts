import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
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
  readonly name = 'gemini-2.5-flash';
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateText(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<GenerationResult> {
    const start = Date.now();

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    });

    const latencyMs = Date.now() - start;
    const inputTokens = response.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = response.usageMetadata?.candidatesTokenCount ?? 0;
    const costUsd =
      inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;

    this.logger.debug(
      `generateText: ${inputTokens}in/${outputTokens}out $${costUsd.toFixed(6)} ${latencyMs}ms`,
    );

    return {
      text: response.text ?? '',
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
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 4096,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    return JSON.parse(text) as T;
  }

  generateEmbedding(_text: string): Promise<EmbeddingResult> {
    throw new Error('Use GeminiEmbeddingProvider for embeddings.');
  }
}
