import { describe, it, expect, vi } from 'vitest';
import { RestrictAccessMiddleware } from '../../../src/bot/middlewares/restrict-access.middleware';
import { UserNotFoundException } from '../../../src/bot/exceptions/user-not-found.exception';
import { AccessRestrictedException } from '../../../src/bot/exceptions/access-restricted.exception';
import { createMockContext } from '../../helpers/create-mock-context';
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

describe('RestrictAccessMiddleware', () => {
  const middleware = new RestrictAccessMiddleware().middleware();
  const next = vi.fn().mockResolvedValue(undefined);

  it('throws UserNotFoundException when ctx.user is not set', async () => {
    const ctx = createMockContext();
    // user is undefined by default in createMockContext
    await expect(middleware(ctx, next)).rejects.toBeInstanceOf(UserNotFoundException);
  });

  it('UserNotFoundException message is the i18n key', async () => {
    const ctx = createMockContext();
    await expect(middleware(ctx, next)).rejects.toThrow('exceptions.user_not_found');
  });

  it('throws AccessRestrictedException when user.isAccessRestricted is true', async () => {
    const ctx = createMockContext({ user: mockUser({ isAccessRestricted: true }) });
    await expect(middleware(ctx, next)).rejects.toBeInstanceOf(AccessRestrictedException);
  });

  it('AccessRestrictedException message is the i18n key', async () => {
    const ctx = createMockContext({ user: mockUser({ isAccessRestricted: true }) });
    await expect(middleware(ctx, next)).rejects.toThrow('exceptions.access_restricted');
  });

  it('calls next() for a normal unrestricted user', async () => {
    next.mockClear();
    const ctx = createMockContext({ user: mockUser() });
    await middleware(ctx, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
