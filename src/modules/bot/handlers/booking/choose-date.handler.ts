import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { CourtService } from '../../services/court.service';
import dayjs from 'dayjs';
import { InvalidDateSelectedException } from '../../exceptions/invalid-date-selected.exception';
import { BookingService } from '../../services/booking.service';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';
import { ShowChooseTimeAction } from '../../actions/booking/show-choose-time.action';
import { ShowChooseDateAction } from '../../actions/booking/show-choose-date.action';

export class ChooseDateHandler {
  constructor(
    private bot: Telegraf<Context>,
    private courtService: CourtService,
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_DATE_BACK', async (ctx: Context): Promise<true | Message.TextMessage> => {
      ctx.session.bookingData = {};

      return new ShowChooseDateAction(this.bookingSlotService).run(ctx);
    });

    this.bot.action(/^BOOKING_CHOOSE_DATE_(\d{13})$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      if (!ctx.session.bookingData?.courtId) {
        await ctx.reply('An error occurred. Please try again');

        return new ShowChooseCourtAction(this.courtService).run(ctx, true);
      }
      const selectedDate = dayjs.utc(parseInt(ctx.match[1] || '')).startOf('day');
      const availableDates = this.bookingSlotService.generateDateSlots().map(date => date.format('DD-MM-YYYY'));
      if (!availableDates.includes(selectedDate.format('DD-MM-YYYY'))) {
        throw new InvalidDateSelectedException;
      }
      ctx.session.bookingData.date = selectedDate;

      return new ShowChooseTimeAction(this.bookingService, this.bookingSlotService).run(
        ctx,
        ctx.session.bookingData.courtId,
        selectedDate,
      );
    });
  }
}