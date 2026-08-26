import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { parseIntSafe } from '../../../utils/parse.utils';
import type { Message } from 'telegraf/types';
import { ShowChooseTimeAction } from '../../actions/booking/show-choose-time.action';
import { ContextManager } from '../../context.manager';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import { CreateBookingAction } from '../../actions/booking/create-booking.action';

@injectable()
@provide()
export class ChooseDurationHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(CreateBookingAction)
    private createBookingAction: CreateBookingAction,
    @inject(ShowChooseTimeAction)
    private showChooseTimeAction: ShowChooseTimeAction,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_DURATION_BACK', async (ctx: Context): Promise<true | Message.TextMessage> => {
      ContextManager.clearTimeSelection(ctx);
      return this.showChooseTimeAction.run(ctx, false);
    });

    this.bot.action(/^BOOKING_CHOOSE_DURATION_(\d+)$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      const selectedDuration = parseIntSafe(ctx.match[1]);
      return this.createBookingAction.run(ctx, selectedDuration);
    });
  }
}
