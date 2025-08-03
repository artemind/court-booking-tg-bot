import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import { StartBookingHandler } from './start-booking.handler';
import { BookingService } from '../../services/booking.service';

export class ChooseDurationHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action(/^BOOKING_CHOOSE_DURATION_(\d+)$/, async (ctx: Context): Promise<void> => {
      if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.date || !ctx.session.bookingData?.time) {
        ctx.reply('An error occurred. Please try again');
        await new StartBookingHandler(this.bot, this.courtService).show(ctx);

        return;
      }
      const selectedDuration = parseInt(ctx.match[1] || '');
      //todo get only available slots based on bookings
      const availableDurations = this.bookingSlotService.generateDurations();
      if (!availableDurations.includes(selectedDuration)) {
        //todo
        return;
      }
      //todo validate all booking data and check slots available
      //todo store booking
    });
  }
}