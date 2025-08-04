import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { Booking } from '../../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import { CourtService } from '../../services/court.service';
import { ChooseDurationMessage } from '../../messages/booking/choose-duration.message';
import { ShowChooseTimeAction } from './show-choose-time.action';

export class ShowChooseDurationAction {
  constructor(
    private bookingService: BookingService,
    private bookingSlotService: BookingSlotService,
    private courtService: CourtService,
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    if (!ctx.session.bookingData?.courtId || !ctx.session.bookingData?.date || !ctx.session.bookingData?.dateAndTime) {
      return new ShowChooseTimeAction(this.bookingService, this.bookingSlotService, this.courtService).run(ctx, reply);
    }
    const bookings: Booking[] = await this.bookingService.getByDate(ctx.session.bookingData.courtId, ctx.session.bookingData.date);

    if (reply) {
      return ChooseDurationMessage.reply(ctx, this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings));
    }

    return ChooseDurationMessage.editMessageText(ctx, this.bookingSlotService.generateAvailableDurations(ctx.session.bookingData.dateAndTime, bookings));
  }
}