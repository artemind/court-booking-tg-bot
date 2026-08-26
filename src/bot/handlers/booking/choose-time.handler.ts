import { Telegraf } from 'telegraf';
import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { ContextManager } from '../../context.manager';
import { ShowChooseDateAction } from '../../actions/booking/show-choose-date.action';
import { ChooseTimeAction } from '../../actions/booking/choose-time.action';
import { IHandler } from '../handler.interface';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class ChooseTimeHandler implements IHandler {
  constructor(
    @inject(Telegraf)
    private bot: Telegraf<Context>,
    @inject(ChooseTimeAction)
    private chooseTimeAction: ChooseTimeAction,
    @inject(ShowChooseDateAction)
    private showChooseDateAction: ShowChooseDateAction,
  ) {}

  async register(): Promise<void> {
    this.bot.action('BOOKING_CHOOSE_TIME_BACK', (ctx: Context): Promise<true | Message.TextMessage> => {
      ContextManager.clearDateSelection(ctx);
      return this.showChooseDateAction.run(ctx, false);
    });

    this.bot.action(/^BOOKING_CHOOSE_TIME_(\d{2}:\d{2})$/, (ctx: Context): Promise<true | Message.TextMessage> =>
      this.chooseTimeAction.run(ctx, ctx.match[1]!),
    );
  }
}
