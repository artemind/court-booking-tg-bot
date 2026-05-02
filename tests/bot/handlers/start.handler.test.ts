import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartHandler } from '../../../src/bot/handlers/start.handler';
import { createMockContext } from '../../helpers/create-mock-context';
import type { User } from '../../../src/generated/prisma';

const fakeUser: User = {
  id: 7,
  telegramId: BigInt(123456),
  telegramUsername: 'testuser',
  name: 'Alice',
  languageCode: 'en',
  isAccessRestricted: false,
  notifyBeforeBookingStarts: true,
  notifyBeforeBookingEnds: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeHandler() {
  let startCb: Function | undefined;
  const bot = { start: vi.fn((cb) => { startCb = cb; }) };

  const handler = new StartHandler(bot as any);
  const getCb = () => startCb!;

  return { handler, bot, getCb };
}

describe('StartHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers a start handler on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.start).toHaveBeenCalledOnce();
  });

  describe('start callback', () => {
    it('calls ctx.reply with greeting i18n key', async () => {
      const { handler, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({ user: fakeUser });

      await getCb()(ctx);

      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('greeting');
    });

    it('passes Markdown parse_mode', async () => {
      const { handler, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({ user: fakeUser });

      await getCb()(ctx);

      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.parse_mode).toBe('Markdown');
    });

    it('includes a reply keyboard in the options', async () => {
      const { handler, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({ user: fakeUser });

      await getCb()(ctx);

      const [, opts] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(opts.reply_markup).toBeDefined();
    });
  });
});
