import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
  ExecutionContext,
} from '@nestjs/common';
import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { ExtensionController } from './extension.controller.js';
import { ExtensionService } from './extension.service.js';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard.js';
import { url } from 'inspector';

const mockExtensionService = {
  quickSave: vi.fn(),
  checkUrl: vi.fn(),
};

// mock JWT
const mockJwtGuard = {
  canActivate: vi.fn().mockImplementation((context) => {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'user-1', email: 'test@example.com' };
    return true;
  }),
};

describe('ExtensionController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    vi.resetAllMocks();
    mockExtensionService.quickSave.mockResolvedValue(undefined);
    mockExtensionService.checkUrl.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtensionController],
      providers: [
        { provide: ExtensionService, useValue: mockExtensionService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'user-1', email: 'test@example.com' };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(() => app.close());

  describe('POST /extension/quick-save', () => {
    it('returns 201 with articleId and status', async () => {
      mockExtensionService.quickSave.mockResolvedValue({
        articleId: 'art-1',
        status: 'PENDING',
      });

      await request(app.getHttpServer())
        .post('/extension/quick-save')
        .send({ url: 'https://example.com/article' })
        .expect(201)
        .expect({ articleId: 'art-1', status: 'PENDING' });
    });

    it('returns 400 when url is missing', async () => {
      await request(app.getHttpServer())
        .post('/extension/quick-save')
        .send({})
        .expect(400);

      expect(mockExtensionService.quickSave).not.toHaveBeenCalled();
    });

    it('returns 400 when url is not a valid URL', async () => {
      await request(app.getHttpServer())
        .post('/extension/quick-save')
        .send({ url: 'not-a-url' })
        .expect(400);
    });

    it('strips unknown fields from body', async () => {
      mockExtensionService.quickSave.mockResolvedValue({
        articleId: 'art-1',
        status: 'PENDING',
      });

      await request(app.getHttpServer())
        .post('/extension/quick-save')
        .send({ url: 'https://example.com/article', unknownField: 'evil' })
        .expect(400); //forbidNonWhitelisted rejects unknown fields
    });
  });

  describe('GET /extension/check-url', () => {
    it('returns exists: false when URL not saved', async () => {
      mockExtensionService.checkUrl.mockResolvedValue({ exists: false });

      await request(app.getHttpServer())
        .get('/extension/check-url')
        .query({ url: 'https://example.com/article' })
        .expect(200)
        .expect({ exists: false });
    });

    it('returns exists: true with articleId and status', async () => {
      mockExtensionService.checkUrl.mockResolvedValue({
        exists: true,
        articleId: 'art-1',
        status: 'PROCESSED',
      });

      await request(app.getHttpServer())
        .get('/extension/check-url')
        .query({ url: 'https://example.com/article' })
        .expect(200)
        .expect({ exists: true, articleId: 'art-1', status: 'PROCESSED' });
    });

    it('returns 400 when url query param is missing', async () => {
      await request(app.getHttpServer())
        .get('/extension/check-url')
        .expect(400);
    });
  });
});
