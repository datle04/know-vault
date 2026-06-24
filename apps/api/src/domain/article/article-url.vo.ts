import { createHash } from 'crypto';

export class ArticleUrl {
  readonly normalized: string;
  readonly hash: string;

  private constructor(private readonly raw: string) {
    this.normalized = ArticleUrl.normalize(raw);
    this.hash = createHash('sha256').update(this.normalized).digest('hex');
  }

  static create(raw: string): ArticleUrl {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error(`Invalid URL: ${raw}`);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`URL must use http or https protocol: ${raw}`);
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
