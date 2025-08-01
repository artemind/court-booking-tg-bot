import type { Module } from './modules/module.interface';
import { BotModule } from './modules/bot/bot.module';
import { config } from 'dotenv';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

config();

function configureDayjs(): void {
  dayjs.locale(process.env.APP_LOCALE || 'en');
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault(process.env.APP_TIMEZONE || 'UTC');
}

function bootstrap(): void {
  configureDayjs();

  const modules: Module[] = [
    new BotModule()
  ];

  modules.forEach(module => module.launch());
}

bootstrap();