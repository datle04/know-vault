export type ArticleStatusValue =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED';

export class ArticleStatus {
  private constructor(private readonly value: ArticleStatusValue) {}

  static PENDING = new ArticleStatus('PENDING');
  static PROCESSING = new ArticleStatus('PROCESSING');
  static PROCESSED = new ArticleStatus('PROCESSED');
  static FAILED = new ArticleStatus('FAILED');

  static from(value: string): ArticleStatus {
    const valid: ArticleStatusValue[] = [
      'PENDING',
      'PROCESSING',
      'PROCESSED',
      'FAILED',
    ];
    if (!valid.includes(value as ArticleStatusValue)) {
      throw new Error(`Invalid article status: ${value}`);
    }
    return new ArticleStatus(value as ArticleStatusValue);
  }

  isPending(): boolean {
    return this.value === 'PENDING';
  }
  isProcessing(): boolean {
    return this.value === 'PROCESSING';
  }
  isProcessed(): boolean {
    return this.value === 'PROCESSED';
  }
  isFailed(): boolean {
    return this.value === 'FAILED';
  }

  toString(): string {
    return this.value;
  }
}
