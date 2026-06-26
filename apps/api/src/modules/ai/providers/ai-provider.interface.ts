export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface GenerationResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}

export interface EmbeddingResult {
  embedding: number[];
  inputTokens: number;
  costUsd: number;
  latencyMs: number;
}

export interface AIProvider {
  readonly name: string;
  generateText(
    prompt: string,
    options?: GenerationOptions,
  ): Promise<GenerationResult>;
  generateJSON<T>(prompt: string, options?: GenerationOptions): Promise<T>;
  generateEmbedding(text: string): Promise<EmbeddingResult>;
}

export const AI_GENERATION_PROVIDER = 'AI_GENERATION_PROVIDER';
export const AI_EMBEDDING_PROVIDER = 'AI_EMBEDDING_PROVIDER';
