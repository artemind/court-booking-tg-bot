import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { Booking } from '../../../generated/prisma';
import { BookingService } from '../../services/booking.service';
import { ChooseTimeMessage } from '../../messages/booking/choose-time.message';
import { ShowChooseDateAction } from './show-choose-date.action';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowChooseTimeAction {
  constructor(
    @inject(BookingService)
    private bookingService: BookingService,
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseDateAction)
    private showChooseDateAction: ShowChooseDateAction,
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    const courtId = ctx.session.bookingData?.courtId;
    const date = ctx.session.bookingData?.date;
    if (!courtId || !date) {
      return this.showChooseDateAction.run(ctx, reply);
    }

    const bookings: Booking[] = await this.bookingService.getByDate(courtId, date);
    const timeSlots = this.bookingSlotService.generateAvailableTimeSlots(date, bookings);

    if (reply) {
      return ChooseTimeMessage.reply(ctx, timeSlots);
    }

    return ChooseTimeMessage.editMessageText(ctx, timeSlots);
  }
}