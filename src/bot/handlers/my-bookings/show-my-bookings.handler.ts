import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { ShowMyBookingsAction } from '../../actions/my-bookings/show-my-bookings.action';
import { match } from '@edjopato/telegraf-i18n';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ShowMyBookingsHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(ShowMyBookingsAction)
    private showMyBookingsAction: ShowMyBookingsAction,
  ) {}

  async register(): Promise<void> {
    this.bot.hears(match('keyboards.main.my_bookings'), async (ctx: Context): Promise<true | Message.TextMessage> => {
      return this.showMyBookingsAction.run(ctx, true);
    });
  }
}