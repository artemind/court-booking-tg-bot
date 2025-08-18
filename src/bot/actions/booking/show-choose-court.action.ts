import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { ChooseCourtMessage } from '../../messages/booking/choose-court.message';
import type { Message } from 'telegraf/types';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowChooseCourtAction {
  constructor(
    @inject(CourtService)
    private courtService: CourtService
  ) {
  }

  async run(ctx: Context, reply: boolean): Promise<true | Message.TextMessage> {
    const courts = await this.courtService.all();

    if (reply) {
      return ChooseCourtMessage.reply(ctx, courts);
    }

    return ChooseCourtMessage.editMessageText(ctx, courts);
  }
}