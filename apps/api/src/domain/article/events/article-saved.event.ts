import { DomainEvent } from '@/domain/shared/domain-event.js';

export class ArticleSavedEvent extends DomainEvent {
  readonly eventName = 'article.saved';

  constructor(
    readonly articleId: string,
    readonly userId: string,
  ) {
    super();
  }
}
