import { Entity } from '../shared/entity';
import { ArticleStatus } from './article-status.vo';
import { ArticleUrl } from './article-url.vo';
import { ArticleSavedEvent } from './events/article-saved.event';

export interface CreateArticleProps {
  id: string;
  userId: string;
  url: ArticleUrl;
  title: string | null;
  htmlContent: string | null;
  textContent: string | null;
}

export interface ArticleProps extends CreateArticleProps {
  status: ArticleStatus;
  savedAt: Date;
  processedAt: Date | null;
  language: string | null;
}

export class Article extends Entity {
  readonly id: string;
  readonly userId: string;
  readonly url: ArticleUrl;
  readonly savedAt: Date;

  private _title: string | null;
  private _htmlContent: string | null;
  private _textContent: string | null;
  private _status: ArticleStatus;
  private _processedAt: Date | null;
  private _language: string | null;

  private constructor(props: ArticleProps) {
    super();
    this.id = props.id;
    this.userId = props.userId;
    this.url = props.url;
    this.savedAt = props.savedAt;
    this._title = props.title;
    this._htmlContent = props.htmlContent;
    this._textContent = props.textContent;
    this._status = props.status;
    this._processedAt = props.processedAt;
    this._language = props.language;
  }

  // Factory: create new Article, emit event
  static create(props: CreateArticleProps): Article {
    const article = new Article({
      ...props,
      status: ArticleStatus.PENDING,
      savedAt: new Date(),
      processedAt: null,
      language: null,
    });

    article.addEvent(new ArticleSavedEvent(article.id, article.userId));
    return article;
  }

  // Factory: restore from DB, NO emit event
  static reconstitute(props: ArticleProps): Article {
    return new Article(props);
  }

  // State transitions - enforce invariants
  markAsProcessing(): void {
    if (!this._status.isPending()) {
      throw new Error(
        `Cannot mark article as processing: current status is ${this._status.toString()}`,
      );
    }
    this._status = ArticleStatus.PROCESSING;
  }

  markAsProcessed(props: {
    title: string;
    textContent: string;
    language: string;
  }): void {
    if (!this._status.isProcessing()) {
      throw new Error(
        `Cannot mark article as processed: current status is ${this._status.toString()}`,
      );
    }
    this._title = props.title;
    this._textContent = props.textContent;
    this._language = props.language;
    this._status = ArticleStatus.PROCESSED;
    this._processedAt = new Date();
  }

  markAsFailed(): void {
    if (!this._status.isProcessing()) {
      throw new Error(
        `Cannot mark article as failed: current status is ${this._status.toString()}`,
      );
    }
    this._status = ArticleStatus.FAILED;
  }

  // Getters
  get title(): string | null {
    return this._title;
  }
  get htmlContent(): string | null {
    return this._htmlContent;
  }
  get textContent(): string | null {
    return this.textContent;
  }
  get status(): ArticleStatus {
    return this._status;
  }
  get processedAt(): Date | null {
    return this._processedAt;
  }
  get language(): string | null {
    return this._language;
  }
}
