import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { ChooseCourtMessage } from '../../messages/booking/choose-court.message';
import type { Message } from 'telegraf/types';

export class ShowChooseCourtAction {
  constructor(private courtService: CourtService) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    const courts = await this.courtService.all();

    if (reply) {
      return ChooseCourtMessage.reply(ctx, courts);
    }

    return ChooseCourtMessage.editMessageText(ctx, courts);
  }
}