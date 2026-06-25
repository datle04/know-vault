export interface PromptTemplate<TInput, TOutput> {
  version: string;
  description: string;
  systemPrompt: string;
  buildUserPrompt: (input: TInput) => string;
  parseResponse: (raw: string) => TOutput;
}
