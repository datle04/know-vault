import { Module } from '@nestjs/common';
import { ExtensionController } from './extension.controller.js';
import { ExtensionService } from './extension.service.js';
import { PrismaModule } from '../../infrastructure/persistence/prisma.module.js';
import { ArticlesModule } from '../articles/articles.module.js';

@Module({
  imports: [PrismaModule, ArticlesModule],
  controllers: [ExtensionController],
  providers: [ExtensionService],
})
export class ExtensionModule {}
