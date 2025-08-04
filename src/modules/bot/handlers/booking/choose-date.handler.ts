import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import dayjs from 'dayjs';
import { InvalidDateSelectedException } from '../../exceptions/invalid-date-selected.exception';
import { ChooseTimeMessage } from '../../messages/booking/choose-time.message';
import { Booking } from '../../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import { ChooseCourtMessage } from '../../messages/booking/choose-court.message';
import { ChooseCourtView } from '../../views/booking/choose-court.view';

export class ChooseDateHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_DATE_BACK', async (ctx: Context): Promise<void> => {
      ctx.session.bookingData = {};
      await ChooseCourtMessage.editMessageText(ctx, await this.courtService.all());
    });

    this.bot.action(/^BOOKING_CHOOSE_DATE_(\d{13})$/, async (ctx: Context): Promise<void> => {
      return this.show(ctx);
    });
  }

  async show(ctx: Context): Promise<void> {
    if (!ctx.session.bookingData?.courtId) {
      await ctx.reply('An error occurred. Please try again');

      return new ChooseCourtView(this.courtService).show(ctx);
    }
    const selectedDate = dayjs.utc(parseInt(ctx.match[1] || '')).startOf('day');
    const availableDates = this.bookingSlotService.generateDateSlots().map(date => date.format('DD-MM-YYYY'));
    if (!availableDates.includes(selectedDate.format('DD-MM-YYYY'))) {
      throw new InvalidDateSelectedException;
    }
    ctx.session.bookingData.date = selectedDate;
    const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, selectedDate);
    const timeSlots = this.bookingSlotService.generateAvailableTimeSlots(selectedDate, bookings);
    await ChooseTimeMessage.editMessageText(ctx, timeSlots);
  }
}