import { Injectable, Logger } from '@nestjs/common';
import { ArticleProcessorService } from '../articles/article-processor.service.js';
import { QuickSaveDto } from './dto/quick-save.dto.js';
import { ArticleUrl } from '../../domain/article/article-url.vo.js';
import { PrismaService } from '../../infrastructure/persistence/prisma.service.js';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

interface ExtractedContent {
  title: string;
  text: string;
  html?: string;
  author?: string;
  siteName?: string;
}

@Injectable()
export class ExtensionService {
  private readonly logger = new Logger(ExtensionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly processor: ArticleProcessorService,
  ) {}

  async quickSave(dto: QuickSaveDto, userId: string) {
    const articleUrl = ArticleUrl.create(dto.url);

    // Check duplicate
    const existing = await this.prisma.article.findUnique({
      where: { userId_urlHash: { userId, urlHash: articleUrl.hash } },
      select: { id: true, status: true },
    });
    if (existing) {
      return { articleId: existing.id, status: existing.status };
    }

    // Extract content
    const extracted = dto.html
      ? this.extractFromHtml(dto.html, dto.url, dto.title)
      : await this.fetchAndExtract(dto.url, dto.title);

    // Persist
    const { createHash } = await import('crypto');
    const contentHash = createHash('sha256')
      .update(extracted.text)
      .digest('hex');
    const wordCount = extracted.text.trim().split(/\s+/).length;

    const article = await this.prisma.article.create({
      data: {
        userId,
        url: dto.url,
        urlHash: articleUrl.hash,
        title: extracted.title,
        author: extracted.author ?? null,
        siteName: extracted.siteName ?? null,
        content: extracted.text,
        contentHash,
        wordCount,
        readingTimeMin: Math.max(1, Math.round(wordCount / 200)),
        language: 'en',
        status: 'PENDING',
      },
      select: { id: true, status: true },
    });

    // Fire-and-forget (Approach B)
    this.processor.process(article.id, userId).catch((err: unknown) => {
      this.logger.error(`Background processing failed for ${article.id}`, err);
    });

    return { articleId: article.id, status: article.status };
  }

  private extractFromHtml(
    html: string,
    url: string,
    fallbackTitle?: string,
  ): ExtractedContent {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const parsed = reader.parse();
    return {
      title: parsed?.title || fallbackTitle || url, // || catches empty string
      text: parsed?.textContent ?? '',
      html: parsed?.content ?? html,
      author: parsed?.byline ?? undefined,
      siteName: parsed?.siteName ?? undefined,
    };
  }

  private async fetchAndExtract(
    url: string,
    fallbackTitle?: string,
  ): Promise<ExtractedContent> {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'KnowVault/1.0 (article reader)' },
      signal: AbortSignal.timeout(10_000),
    });
    const html = await response.text();
    return this.extractFromHtml(html, url, fallbackTitle);
  }

  async checkUrl(
    url: string,
    userId: string,
  ): Promise<{ exists: boolean; articleId?: string; status?: string }> {
    const articleUrl = ArticleUrl.create(url);

    const existing = await this.prisma.article.findUnique({
      where: { userId_urlHash: { userId, urlHash: articleUrl.hash } },
      select: { id: true, status: true },
    });

    if (!existing) {
      return { exists: false };
    }

    return { exists: true, articleId: existing.id, status: existing.status };
  }
}
