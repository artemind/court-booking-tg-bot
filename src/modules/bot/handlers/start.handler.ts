import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';

export class StartHandler {
  constructor(private bot: Telegraf<Context>) {}

  register(): void {
    this.bot.start(async (ctx: Context) => {
       await ctx.reply(`Hi, ${ctx.user!.name}! This bot was created by Artem Y. https://artemind.dev`, MainMenuKeyboard.build());
    });
  }
}