import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../infrastructure/persistence/prisma.service.js';
import { ArticleUrl } from '../../domain/article/article-url.vo.js';
import { SaveArticleDto } from './dto/save-article.dto.js';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto.js';
import { randomBytes } from 'crypto';

type ArticleRecord = {
  id: string;
  userId: string;
  url: string;
  urlHash: string;
  title: string;
  author: string | null;
  siteName: string | null;
  savedAt: Date;
  status: string;
  wordCount: number;
  readingTimeMin: number;
  language: string;
  processedAt: Date | null;
};

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async save(dto: SaveArticleDto, userId: string) {
    const articleUrl = ArticleUrl.create(dto.url);

    // Dedup: same user + same URL => return existing
    const existing = await this.prisma.article.findUnique({
      where: { userId_urlHash: { userId, urlHash: articleUrl.hash } },
    });

    if (existing) {
      throw new ConflictException({
        errorCode: 'ARTICLE_ALREADY_SAVED',
        context: { id: existing.id },
      });
    }

    const contentHash = createHash('sha256').update(dto.content).digest('hex');
    const wordCount = dto.content.trim().split(/\s+/).length;
    const readingTimeMin = Math.max(1, Math.round(wordCount / 200));

    return this.prisma.article.create({
      data: {
        id: randomBytes(16).toString('hex'),
        userId,
        url: dto.url,
        urlHash: articleUrl.hash,
        title: dto.title,
        author: dto.author ?? null,
        siteName: dto.siteName ?? null,
        content: dto.content,
        contentHash,
        wordCount,
        readingTimeMin,
        language: 'en',
        status: 'PENDING',
      },
      select: this.articleSelect(),
    });
  }

  async findAll(userId: string, query: ListArticlesQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const offset = (page - 1) * limit;

    if (search) {
      return this.searchFTS(userId, search, limit, offset);
    }

    const [articles, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: { userId },
        orderBy: { savedAt: 'desc' },
        take: limit,
        select: this.articleSelect(),
      }),
      this.prisma.article.count({ where: { userId } }),
    ]);

    return { articles, total, page, limit };
  }

  async findOne(id: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: { ...this.articleSelect(), content: true },
    });

    if (!article || article.userId !== userId) {
      throw new NotFoundException({ errorCode: 'ARTICLE_NOT_FOUND' });
    }

    return article;
  }

  async delete(id: string, userId: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });

    if (!article || article.userId !== userId) {
      throw new NotFoundException({ errorCode: 'ARTICLE_NOT_FOUND' });
    }

    await this.prisma.article.delete({ where: { id } });
  }

  // Exploration 1 - Approach A: PostgreSQL Full-Text Search
  private async searchFTS(
    userId: string,
    query: string,
    limit: number,
    offset: number,
  ) {
    const articles = await this.prisma.$queryRaw<ArticleRecord[]>`
            SELECT id, "userId", url, "urlHash", title, author, "siteName",
                "savedAt", status, "wordCount", "readingTimeMin", language, "processedAt"
            FROM "Article"
            WHERE "userId" = ${userId}
                AND to_tsvector('english', title || ' ' || content)
                    @@ plainto_tsquery('english', ${query})
                ORDER BY ts_rank(
                    to_tsvector ('english', title || ' ' || content),
                    plainto_tsquery('english', ${query})
                ) DESC
                LIMIT ${limit} OFFSET ${offset}
        `;

    const total = await this.prisma.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(*) as count FROM "Article"
            WHERE "userId" = ${userId}
                AND to_tsvector('english', title || ' ' || content)
                    @@ plainto_tsquery('english', ${query})
        `;

    return {
      articles,
      total: Number(total[0]?.count ?? 0),
      page: Math.floor(offset / limit) + 1,
      limit,
    };
  }

  private articleSelect() {
    return {
      id: true,
      userId: true,
      url: true,
      urlHash: true,
      title: true,
      author: true,
      siteName: true,
      savedAt: true,
      status: true,
      wordCount: true,
      readingTimeMin: true,
      language: true,
      processedAt: true,
      // content excluded by default - too large for list views
    };
  }
}
