import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import { ChooseTimeMessage } from '../../messages/booking/choose-time.message';
import { Booking } from '../../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import { ChooseDurationMessage } from '../../messages/booking/choose-duration.message';
import dayjs from 'dayjs';
import { ChooseDateMessage } from '../../messages/booking/choose-date.message';
import { ChooseCourtView } from '../../views/booking/choose-court.view';
import type { Message } from 'telegraf/types';

export class ChooseTimeHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_TIME_BACK', async (ctx: Context): Promise<void> => {
      delete ctx.session.bookingData!.date;
      await ChooseDateMessage.editMessageText(ctx, this.bookingSlotService.generateDateSlots().map(date => date.toDate()));
    });

    this.bot.action(/^BOOKING_CHOOSE_TIME_(\d{2}:\d{2})$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.date) {
        await ctx.reply('An error occurred. Please try again');

        return new ChooseCourtView(this.courtService).show(ctx);
      }
      const selectedTime = ctx.match[1]!;
      const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.date);
      const availableTimeSlots = this.bookingSlotService.generateAvailableTimeSlots(ctx.session.bookingData.date, bookings);
      if (!availableTimeSlots.includes(selectedTime)) {
        await ctx.reply('Selected time already booked. Please choose another time.');

        return ChooseTimeMessage.reply(ctx, availableTimeSlots);
      }
      ctx.session.bookingData.time = selectedTime;
      ctx.session.bookingData.dateAndTime = dayjs.tz(ctx.session.bookingData.date.format('YYYY-MM-DD') + 'T' + ctx.session.bookingData.time).startOf('minute').utc();

      return ChooseDurationMessage.editMessageText(ctx, this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings));
    });
  }
}