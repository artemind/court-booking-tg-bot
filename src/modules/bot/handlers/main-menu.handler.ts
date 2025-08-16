import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import type { Message } from 'telegraf/types';
import { match } from '@edjopato/telegraf-i18n';

export class MainMenuHandler {
  constructor(private bot: Telegraf<Context>) {}

  register(): void {
    this.bot.hears(match('keyboards.main_menu'), async (ctx: Context): Promise<Message.TextMessage> => {
      return ctx.reply(ctx.i18n.t('moved_to_main_menu'), MainMenuKeyboard.build(ctx.i18n));
    });
  }
}