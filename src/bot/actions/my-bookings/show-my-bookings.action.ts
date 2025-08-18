import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingService } from '../../services/booking.service';
import { ShowMyBookingsMessage } from '../../messages/my-bookings/show-my-bookings.message';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowMyBookingsAction {
  constructor(
    @inject(BookingService)
    private bookingService: BookingService,
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    const bookings = await this.bookingService.getUpcomingByUserId(ctx.user!.id);

    if (reply) {
      return ShowMyBookingsMessage.reply(ctx, bookings);
    }

    return ShowMyBookingsMessage.editMessageText(ctx, bookings);
  }
}