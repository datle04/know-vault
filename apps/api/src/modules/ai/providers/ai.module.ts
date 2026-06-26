import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiProvider } from './gemini.provider.js';
import { GeminiEmbeddingProvider } from './gemini-embedding.provider.js';
import {
  AI_GENERATION_PROVIDER,
  AI_EMBEDDING_PROVIDER,
} from './ai-provider.interface.js';

@Module({
  providers: [
    {
      provide: AI_GENERATION_PROVIDER,
      useFactory: (config: ConfigService) =>
        new GeminiProvider(config.getOrThrow<string>('GEMINI_API_KEY')),
      inject: [ConfigService],
    },
    {
      provide: AI_EMBEDDING_PROVIDER,
      useFactory: (config: ConfigService) =>
        new GeminiEmbeddingProvider(
          config.getOrThrow<string>('GEMINI_API_KEY'),
        ),
      inject: [ConfigService],
    },
  ],
  exports: [AI_GENERATION_PROVIDER, AI_EMBEDDING_PROVIDER],
})
export class AiModule {}
