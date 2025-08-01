import { Context, Telegraf } from 'telegraf';

export class StartHandler {
  constructor(private bot: Telegraf<Context>) {}

  register(): void {
    this.bot.start((ctx) => {
      ctx.reply('Hello world.');
    });
  }
}