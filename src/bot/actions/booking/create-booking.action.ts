import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingService } from '../../services/booking.service';
import { BookingSlotService } from '../../services/booking-slot.service';
import { BookingSummaryFormatter } from '../../formatters/booking-summary.formatter';
import { SlotConflictException } from '../../exceptions/slot-conflict.exception';
import { ShowChooseCourtAction } from './show-choose-court.action';
import { Booking } from '../../../generated/prisma';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import dayjs from 'dayjs';

@injectable()
@provide()
export class CreateBookingAction {
  constructor(
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
  ) {}

  async run(ctx: Context, selectedDuration: number | null): Promise<true | Message.TextMessage> {
    if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.dateAndTime) {
      await ctx.reply(ctx.i18n.t('exceptions.an_error_occurred'));
      return this.showChooseCourtAction.run(ctx, true);
    }

    const bookings: Booking[] = await this.bookingService.getByDate(
      ctx.session.bookingData.courtId,
      ctx.session.bookingData.dateAndTime,
    );
    const availableDurations = this.bookingSlotService.generateAvailableDurations(
      ctx.session.bookingData.dateAndTime,
      bookings,
    );

    if (
      ctx.session.bookingData.dateAndTime.isBefore(dayjs(), 'day') ||
      selectedDuration === null ||
      !availableDurations.includes(selectedDuration)
    ) {
      await ctx.reply(ctx.i18n.t('errors.cannot_create_booking_with_selected_parameters'));
      return this.showChooseCourtAction.run(ctx, true);
    }

    ctx.session.bookingData.duration = selectedDuration;
    try {
      await this.bookingService.createIfAvailable(
        ctx.session.bookingData.courtId,
        ctx.user!.id,
        ctx.session.bookingData.dateAndTime.toDate(),
        ctx.session.bookingData.dateAndTime.add(selectedDuration, 'minute').toDate(),
      );
    } catch (e) {
      if (e instanceof SlotConflictException) {
        await ctx.reply(ctx.i18n.t('errors.cannot_create_booking_with_selected_parameters'));
        return this.showChooseCourtAction.run(ctx, true);
      }
      throw e;
    }

    const bookingData = ctx.session.bookingData;
    ctx.session.bookingData = {};

    return ctx.editMessageText(`📌 ${ctx.i18n.t('booking_created')}\n` + BookingSummaryFormatter.format(ctx.i18n, bookingData), {
      parse_mode: 'Markdown',
    });
  }
}
