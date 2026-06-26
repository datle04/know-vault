import { User } from './user.entity.js';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export const User_REPOSITORY = Symbol('IUserRepository');
