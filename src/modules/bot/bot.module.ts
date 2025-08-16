import type { Module } from '../module.interface';
import { PrismaClient } from '../../generated/prisma';
import { session, Telegraf } from 'telegraf';
import { StartHandler } from './handlers/start.handler';
import { Context } from './context';
import { AppendUserMiddleware } from './middlewares/append-user.middleware';
import { UserService } from './services/user.service';
import { ReplyableException } from './exceptions/replyable.exception';
import { RestrictAccessMiddleware } from './middlewares/restrict-access.middleware';
import { StartBookingHandler } from './handlers/booking/start-booking.handler';
import { CourtService } from './services/court.service';
import { ChooseCourtHandler } from './handlers/booking/choose-court.handler';
import { StartSessionMiddleware } from './middlewares/start-session.middleware';
import { BookingSlotService } from './services/booking-slot.service';
import { ChooseDateHandler } from './handlers/booking/choose-date.handler';
import { ChooseTimeHandler } from './handlers/booking/choose-time.handler';
import { BookingService } from './services/booking.service';
import { ChooseDurationHandler } from './handlers/booking/choose-duration.handler';
import { ShowMyBookingsHandler } from './handlers/my-bookings/show-my-bookings.handler';
import { CancelMyBookingHandler } from './handlers/my-bookings/cancel-my-booking.handler';
import { ShowNotificationPreferencesHandler } from './handlers/notification-preferences/show-notification-preferences.handler';
import { MainMenuHandler } from './handlers/main-menu.handler';
import {
  ConfigureNotificationPreferencesHandler
} from './handlers/notification-preferences/configure-notification-preferences.handler';
import { CronHandler } from './handlers/cron.handler';
import { I18n } from '@edjopato/telegraf-i18n';
import path from 'path';

export class BotModule implements Module {

  private bot: Telegraf<Context>;

  private userService: UserService;

  private courtService: CourtService;

  private bookingService: BookingService;

  private bookingSlotService: BookingSlotService;

  constructor(private prisma: PrismaClient) {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error('BOT_TOKEN is not defined');
    this.bot = new Telegraf(token);
    this.userService = new UserService(this.prisma);
    this.courtService = new CourtService(this.prisma);
    this.bookingSlotService = new BookingSlotService(
      process.env.BOOKING_AVAILABLE_FROM_TIME || '07:00',
      process.env.BOOKING_AVAILABLE_TO_TIME || '23:59',
      parseInt(process.env.BOOKING_SLOT_SIZE_IN_MINUTES || '30'),
      parseInt(process.env.BOOKING_MIN_DURATION_MINUTES || '30'),
      parseInt(process.env.BOOKING_MAX_DURATION_MINUTES || '180'),
    );
    this.bookingService = new BookingService(this.prisma);
  }

  async launch(): Promise<void> {
    this.registerMiddlewares();
    await this.registerErrorHandler();
    await this.registerHandlers();
    await this.bot.launch();
  }

  async registerErrorHandler(): Promise<void> {
    this.bot.catch((err, ctx) => {
      console.error(err);
      if (err instanceof ReplyableException) {
        ctx.reply(`${ctx.i18n.t('exceptions.oops')}: ${err.message}`);
      } else {
        ctx.reply(ctx.i18n.t('exceptions.oops'));
      }
    });
  }

  registerMiddlewares(): void {
    this.bot.use(session());
    const i18n = new I18n({
      defaultLanguage: process.env.APP_LOCALE || 'en',
      allowMissing: true,
      directory: path.join(__dirname, '..', '..', '..', 'locales')
    });
    this.bot.use(i18n.middleware());
    this.bot.use(new StartSessionMiddleware().apply);
    this.bot.use(new AppendUserMiddleware(this.userService).apply);
    this.bot.use(new RestrictAccessMiddleware().apply);
  }

  async registerHandlers(): Promise<void> {
    new StartHandler(this.bot).register();
    new MainMenuHandler(this.bot).register();
    await new StartBookingHandler(this.bot, this.courtService).register();
    await new ChooseCourtHandler(this.bot, this.courtService, this.bookingSlotService).register();
    await new ChooseDateHandler(this.bot, this.courtService, this.bookingService, this.bookingSlotService).register();
    await new ChooseTimeHandler(this.bot, this.courtService, this.bookingService, this.bookingSlotService).register();
    await new ChooseDurationHandler(this.bot, this.courtService, this.bookingService, this.bookingSlotService).register();
    await new ShowMyBookingsHandler(this.bot, this.bookingService).register();
    await new CancelMyBookingHandler(this.bot, this.bookingService).register();
    await new ShowNotificationPreferencesHandler(this.bot).register();
    await new ConfigureNotificationPreferencesHandler(this.bot, this.userService).register();
    await new CronHandler(this.bot, this.bookingService).register();
  }
}