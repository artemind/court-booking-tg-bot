import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppendUserMiddleware } from '../../../src/bot/middlewares/append-user.middleware';
import { createMockContext } from '../../helpers/create-mock-context';
import type { UserService } from '../../../src/bot/services/user.service';
import type { User } from '../../../src/generated/prisma';

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    telegramId: BigInt(123456),
    telegramUsername: 'testuser',
    name: 'Test User',
    languageCode: 'en',
    isAccessRestricted: false,
    notifyBeforeBookingStarts: true,
    notifyBeforeBookingEnds: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

function createMockUserService(): jest.Mocked<UserService> {
  return {
    findByTelegramId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  } as unknown as jest.Mocked<UserService>;
}

describe('AppendUserMiddleware', () => {
  let userService: ReturnType<typeof createMockUserService>;
  let middleware: ReturnType<AppendUserMiddleware['middleware']>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    userService = createMockUserService();
    middleware = new AppendUserMiddleware(userService as unknown as UserService).middleware();
    next = vi.fn().mockResolvedValue(undefined);
  });

  describe('early exit cases', () => {
    it('stops the chain (does not call next) when ctx.from is absent', async () => {
      const ctx = createMockContext({ from: undefined } as any);
      await middleware(ctx, next);
      expect(next).not.toHaveBeenCalled();
      expect(ctx.user).toBeUndefined();
    });

    it('stops the chain when ctx.from has no username', async () => {
      const ctx = createMockContext({
        from: { id: 1, first_name: 'Test', is_bot: false } as any,
      });
      await middleware(ctx, next);
      expect(next).not.toHaveBeenCalled();
      expect(userService.findByTelegramId).not.toHaveBeenCalled();
    });
  });

  describe('new user', () => {
    it('calls UserService.create when user is not found', async () => {
      userService.findByTelegramId.mockResolvedValue(null);
      const created = mockUser();
      userService.create.mockResolvedValue(created);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(userService.create).toHaveBeenCalledWith({
        name: 'Test User',
        telegramId: 123456,
        telegramUsername: 'testuser',
        languageCode: 'en',
      });
    });

    it('sets ctx.user to the created user', async () => {
      const created = mockUser();
      userService.findByTelegramId.mockResolvedValue(null);
      userService.create.mockResolvedValue(created);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(ctx.user).toBe(created);
    });

    it('calls next() after creating the user', async () => {
      userService.findByTelegramId.mockResolvedValue(null);
      userService.create.mockResolvedValue(mockUser());

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });

  describe('existing user — no changes', () => {
    it('does not call update when all fields match', async () => {
      const existing = mockUser({ name: 'Test User', telegramUsername: 'testuser', languageCode: 'en' });
      userService.findByTelegramId.mockResolvedValue(existing);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(userService.update).not.toHaveBeenCalled();
    });

    it('sets ctx.user to the found user', async () => {
      const existing = mockUser();
      userService.findByTelegramId.mockResolvedValue(existing);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(ctx.user).toBe(existing);
    });
  });

  describe('existing user — field changed', () => {
    it('calls update when name changed', async () => {
      const existing = mockUser({ name: 'Old Name' });
      const updated = mockUser({ name: 'Test User' });
      userService.findByTelegramId.mockResolvedValue(existing);
      userService.update.mockResolvedValue(updated);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(userService.update).toHaveBeenCalledWith(
        existing.id,
        { name: 'Test User', telegramUsername: 'testuser', languageCode: 'en' },
      );
    });

    it('calls update when telegramUsername changed', async () => {
      const existing = mockUser({ telegramUsername: 'oldusername' });
      userService.findByTelegramId.mockResolvedValue(existing);
      userService.update.mockResolvedValue(mockUser());

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(userService.update).toHaveBeenCalledWith(
        existing.id,
        expect.objectContaining({ telegramUsername: 'testuser' }),
      );
    });

    it('calls update when languageCode changed', async () => {
      const existing = mockUser({ languageCode: 'uk' });
      userService.findByTelegramId.mockResolvedValue(existing);
      userService.update.mockResolvedValue(mockUser());

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(userService.update).toHaveBeenCalledWith(
        existing.id,
        expect.objectContaining({ languageCode: 'en' }),
      );
    });

    it('sets ctx.user to the updated user', async () => {
      const existing = mockUser({ name: 'Old Name' });
      const updated = mockUser({ name: 'Test User' });
      userService.findByTelegramId.mockResolvedValue(existing);
      userService.update.mockResolvedValue(updated);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(ctx.user).toBe(updated);
    });

    it('calls next() after updating', async () => {
      const existing = mockUser({ name: 'Old Name' });
      userService.findByTelegramId.mockResolvedValue(existing);
      userService.update.mockResolvedValue(mockUser());

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });
});
