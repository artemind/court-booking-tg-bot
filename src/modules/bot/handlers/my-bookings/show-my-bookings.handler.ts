import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingService } from '../../services/booking.service';
import { ShowMyBookingsAction } from '../../actions/my-bookings/show-my-bookings.action';
import { match } from '@edjopato/telegraf-i18n';

export class ShowMyBookingsHandler {
  constructor(
    private bot: Telegraf<Context>,
    private bookingService: BookingService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.main.my_bookings'), async (ctx: Context): Promise<true | Message.TextMessage> => {
      return new ShowMyBookingsAction(this.bookingService).run(ctx, true);
    });
  }
}