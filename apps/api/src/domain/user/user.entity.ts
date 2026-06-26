import { Entity } from '../shared/entity.js';

export interface CreateUserProps {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string;
}

export interface UserProps extends CreateUserProps {
  createdAt: Date;
  name: string | null;
}

export class User extends Entity {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly createdAt: Date;

  private readonly _passwordHash: string;

  private constructor(props: UserProps) {
    super();
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.createdAt = props.createdAt;
    this._passwordHash = props.passwordHash;
  }

  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  equals(other: User): boolean {
    return this.id === other.id;
  }
}
