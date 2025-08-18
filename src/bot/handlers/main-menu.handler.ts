import { Telegraf } from 'telegraf';
import { Context } from '../context';
import { MainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import type { Message } from 'telegraf/types';
import { match } from '@edjopato/telegraf-i18n';
import { inject, injectable } from 'inversify';
import { IHandler } from './handler.interface';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class MainMenuHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.main_menu'), async (ctx: Context): Promise<Message.TextMessage> => {
      return ctx.reply(ctx.i18n.t('moved_to_main_menu'), MainMenuKeyboard.build(ctx.i18n));
    });
  }
}