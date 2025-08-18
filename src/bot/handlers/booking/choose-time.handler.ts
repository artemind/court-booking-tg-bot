import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { Booking } from '../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import dayjs from 'dayjs';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';
import { ShowChooseTimeAction } from '../../actions/booking/show-choose-time.action';
import { ContextManager } from '../../context.manager';
import { ShowChooseDateAction } from '../../actions/booking/show-choose-date.action';
import { ShowChooseDurationAction } from '../../actions/booking/show-choose-duration.action';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ChooseTimeHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
    @inject(ShowChooseDateAction)
    private showChooseDateAction: ShowChooseDateAction,
    @inject(ShowChooseTimeAction)
    private showChooseTimeAction: ShowChooseTimeAction,
    @inject(ShowChooseDurationAction)
    private showChooseDurationAction: ShowChooseDurationAction,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_TIME_BACK', async (ctx: Context): Promise<true | Message.TextMessage> => {
      ContextManager.clearDateSelection(ctx);

      return this.showChooseDateAction.run(ctx, false);
    });

    this.bot.action(/^BOOKING_CHOOSE_TIME_(\d{2}:\d{2})$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.date) {
        await ctx.reply(ctx.i18n.t('exceptions.an_error_occurred'));

        return this.showChooseCourtAction.run(ctx, true);
      }
      const selectedTime = ctx.match[1]!;
      const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.date);
      const availableTimeSlots = this.bookingSlotService.generateAvailableTimeSlots(ctx.session.bookingData.date, bookings);
      if (!availableTimeSlots.includes(selectedTime)) {
        await ctx.reply(ctx.i18n.t('errors.selected_time_already_booked'));

        return this.showChooseTimeAction.run(ctx, true);
      }
      ctx.session.bookingData.time = selectedTime;
      ctx.session.bookingData.dateAndTime = dayjs.tz(ctx.session.bookingData.date.format('YYYY-MM-DD') + 'T' + ctx.session.bookingData.time).startOf('minute').utc();

      return this.showChooseDurationAction.run(ctx, false);
    });
  }
}