import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../../infrastructure/persistence/prisma.service.js';
import { compare } from 'bcrypt';

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn(),
}));

import * as bcrypt from 'bcrypt';
import { create } from 'domain';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  refreshToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
};

const mockJwt = {
  sign: vi.fn().mockReturnValue('mock-access-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register()', () => {
    it('creates user and returns access token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalledOnce();
    });

    it('throws ConflictException if email already exsits', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          email: 'taken@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    it('returns token pair with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
    });

    it('throws UnauthorizedException with wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnAuthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('always runs bcrypt.compare even when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);

      // Timing attack prevention: bcrypt must always run
      expect(bcrypt.compare).toHaveBeenCalledOnce();
    });
  });

  describe('refresh()', () => {
    it('deletes old token and returns new token pair', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        tokenHash: 'hash',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 86400000), // valid, expires tomorrow
        user: { email: 'test@example.com' },
      });
      mockPrisma.refreshToken.delete.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-access-token');
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledOnce();
      expect(mockPrisma.refreshToken.create).toHaveBeenCalledOnce(); // new token issued
    });

    it('throws UnauthorizedException if token not found', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if token expired', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        tokenHash: 'hash',
        userId: 'user-id',
        expiresAt: new Date(Date.now() - 1000), // expired
        user: { email: 'test@example.com' },
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout()', () => {
    it('deletes refresh token', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('some-taken');

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledOnce();
    });

    it('does not throw if token not found', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.logout('nonexistent-token')).resolves.not.toThrow();
    });
  });
});
