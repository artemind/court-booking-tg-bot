import { Context } from '../../context';
import { CourtService } from '../../services/court.service';
import { ChooseCourtMessage } from '../../messages/booking/choose-court.message';

export class ChooseCourtView {
  constructor(private courtService: CourtService) {
  }

  async show(ctx: Context): Promise<void> {
    const courts = await this.courtService.all();

    return ChooseCourtMessage.reply(ctx, courts);
  }
}