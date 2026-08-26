import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { ContextManager } from '../../context.manager';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import { ChooseDateAction } from '../../actions/booking/choose-date.action';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ChooseDateHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(ChooseDateAction)
    private chooseDateAction: ChooseDateAction,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_DATE_BACK', (ctx: Context): Promise<true | Message.TextMessage> => {
      ContextManager.resetBookingData(ctx);
      return this.showChooseCourtAction.run(ctx, false);
    });

    this.bot.action(/^BOOKING_CHOOSE_DATE_(\d{13})$/, (ctx: Context): Promise<true | Message.TextMessage> =>
      this.chooseDateAction.run(ctx, ctx.match[1]),
    );
  }
}
