import { config } from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Container } from 'inversify';
import { PrismaClient } from './generated/prisma';
import { Bot } from './bot/bot';
import { buildProviderModule } from '@inversifyjs/binding-decorators';
import { Telegraf } from 'telegraf';

class App {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.init();
  }

  private async init(): Promise<void> {
    config();
    this.configureDayjs();
    await this.bindDependencies();
  }

  private configureDayjs(): void {
    dayjs.locale(process.env.APP_LOCALE || 'en');
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.tz.setDefault(process.env.APP_TIMEZONE || 'UTC');
  }

  private async bindDependencies(): Promise<void> {
    const token = process.env.BOT_TOKEN;
    if (!token) throw new Error('BOT_TOKEN is not defined');
    this.container.bind<PrismaClient>(PrismaClient).toConstantValue(new PrismaClient());
    this.container.bind<string>('APP_LOCALE').toConstantValue(process.env.APP_LOCALE || 'en');
    this.container.bind<string>('BOOKING_AVAILABLE_FROM_TIME').toConstantValue(process.env.BOOKING_AVAILABLE_FROM_TIME || '07:00');
    this.container.bind<string>('BOOKING_AVAILABLE_TO_TIME').toConstantValue(process.env.BOOKING_AVAILABLE_TO_TIME || '23:59');
    this.container.bind<number>('BOOKING_SLOT_SIZE_IN_MINUTES').toConstantValue(parseInt(process.env.BOOKING_SLOT_SIZE_IN_MINUTES || '30'));
    this.container.bind<number>('BOOKING_MIN_DURATION_MINUTES').toConstantValue(parseInt(process.env.BOOKING_MIN_DURATION_MINUTES || '30'));
    this.container.bind<number>('BOOKING_MAX_DURATION_MINUTES').toConstantValue(parseInt(process.env.BOOKING_MAX_DURATION_MINUTES || '180'));
    this.container.bind<Telegraf>(Telegraf).toConstantValue(new Telegraf(token));
    await this.container.load(buildProviderModule());
  }

  async start(): Promise<void> {
    const bot = new Bot(this.container);
    await bot.launch();
  }
}

(new App()).start();