import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExtensionService } from './extension.service.js';
import { PrismaService } from '@/infrastructure/persistence/prisma.service.js';
import { ArticleProcessorService } from '../articles/article-processor.service.js';

const mockPrisma = {
  article: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const mockProcessor = {
  process: vi.fn(),
};

describe('ExtrensionService', () => {
  let service: ExtensionService;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockProcessor.process.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtensionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ArticleProcessorService, useValue: mockProcessor },
      ],
    }).compile();

    service = module.get<ExtensionService>(ExtensionService);
  });

  describe('quickSave', () => {
    it('returns existing article if URL already saved', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        id: 'existing-id',
        status: 'PROCESSED',
      });

      const result = await service.quickSave(
        { url: 'https://example.com/article' },
        'user-1',
      );

      expect(result).toEqual({ articleId: 'existing-id', status: 'PROCESSED' });
      expect(mockPrisma.article.create).not.toHaveBeenCalled();
      expect(mockProcessor.process).not.toHaveBeenCalled();
    });

    it('creates new article with provided html', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue({
        id: 'new-id',
        status: 'PENDING',
      });

      const html =
        '<html><head><title>Test Article</title></head><body><p>Content here for testing purposes with enough words to count properly</p></body></html>';

      const result = await service.quickSave(
        { url: 'https://example.com/article', html, title: 'Test Article' },
        'user-1',
      );

      expect(result).toEqual({ articleId: 'new-id', status: 'PENDING' });
      expect(mockPrisma.article.create).toHaveBeenCalledOnce();
      expect(mockProcessor.process).toHaveBeenCalledWith('new-id', 'user-1');
    });

    it('fires processor in background without awaiting', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue({
        id: 'new-id',
        status: 'PENDING',
      });

      const html = '<html><body><p>Some content</p></body></html>';

      // quickSave should resolve even if processor takes long
      const result = await service.quickSave(
        { url: 'https://example.com/article', html },
        'user-1',
      );

      expect(result.articleId).toBe('new-id');
    });

    it('does not throw if background processor fails', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue({
        id: 'new-id',
        status: 'PENDING',
      });
      mockProcessor.process.mockRejectedValue(new Error('AI service down'));

      const html = '<html><body><p>Some content</p></body></html>';

      await expect(
        service.quickSave(
          { url: 'https://example.com/article', html },
          'user-1',
        ),
      ).resolves.toBeDefined();
    });
  });

  describe('quickSave - fetch fallback', () => {
    it('fetches and extracts when no html provided', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue({
        id: 'new-id',
        status: 'PENDING',
      });

      // Mock global fetch
      const mockFetch = vi.fn().mockResolvedValue({
        text: () =>
          Promise.resolve(
            '<html><head><title>Fetched Article</title></head><body><p>Fetched content with enough words</p></body></html>',
          ),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await service.quickSave(
        { url: 'https://example.com/article' },
        'user-1',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/article',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
          }),
        }),
      );
      expect(result.articleId).toBe('new-id');

      vi.unstubAllGlobals();
    });

    it('throws when fetch fails', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);

      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error')),
      );

      await expect(
        service.quickSave({ url: 'https://example.com/article' }, 'user-1'),
      ).rejects.toThrow('Network error');

      vi.unstubAllGlobals();
    });
  });
  describe('checkUrl', () => {
    it('returns exists: false when URL not saved', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);

      const result = await service.checkUrl(
        'https://example.com/article',
        'user-1',
      );

      expect(result).toEqual({ exists: false });
    });

    it('returns exists: true with articleId and status when URL saved', async () => {
      mockPrisma.article.findUnique.mockResolvedValue({
        id: 'art-1',
        status: 'PROCESSED',
      });

      const result = await service.checkUrl(
        'https://example.com/article',
        'user-1',
      );

      expect(result).toEqual({
        exists: true,
        articleId: 'art-1',
        status: 'PROCESSED',
      });
    });
  });
});
