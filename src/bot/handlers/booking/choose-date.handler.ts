import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import dayjs from 'dayjs';
import { InvalidDateSelectedException } from '../../exceptions/invalid-date-selected.exception';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';
import { ShowChooseTimeAction } from '../../actions/booking/show-choose-time.action';
import { ContextManager } from '../../context.manager';
import { inject, injectable } from 'inversify';
import { IHandler } from '../handler.interface';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ChooseDateHandler implements IHandler{
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
    @inject(ShowChooseTimeAction)
    private showChooseTimeAction: ShowChooseTimeAction,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_DATE_BACK', async (ctx: Context): Promise<true | Message.TextMessage> => {
      ContextManager.resetBookingData(ctx);

      return this.showChooseCourtAction.run(ctx, false);
    });

    this.bot.action(/^BOOKING_CHOOSE_DATE_(\d{13})$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      if (!ctx.session.bookingData?.courtId) {
        await ctx.reply(ctx.i18n.t('exceptions.an_error_occurred'));

        return this.showChooseCourtAction.run(ctx, true);
      }
      const selectedDate = dayjs.utc(parseInt(ctx.match[1] || '')).startOf('day');
      const availableDates = this.bookingSlotService.generateDateSlots().map(date => date.format('DD-MM-YYYY'));
      if (!availableDates.includes(selectedDate.format('DD-MM-YYYY'))) {
        throw new InvalidDateSelectedException(ctx.i18n);
      }
      ctx.session.bookingData.date = selectedDate;

      return this.showChooseTimeAction.run(ctx, false);
    });
  }
}