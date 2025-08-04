import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { MY_BOOKINGS } from '../../keyboards/main-menu.items';
import type { Message } from 'telegraf/types';
import { BookingService } from '../../services/booking.service';
import dayjs from 'dayjs';
import { ShowMyBookingsMessage } from '../../messages/my-bookings/show-my-bookings.message';

export class ShowMyBookingsHandler {
  constructor(
    private bot: Telegraf<Context>,
    private bookingService: BookingService,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(MY_BOOKINGS, async (ctx: Context): Promise<true | Message.TextMessage> => {
      const bookings = await this.bookingService.getUpcomingByUserId(ctx.user!.id, dayjs.tz());

      return ShowMyBookingsMessage.reply(ctx, bookings);
    });
  }
}