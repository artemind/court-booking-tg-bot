import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import { StartBookingHandler } from './start-booking.handler';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../../../generated/prisma';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';

export class ChooseDurationHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action(/^BOOKING_CHOOSE_DURATION_(\d+)$/, async (ctx: Context): Promise<void> => {
      if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.dateAndTime) {
        ctx.reply('An error occurred. Please try again');
        await new StartBookingHandler(this.bot, this.courtService).show(ctx);

        return;
      }
      const selectedDuration = parseInt(ctx.match[1] || '');
      const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.dateAndTime);
      const availableDurations = this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings);
      if (!availableDurations.includes(selectedDuration)) {
        //todo
        console.error('Selected duration already booked. Please choose another duration.');
        return;
      }
      //todo validate all booking data and check slots available
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
      ctx.editMessageText('Booking created successfully\n' + BookingSummaryFormatter.format(bookingData), {
        parse_mode: 'Markdown',
      });
    });
  }
}