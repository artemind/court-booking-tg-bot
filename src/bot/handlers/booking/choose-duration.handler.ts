import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import { BookingSlotService } from '../../services/booking-slot.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../../generated/prisma';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import dayjs from 'dayjs';
import { ShowChooseCourtAction } from '../../actions/booking/show-choose-court.action';
import type { Message } from 'telegraf/types';
import { ShowChooseTimeAction } from '../../actions/booking/show-choose-time.action';
import { ContextManager } from '../../context.manager';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ChooseDurationHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
    @inject(ShowChooseTimeAction)
    private showChooseTimeAction: ShowChooseTimeAction,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_DURATION_BACK', async (ctx: Context): Promise<true | Message.TextMessage> => {
      ContextManager.clearTimeSelection(ctx);

      return this.showChooseTimeAction.run(ctx, false);
    });

    this.bot.action(/^BOOKING_CHOOSE_DURATION_(\d+)$/, async (ctx: Context): Promise<true | Message.TextMessage> => {
      if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.dateAndTime) {
        await ctx.reply(ctx.i18n.t('exceptions.an_error_occurred'));

        return this.showChooseCourtAction.run(ctx, true);
      }
      const selectedDuration = parseInt(ctx.match[1] || '');
      const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.dateAndTime);
      const availableDurations = this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings);

      if (ctx.session.bookingData.dateAndTime.isBefore(dayjs(), 'day') || !availableDurations.includes(selectedDuration)) {
        await ctx.reply(ctx.i18n.t('errors.cannot_create_booking_with_selected_parameters'));

        return this.showChooseCourtAction.run(ctx, true);
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

      return ctx.editMessageText(`📌 ${ctx.i18n.t('booking_created')}\n` + BookingSummaryFormatter.format(ctx.i18n, bookingData), {
        parse_mode: 'Markdown',
      });
    });
  }
}