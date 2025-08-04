import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../../../generated/prisma';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import dayjs from 'dayjs';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';
import { ShowChooseTimeAction } from '../../actions/booking/show-choose-time.action';
import { ContextManager } from '../../context.manager';

export class ChooseDurationHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_DURATION_BACK', async (ctx: Context): Promise<true | Message.TextMessage> => {
      ContextManager.clearTimeSelection(ctx);

      return new ShowChooseTimeAction(this.bookingService, this.bookingSlotService, this.courtService).run(ctx, false);
    });

    this.bot.action(/^BOOKING_CHOOSE_DURATION_(\d+)$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.dateAndTime) {
        await ctx.reply('An error occurred. Please try again');

        return new ShowChooseCourtAction(this.courtService).run(ctx, true);
      }
      const selectedDuration = parseInt(ctx.match[1] || '');
      const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.dateAndTime);
      const availableDurations = this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings);

      if (ctx.session.bookingData.dateAndTime.isBefore(dayjs(), 'day') || !availableDurations.includes(selectedDuration)) {
        await ctx.reply('Booking with selected parameters unavailable. Please try again');

        return new ShowChooseCourtAction(this.courtService).run(ctx, true);
      }

      ctx.session.bookingData.duration = selectedDuration;
      await this.bookingService.create({
        user: {
          connect: {
            id: ctx.user!.id,
          }
        },
        court: {
          connect: {
            id: ctx.session.bookingData.courtId,
          }
        },
        dateFrom: ctx.session.bookingData.dateAndTime.toDate(),
        dateTill: ctx.session.bookingData.dateAndTime.add(selectedDuration, 'minute').toDate(),
      });
      const bookingData = ctx.session.bookingData;
      ctx.session.bookingData = {};

      return ctx.editMessageText('Booking created successfully\n' + BookingSummaryFormatter.format(bookingData), {
        parse_mode: 'Markdown',
      });
    });
  }
}