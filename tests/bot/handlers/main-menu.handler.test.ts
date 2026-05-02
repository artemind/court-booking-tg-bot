import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainMenuHandler } from '../../../src/bot/handlers/main-menu.handler';
import { createMockContext } from '../../helpers/create-mock-context';

function makeHandler() {
  let hearsCb: Function | undefined;
  const bot = { hears: vi.fn((_, cb) => { hearsCb = cb; }) };

  const handler = new MainMenuHandler(bot as any);
  const getCb = () => hearsCb!;

  return { handler, bot, getCb };
}

describe('MainMenuHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers one hears handler on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.hears).toHaveBeenCalledOnce();
  });

  describe('hears callback', () => {
    it('calls ctx.reply with moved_to_main_menu i18n key', async () => {
      const { handler, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb()(ctx);

      const [text] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(text).toContain('moved_to_main_menu');
    });

    it('includes a reply keyboard in the options', async () => {
      const { handler, getCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await getCb()(ctx);

      const [, keyboard] = (ctx.reply as ReturnType<typeof vi.fn>).mock.calls[0]!;
      expect(keyboard).toBeDefined();
      expect(keyboard.reply_markup).toBeDefined();
    });
  });
});
