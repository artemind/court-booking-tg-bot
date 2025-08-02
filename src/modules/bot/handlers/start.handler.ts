import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';

export class StartHandler {
  constructor(private bot: Telegraf<Context>) {}

  register(): void {
    this.bot.start((ctx: Context) => {
      ctx.reply(`Hi, ${ctx.user!.name}!`, MainMenuKeyboard.build());
    });
  }
}