import { describe, it, expect } from 'vitest';
import { ArticleUrl } from './article-url.vo.js';

describe('ArticleUrl', () => {
  it('creates from valid URL', () => {
    const vo = ArticleUrl.create('https://example.com/article');
    expect(vo).toBeDefined();
  });

  it('throws on invalid URL', () => {
    expect(() => ArticleUrl.create('not-a-url')).toThrow();
    expect(() => ArticleUrl.create('')).toThrow();
  });

  it('strips UTM tracking parameters', () => {
    const withUtm = ArticleUrl.create(
      'https://example.com/article?utm_source=twitter&utm_medium=social',
    );
    const withoutUtm = ArticleUrl.create('https://example.com/article');
    expect(withUtm.hash).toBe(withoutUtm.hash);
  });

  it('same URL produces same hash', () => {
    const a = ArticleUrl.create('https://example.com/article');
    const b = ArticleUrl.create('https://example.com/article');
    expect(a.hash).toBe(b.hash);
  });

  it('different URLs produce different hashes', () => {
    const a = ArticleUrl.create('https://example.com/article-1');
    const b = ArticleUrl.create('https://example.com/article-2');
    expect(a.hash).not.toBe(b.hash);
  });

  it('normalizes trailing hash', () => {
    const withSlash = ArticleUrl.create('https://example.com/article/');
    const withoutSlash = ArticleUrl.create('https://example.com/article');
    expect(withSlash.hash).toBe(withoutSlash.hash);
  });
});
