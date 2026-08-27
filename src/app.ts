import { config } from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import path from 'path';
import { Container } from 'inversify';
import { PrismaClient } from './generated/prisma';
import { Bot } from './bot/bot';
import { buildProviderModule } from '@inversifyjs/binding-decorators';
import { Telegraf } from 'telegraf';
import { I18n } from '@edjopato/telegraf-i18n';
import { IBookingConfig } from './config/booking.config';
import { TOKENS } from './config/tokens';
import { AppConfig, loadAppConfig } from './config/app.config';

function configureDayjs(appConfig: AppConfig): void {
  dayjs.locale(appConfig.APP_LOCALE);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault(appConfig.APP_TIMEZONE);
}

async function buildContainer(appConfig: AppConfig): Promise<Container> {
  const container = new Container();
  container.bind<PrismaClient>(PrismaClient).toConstantValue(new PrismaClient());
  container.bind<string>(TOKENS.AppLocale).toConstantValue(appConfig.APP_LOCALE);
  container.bind<IBookingConfig>(TOKENS.BookingConfig).toConstantValue({
    availableFromTime:              appConfig.BOOKING_AVAILABLE_FROM_TIME,
    availableToTime:                appConfig.BOOKING_AVAILABLE_TO_TIME,
    slotSizeMinutes:                appConfig.BOOKING_SLOT_SIZE_IN_MINUTES,
    minDurationMinutes:             appConfig.BOOKING_MIN_DURATION_MINUTES,
    maxDurationMinutes:             appConfig.BOOKING_MAX_DURATION_MINUTES,
    daysAhead:                      appConfig.BOOKING_DAYS_AHEAD,
    minutesBeforeStartNotification: appConfig.NOTIFICATION_MINUTES_BEFORE_START,
    minutesBeforeEndNotification:   appConfig.NOTIFICATION_MINUTES_BEFORE_END,
  });
  container.bind<Telegraf>(Telegraf).toConstantValue(new Telegraf(appConfig.BOT_TOKEN));
  container.bind<I18n>(I18n).toConstantValue(new I18n({
    defaultLanguage: appConfig.APP_LOCALE,
    allowMissing: true,
    directory: path.join(__dirname, '..', 'locales'),
  }));
  await container.load(buildProviderModule());
  return container;
}

async function bootstrap(): Promise<void> {
  config();
  const appConfig = loadAppConfig();
  configureDayjs(appConfig);
  const container = await buildContainer(appConfig);
  const bot = new Bot(container);
  const prisma = container.get(PrismaClient);

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.error(`Received ${signal}, shutting down`);
    try {
      bot.stop(signal);
      await prisma.$disconnect();
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.once('SIGINT', signal => void shutdown(signal));
  process.once('SIGTERM', signal => void shutdown(signal));
  process.on('unhandledRejection', reason => {
    console.error('Unhandled rejection', reason);
    process.exit(1);
  });
  process.on('uncaughtException', error => {
    console.error('Uncaught exception', error);
    process.exit(1);
  });

  await bot.launch();
}

bootstrap().catch(error => {
  console.error(error);
  process.exit(1);
});
