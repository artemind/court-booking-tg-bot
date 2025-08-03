import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import { StartBookingHandler } from './start-booking.handler';
import dayjs from 'dayjs';
import { InvalidDateSelectedException } from '../../exceptions/invalid-date-selected.exception';
import { ChooseTimeMessage } from '../../messages/booking/choose-time.message';
import { Booking } from '../../../../generated/prisma';
import { BookingService } from '../../services/booking.service';

export class ChooseDateHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action(/^BOOKING_CHOOSE_DATE_(\d{13})$/, async (ctx: Context): Promise<void> => {
      if (!ctx.session.bookingData?.courtId) {
        ctx.reply('An error occurred. Please try again');
        await new StartBookingHandler(this.bot, this.courtService).show(ctx);

        return;
      }
      const selectedDate = dayjs(parseInt(ctx.match[1] || '')).startOf('day');
      const availableDates = this.bookingSlotService.generateDateSlots().map(date => date.format('DD-MM-YYYY'));
      if (!availableDates.includes(selectedDate.format('DD-MM-YYYY'))) {
        throw new InvalidDateSelectedException;
      }
      ctx.session.bookingData.date = selectedDate;
      const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, selectedDate);
      const timeSlots = await this.bookingSlotService.generateAvailableTimeSlots(selectedDate, bookings);
      ChooseTimeMessage.editMessageText(ctx, timeSlots);
    });
  }
}