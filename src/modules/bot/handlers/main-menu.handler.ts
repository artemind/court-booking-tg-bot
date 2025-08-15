import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { MAIN_MENU } from '../keyboards/main-menu.items';
import type { Message } from 'telegraf/types';

export class MainMenuHandler {
  constructor(private bot: Telegraf<Context>) {}

  register(): void {
    this.bot.hears(MAIN_MENU, async (ctx: Context): Promise<Message.TextMessage> => {
      return ctx.reply('You have been moved to the Main Menu', MainMenuKeyboard.build());
    });
  }
}