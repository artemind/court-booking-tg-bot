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
import { BOOKING_CONFIG_TOKEN, IBookingConfig } from './config/booking.config';

function configureDayjs(): void {
  dayjs.locale(process.env.APP_LOCALE || 'en');
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault(process.env.APP_TIMEZONE || 'UTC');
}

async function buildContainer(): Promise<Container> {
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error('BOT_TOKEN is not defined');

  const container = new Container();
  container.bind<PrismaClient>(PrismaClient).toConstantValue(new PrismaClient());
  container.bind<string>('APP_LOCALE').toConstantValue(process.env.APP_LOCALE || 'en');
  container.bind<IBookingConfig>(BOOKING_CONFIG_TOKEN).toConstantValue({
    availableFromTime:              process.env.BOOKING_AVAILABLE_FROM_TIME  || '07:00',
    availableToTime:                process.env.BOOKING_AVAILABLE_TO_TIME    || '23:59',
    slotSizeMinutes:                parseInt(process.env.BOOKING_SLOT_SIZE_IN_MINUTES || '30'),
    minDurationMinutes:             parseInt(process.env.BOOKING_MIN_DURATION_MINUTES || '30'),
    maxDurationMinutes:             parseInt(process.env.BOOKING_MAX_DURATION_MINUTES || '180'),
    minutesBeforeStartNotification: parseInt(process.env.NOTIFICATION_MINUTES_BEFORE_START || '30'),
    minutesBeforeEndNotification:   parseInt(process.env.NOTIFICATION_MINUTES_BEFORE_END   || '15'),
  });
  container.bind<Telegraf>(Telegraf).toConstantValue(new Telegraf(token));
  container.bind<I18n>(I18n).toConstantValue(new I18n({
    defaultLanguage: process.env.APP_LOCALE || 'en',
    allowMissing: true,
    directory: path.join(__dirname, '..', 'locales'),
  }));
  await container.load(buildProviderModule());
  return container;
}

async function bootstrap(): Promise<void> {
  config();
  configureDayjs();
  const container = await buildContainer();
  const bot = new Bot(container);
  await bot.launch();
}

bootstrap().catch(console.error);
