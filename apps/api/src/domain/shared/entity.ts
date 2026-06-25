import { DomainEvent } from './domain-event.js';

export abstract class Entity {
  private readonly _domainEvents: DomainEvent[] = [];

  protected addEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents.length = 0;
    return events;
  }
}
