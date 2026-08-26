import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppendUserMiddleware } from '../../../src/bot/middlewares/append-user.middleware';
import { UserNotFoundException } from '../../../src/bot/exceptions/user-not-found.exception';
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

function createMockUserService(): vi.Mocked<UserService> {
  return {
    findByTelegramId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  } as unknown as vi.Mocked<UserService>;
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
    it('throws UserNotFoundException and does not call next when ctx.from is absent', async () => {
      const ctx = createMockContext({ from: undefined } as any);
      await expect(middleware(ctx, next)).rejects.toBeInstanceOf(UserNotFoundException);
      expect(next).not.toHaveBeenCalled();
      expect(userService.upsert).not.toHaveBeenCalled();
    });

    it('throws UserNotFoundException when ctx.from has no username', async () => {
      const ctx = createMockContext({
        from: { id: 1, first_name: 'Test', is_bot: false } as any,
      });
      await expect(middleware(ctx, next)).rejects.toBeInstanceOf(UserNotFoundException);
      expect(next).not.toHaveBeenCalled();
      expect(userService.upsert).not.toHaveBeenCalled();
    });
  });

  describe('normal flow', () => {
    it('calls upsert with the user data extracted from ctx.from', async () => {
      const user = mockUser();
      userService.upsert.mockResolvedValue(user);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(userService.upsert).toHaveBeenCalledWith({
        name: 'Test User',
        telegramId: 123456,
        telegramUsername: 'testuser',
        languageCode: 'en',
      });
    });

    it('sets ctx.user to the result of upsert', async () => {
      const user = mockUser();
      userService.upsert.mockResolvedValue(user);

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(ctx.user).toBe(user);
    });

    it('calls next() after upsert succeeds', async () => {
      userService.upsert.mockResolvedValue(mockUser());

      const ctx = createMockContext();
      await middleware(ctx, next);

      expect(next).toHaveBeenCalledOnce();
    });
  });
});
