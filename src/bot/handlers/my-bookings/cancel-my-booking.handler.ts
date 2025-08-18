import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingService } from '../../services/booking.service';
import { ShowMyBookingsAction } from '../../actions/my-bookings/show-my-bookings.action';
import { Booking } from '../../../generated/prisma';
import dayjs from 'dayjs';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class CancelMyBookingHandler implements IHandler{
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(ShowMyBookingsAction)
    private showMyBookingsAction: ShowMyBookingsAction,
  ) {}

  async register(): Promise<void> {
    this.bot.action(/^CANCEL_MY_BOOKING_(\d+)$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      const bookingId = parseInt(ctx.match[1] || '');
      const booking: Booking|null = await this.bookingService.findById(bookingId);
      if (!booking) {
        return ctx.editMessageText(ctx.i18n.t('errors.booking_not_found'));
      }
      if (booking.userId !== ctx.user!.id || dayjs(booking.dateTill).isBefore(dayjs())) {
        return ctx.editMessageText(ctx.i18n.t('errors.not_authorized_to_cancel_booking'));
      }

      await this.bookingService.deleteById(bookingId);

      await this.showMyBookingsAction.run(ctx, false);

      return await ctx.reply(ctx.i18n.t('booking_cancelled'));
    });
  }
}