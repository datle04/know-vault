import { randomUUID } from 'crypto';

export abstract class DomainEvent {
  readonly eventId: string;
  readonly occuredAt: Date;
  abstract readonly eventName: string;

  protected constructor() {
    this.eventId = randomUUID();
    this.occuredAt = new Date();
  }
}
