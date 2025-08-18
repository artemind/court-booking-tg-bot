import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { inject, injectable } from 'inversify';
import { IHandler } from './handler.interface';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class StartHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>
  ) {}

  async register(): Promise<void> {
    this.bot.start(async (ctx: Context) => {
      await ctx.reply(ctx.i18n.t('greeting', { name: ctx.user!.name }), {
        ...MainMenuKeyboard.build(ctx.i18n),
        parse_mode: 'Markdown',
      });
    });
  }
}