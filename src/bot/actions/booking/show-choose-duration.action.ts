import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { Booking } from '../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import { ChooseDurationMessage } from '../../messages/booking/choose-duration.message';
import { ShowChooseTimeAction } from './show-choose-time.action';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowChooseDurationAction {
  constructor(
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseTimeAction)
    private showChooseTimeAction: ShowChooseTimeAction,
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.date || !ctx.session.bookingData?.dateAndTime) {
      return this.showChooseTimeAction.run(ctx, reply);
    }
    const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.date);

    if (reply) {
      return ChooseDurationMessage.reply(ctx, this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings));
    }

    return ChooseDurationMessage.editMessageText(ctx, this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings));
  }
}