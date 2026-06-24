import { describe, it, expect } from 'vitest';
import { Article } from './article.entity.js';
import { ArticleUrl } from './article-url.vo.js';
import { ArticleSavedEvent } from './events/article-saved.event.js';

const makeUrl = () => ArticleUrl.create('https://example.com/article');

const makeProps = () => ({
  id: 'test-id',
  userId: 'user-id',
  url: makeUrl(),
  title: 'Test Article',
  htmlContent: '<p>Content</p>',
  textContent: 'content',
});

describe('Article', () => {
  describe('create()', () => {
    it('creates article with PENDING status', () => {
      const article = Article.create(makeProps());
      expect(article.status.isPending()).toBe(true);
    });

    it('emits ArticleSavedEvent', () => {
      const article = Article.create(makeProps());
      const events = article.pullEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ArticleSavedEvent);
    });

    it('sets savedAt to current time', () => {
      const before = new Date();
      const article = Article.create(makeProps());
      expect(article.savedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });
  });

  describe('reconstitute()', () => {
    it('does NOT emit events', () => {
      const article = Article.reconstitute({
        ...makeProps(),
        status: { isPending: () => true } as never,
        savedAt: new Date(),
        processedAt: null,
        language: null,
      });
      expect(article.pullEvents()).toHaveLength(0);
    });
  });

  describe('pullEvents()', () => {
    it('clears events after pulling', () => {
      const article = Article.create(makeProps());
      article.pullEvents(); // first pull
      expect(article.pullEvents()).toHaveLength(0); // second pull = empty
    });
  });

  describe('markAsProcessing()', () => {
    it('transitions PENDING -> PROCESSING', () => {
      const article = Article.create(makeProps());
      article.pullEvents();
      article.markAsProcessing();
      expect(article.status.isProcessing()).toBe(true);
    });

    it('throws if not PENDING', () => {
      const article = Article.create(makeProps());
      article.pullEvents();
      article.markAsProcessing();
      expect(() => article.markAsProcessing()).toThrow();
    });
  });

  describe('markAsProcessed()', () => {
    it('transitions PROCESSING -> PROCESSED', () => {
      const article = Article.create(makeProps());
      article.pullEvents();
      article.markAsProcessing();
      article.markAsProcessed({
        title: 'New Title',
        textContent: 'text',
        language: 'en',
      });
      expect(article.status.isProcessed()).toBe(true);
    });

    it('throws if not PROCESSING', () => {
      const article = Article.create(makeProps());
      article.pullEvents();
      expect(() =>
        article.markAsProcessed({
          title: 'T',
          textContent: 'c',
          language: 'en',
        }),
      ).toThrow();
    });
  });

  describe('markAsFailed()', () => {
    it('transitions PROCESSING -> FAILED', () => {
      const article = Article.create(makeProps());
      article.pullEvents();
      article.markAsProcessing();
      article.markAsFailed();
      expect(article.status.isFailed()).toBe(true);
    });

    it('throws if not PROCESSING', () => {
      const article = Article.create(makeProps());
      article.pullEvents();
      expect(() => article.markAsFailed()).toThrow();
    });
  });
});
