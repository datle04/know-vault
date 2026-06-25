import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';
import { ArticleProcessorService } from './article-processor.service.js';
import { AiModule } from '../ai/providers/ai.module.js';

@Module({
  imports: [AiModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticleProcessorService],
})
export class ArticlesModule {}
