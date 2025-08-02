import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import { StartBookingHandler } from './start-booking.handler';
import { ChooseTimeReply } from '../../replies/booking/choose-time.reply';
import { Booking } from '../../../../generated/prisma';
import { BookingService } from '../../services/booking.service';

export class ChooseTimeHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action(/^BOOKING_CHOOSE_TIME_(\d{2}:\d{2})$/, async (ctx: Context): Promise<void> => {
      if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.date) {
        ctx.reply('An error occurred. Please try again');
        await new StartBookingHandler(this.bot, this.courtService).show(ctx);

        return;
      }
      const selectedTime = ctx.match[1]!;
      const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.date);
      const availableTimeSlots = this.bookingSlotService.generateAvailableTimeSlots(ctx.session.bookingData.date, bookings);
      if (!availableTimeSlots.includes(selectedTime)) {
        ctx.reply('Selected time already booked. Please choose another time.');
        ChooseTimeReply.reply(ctx, availableTimeSlots);
        return;
      }
      ctx.session.bookingData.time = selectedTime;
      //todo show choose duration step
    });
  }
}