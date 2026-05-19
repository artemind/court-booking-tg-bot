import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { BookingSlotService } from '../../services/booking-slot.service';
import { ShowChooseCourtAction } from './show-choose-court.action';
import { ShowChooseTimeAction } from './show-choose-time.action';
import { InvalidDateSelectedException } from '../../exceptions/invalid-date-selected.exception';
import { parseIntSafe } from '../../../utils/parse.utils';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';
import dayjs from 'dayjs';

@injectable()
@provide()
export class ChooseDateAction {
  constructor(
    @inject(BookingSlotService)
    private bookingSlotService: BookingSlotService,
    @inject(ShowChooseCourtAction)
    private showChooseCourtAction: ShowChooseCourtAction,
    @inject(ShowChooseTimeAction)
    private showChooseTimeAction: ShowChooseTimeAction,
  ) {}

  async run(ctx: Context, timestampStr: string | undefined): Promise<true | Message.TextMessage> {
    if (!ctx.session.bookingData?.courtId) {
      await ctx.reply(ctx.i18n.t('exceptions.an_error_occurred'));
      return this.showChooseCourtAction.run(ctx, true);
    }

    const timestamp = parseIntSafe(timestampStr);
    if (timestamp === null) throw new InvalidDateSelectedException(ctx.i18n);

    const selectedDate = dayjs.utc(timestamp).startOf('day');
    const availableDates = this.bookingSlotService.generateDateSlots().map(date => date.format('DD-MM-YYYY'));
    if (!availableDates.includes(selectedDate.format('DD-MM-YYYY'))) {
      throw new InvalidDateSelectedException(ctx.i18n);
    }

    ctx.session.bookingData.date = selectedDate;
    return this.showChooseTimeAction.run(ctx, false);
  }
}
