import { session, Telegraf } from 'telegraf';
import { StartHandler } from './handlers/start.handler';
import { Context } from './context';
import { AppendUserMiddleware } from './middlewares/append-user.middleware';
import { ReplyableException } from './exceptions/replyable.exception';
import { RestrictAccessMiddleware } from './middlewares/restrict-access.middleware';
import { StartBookingHandler } from './handlers/booking/start-booking.handler';
import { ChooseCourtHandler } from './handlers/booking/choose-court.handler';
import { StartSessionMiddleware } from './middlewares/start-session.middleware';
import { ChooseDateHandler } from './handlers/booking/choose-date.handler';
import { ChooseTimeHandler } from './handlers/booking/choose-time.handler';
import { ChooseDurationHandler } from './handlers/booking/choose-duration.handler';
import { ShowMyBookingsHandler } from './handlers/my-bookings/show-my-bookings.handler';
import { CancelMyBookingHandler } from './handlers/my-bookings/cancel-my-booking.handler';
import { ShowNotificationPreferencesHandler } from './handlers/notification-preferences/show-notification-preferences.handler';
import { MainMenuHandler } from './handlers/main-menu.handler';
import { ConfigureNotificationPreferencesHandler } from './handlers/notification-preferences/configure-notification-preferences.handler';
import { CronHandler } from './handlers/cron.handler';
import { I18n } from '@edjopato/telegraf-i18n';
import path from 'path';
import { injectable, Container } from 'inversify';
import { IHandlerConstructor } from './handlers/handler.interface';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class Bot {
  private bot: Telegraf<Context>;

  private locale: string;

  private handlers: IHandlerConstructor[] = [
    StartHandler,
    MainMenuHandler,
    StartBookingHandler,
    ChooseCourtHandler,
    ChooseDateHandler,
    ChooseTimeHandler,
    ChooseDurationHandler,
    ShowMyBookingsHandler,
    CancelMyBookingHandler,
    ShowNotificationPreferencesHandler,
    ConfigureNotificationPreferencesHandler,
    CronHandler,
  ];

  constructor(private container: Container) {
    this.bot = this.container.get<Telegraf<Context>>(Telegraf);
    this.locale = this.container.get<string>('APP_LOCALE');
  }

  async launch(): Promise<void> {
    this.registerMiddlewares();
    await this.registerErrorHandler();
    await this.registerHandlers();
    await this.bot.launch();
  }

  private async registerErrorHandler(): Promise<void> {
    this.bot.catch((err, ctx) => {
      console.error(err);
      if (err instanceof ReplyableException) {
        ctx.reply(`${ctx.i18n.t('exceptions.oops')}: ${err.message}`);
      } else {
        ctx.reply(ctx.i18n.t('exceptions.oops'));
      }
    });
  }

  private registerMiddlewares(): void {
    this.bot.use(session());
    const i18n = new I18n({
      defaultLanguage: process.env.APP_LOCALE || 'en',
      allowMissing: true,
      directory: path.join(__dirname, '..', '..', 'locales')
    });
    this.container.bind<I18n>(I18n).toConstantValue(i18n);
    this.bot.use(i18n.middleware());
    this.bot.use(this.container.get<StartSessionMiddleware>(StartSessionMiddleware).middleware());
    this.bot.use(this.container.get<AppendUserMiddleware>(AppendUserMiddleware).middleware());
    this.bot.use(this.container.get<RestrictAccessMiddleware>(RestrictAccessMiddleware).middleware());
  }

  private async registerHandlers(): Promise<void> {
    for(const handler of this.handlers) {
      await this.container.get(handler).register();
    }
  }
}