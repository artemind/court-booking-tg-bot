import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';
import { match } from '@edjopato/telegraf-i18n';
import { inject, injectable } from 'inversify';
import { IHandler } from '../handler.interface';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class StartBookingHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.main.book'), async (ctx: Context): Promise<true | Message.TextMessage> => {
      return this.showChooseCourtAction.run(ctx, true);
    });
  }
}