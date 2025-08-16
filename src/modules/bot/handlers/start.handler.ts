import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';

export class StartHandler {
  constructor(private bot: Telegraf<Context>) {}

  register(): void {
    this.bot.start(async (ctx: Context) => {
      await ctx.reply(ctx.i18n.t('greeting', { name: ctx.user!.name }), {
        ...MainMenuKeyboard.build(ctx.i18n),
        parse_mode: 'Markdown',
      });
    });
  }
}