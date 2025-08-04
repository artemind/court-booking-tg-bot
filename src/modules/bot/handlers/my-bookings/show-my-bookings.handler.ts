import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { MY_BOOKINGS } from '../../keyboards/main-menu.items';
import type { Message } from 'telegraf/types';
import { BookingService } from '../../services/booking.service';
import { ShowMyBookingsAction } from '../../actions/my-bookings/show-my-bookings.action';

export class ShowMyBookingsHandler {
  constructor(
    private bot: Telegraf<Context>,
    private bookingService: BookingService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(MY_BOOKINGS, async (ctx: Context): Promise<true | Message.TextMessage> => {
      return new ShowMyBookingsAction(this.bookingService).run(ctx, true);
    });
  }
}