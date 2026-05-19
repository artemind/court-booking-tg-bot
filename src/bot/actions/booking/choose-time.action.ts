import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingService } from '../../services/booking.service';
import { BookingSlotService } from '../../services/booking-slot.service';
import { ShowChooseCourtAction } from './show-choose-court.action';
import { ShowChooseTimeAction } from './show-choose-time.action';
import { ShowChooseDurationAction } from './show-choose-duration.action';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ChooseTimeAction {
  constructor(
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
    @inject(ShowChooseTimeAction)
    private showChooseTimeAction: ShowChooseTimeAction,
    @inject(ShowChooseDurationAction)
    private showChooseDurationAction: ShowChooseDurationAction,
  ) {}

  async run(ctx: Context, selectedTime: string): Promise<true | Message.TextMessage> {
    if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.date) {
      await ctx.reply(ctx.i18n.t('exceptions.an_error_occurred'));
      return this.showChooseCourtAction.run(ctx, true);
    }

    const bookings = await this.bookingService.getByDate(
      ctx.session.bookingData.courtId,
      ctx.session.bookingData.date,
    );
    const availableSlots = this.bookingSlotService.generateAvailableTimeSlots(
      ctx.session.bookingData.date,
      bookings,
    );

    if (!availableSlots.includes(selectedTime)) {
      await ctx.reply(ctx.i18n.t('errors.selected_time_already_booked'));
      return this.showChooseTimeAction.run(ctx, true);
    }

    ctx.session.bookingData.time = selectedTime;
    return this.showChooseDurationAction.run(ctx, false);
  }
}
