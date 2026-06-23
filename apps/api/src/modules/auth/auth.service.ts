import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/persistence/prisma.service.js';
import { User } from '../../domain/user/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { error } from 'console';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_BYTES = 40;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing)
      throw new ConflictException({ errorCode: 'EMAIL_ALREADY_EXISTS' });

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = User.create({
      id: this.generateId(),
      email: dto.email,
      name: null,
      passwordHash,
    });

    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: null,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      },
    });

    return this.issueTokenPair(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const record = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // constant-time: always run bcrypt even if user not found
    const passwordHash =
      record?.passwordHash ?? '$2b$12$invalidhashfortimingattack';
    const valid = await bcrypt.compare(dto.password, passwordHash);

    if (!record || !valid) {
      throw new UnauthorizedException({ errorCode: 'INVALID_CREDENTIALS' });
    }

    return this.issueTokenPair(record.id, record.email);
  }

  async refreshToken(token: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException({ errorCode: 'INVALID_REFRESH_TOKEN' });
    }

    // Rotate: delete old, issue new
    await this.prisma.refreshToken.delete({ where: { tokenHash } });
    return this.issueTokenPair(record.userId, record.userId);
  }

  async logout(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  private async issueTokenPair(
    userId: string,
    email: string,
  ): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: process.env['JWT_ACCESS_SECRET'], expiresIn: '15m' },
    );

    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateId(): string {
    // cuid2-compatible: simple random id for now
    return randomBytes(16).toString('hex');
  }
}
