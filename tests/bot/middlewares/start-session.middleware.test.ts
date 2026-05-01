import { describe, it, expect, vi } from 'vitest';
import { StartSessionMiddleware } from '../../../src/bot/middlewares/start-session.middleware';
import { createMockContext } from '../../helpers/create-mock-context';
import type { Context } from '../../../src/bot/context';

describe('StartSessionMiddleware', () => {
  const middleware = new StartSessionMiddleware().middleware();
  const next = vi.fn().mockResolvedValue(undefined);

  it('creates session with bookingData and sessionStartsAt when session is absent', async () => {
    const ctx = createMockContext() as Context;
    // @ts-expect-error — simulating session not yet initialized
    ctx.session = undefined;

    await middleware(ctx, next);

    expect(ctx.session).toBeDefined();
    expect(ctx.session.bookingData).toEqual({});
    expect(ctx.session.sessionStartsAt).toBeInstanceOf(Date);
  });

  it('does not overwrite an existing session', async () => {
    const existingDate = new Date('2024-01-01T00:00:00Z');
    const ctx = createMockContext({
      session: { sessionStartsAt: existingDate, bookingData: { courtId: 42 } },
    });

    await middleware(ctx, next);

    expect(ctx.session.sessionStartsAt).toBe(existingDate);
    expect(ctx.session.bookingData?.courtId).toBe(42);
  });

  it('always calls next()', async () => {
    next.mockClear();
    const ctx = createMockContext();
    await middleware(ctx, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next() even when session already existed', async () => {
    next.mockClear();
    const ctx = createMockContext({ session: { sessionStartsAt: new Date(), bookingData: {} } });
    await middleware(ctx, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
