import { createHash } from 'crypto';

export class ArticleUrl {
  readonly normalized: string;
  readonly hash: string;

  private constructor(private readonly raw: string) {
    this.normalized = ArticleUrl.normalize(raw);
    this.hash = createHash('sha256').update(this.normalized).digest('hex');
  }

  static create(raw: string): ArticleUrl {
    try {
      new URL(raw); // validate URL format
    } catch (error) {
      throw new Error(`Invalid URL: ${raw}`);
    }
    return new ArticleUrl(raw);
  }

  private static normalize(url: string): string {
    const parsed = new URL(url);
    // Remove tracking params
    [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ].forEach((p) => parsed.searchParams.delete(p));

    // Normalize: lowercase hostname, remove trailing slash
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/$/, '')}${parsed.search}`;
  }

  toString(): string {
    return this.raw;
  }
  equals(other: ArticleUrl): boolean {
    return this.hash == other.hash;
  }
}
