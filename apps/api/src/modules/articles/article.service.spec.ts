import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ArticlesService } from '@/modules/articles/articles.service.js';
import { PrismaService } from '../../infrastructure/persistence/prisma.service.js';
import { ArticleProcessorService } from './article-processor.service.js';

const mockArticle = {
  id: 'article-id',
  userId: 'user-id',
  url: 'https://example.com/article',
  urlHash: 'some-hash',
  title: 'Test Article',
  author: null,
  siteName: null,
  savedAt: new Date(),
  status: 'PENDING',
  wordCount: 100,
  readingTimeMin: 1,
  language: 'en',
  processedAt: null,
};

const mockPrisma = {
  article: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

const mockProcessor = {
  process: vi.fn().mockResolvedValue(undefined),
};

describe('ArticlesService', () => {
  let service: ArticlesService;

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ArticleProcessorService, useValue: mockProcessor },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe('save()', () => {
    const dto = {
      url: 'https://example.com/article',
      title: 'Test Article',
      content: 'This is the article content with enough words to count.',
    };

    it('creates and returns article', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue(mockArticle);

      const result = await service.save(dto, 'user-id');

      expect(mockPrisma.article.create).toHaveBeenCalledOnce();
      expect(mockProcessor.process).toHaveBeenCalledWith(
        mockArticle.id,
        'user-id',
      );
      expect(result).toEqual(mockArticle);
    });

    it('throws ConflictException if URL already saved by user', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle);

      await expect(service.save(dto, 'user-id')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.article.create).not.toHaveBeenCalled();
    });

    it('computes wordCount from content', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue(mockArticle);

      await service.save(
        { ...dto, content: 'one two three four five' },
        'user-id',
      );

      expect(mockPrisma.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ wordCount: 5 }),
        }),
      );
    });

    it('sets language to "en" by default', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue(mockArticle);

      await service.save(dto, 'user-id');

      expect(mockPrisma.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ language: 'en' }),
        }),
      );
    });
  });

  describe('findAll()', () => {
    it('returns paginated articles withour search', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockArticle], 1]);

      const result = await service.findAll('user-id', { page: 1, limit: 20 });

      expect(result.articles).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it('uses FTS search when search query provided', async () => {
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([mockArticle]) // articles query
        .mockResolvedValueOnce([{ count: BigInt(1) }]); // count query

      const result = await service.findAll('user-id', {
        search: 'typescript',
        page: 1,
        limit: 20,
      });

      expect(result.articles).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(2);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('returns article when found and owned by user', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        ...mockArticle,
        content: 'full content',
      });

      const result = await service.findOne('article-id', 'user-id');

      expect(result).toBeDefined();
    });

    it('throws NotFoundException when article not found', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when article belongs to different user', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        ...mockArticle,
        userId: 'other-user-id',
      });

      await expect(service.findOne('article-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete()', () => {
    it('deletes article when found and owned by user', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle);
      mockPrisma.article.delete.mockResolvedValue(mockArticle);

      await expect(
        service.delete('article-id', 'user-id'),
      ).resolves.not.toThrow();
      expect(mockPrisma.article.delete).toHaveBeenCalledOnce();
    });

    it('throws NotFoundException when article not found', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.article.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when article belongs to different user', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        ...mockArticle,
        userId: 'other-user-id',
      });

      await expect(service.delete('article-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrisma.article.delete).not.toHaveBeenCalled();
    });
  });
});
