import { Entity } from '../shared/entity';

export interface CreateUserProps {
  id: string;
  email: string;
  passwordHash: string;
}

export interface UserProps extends CreateUserProps {
  createdAt: Date;
}

export class User extends Entity {
  readonly id: string;
  readonly email: string;
  readonly createdAt: Date;

  private readonly _passwordHash: string;

  private constructor(props: UserProps) {
    super();
    this.id = props.id;
    this.email = props.email;
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
