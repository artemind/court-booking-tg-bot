import type { Module } from './modules/module.interface';
import { BotModule } from './modules/bot/bot.module';
import { config } from 'dotenv';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { PrismaClient } from './generated/prisma';

config();

function configureDayjs(): void {
  dayjs.locale(process.env.APP_LOCALE || 'en');
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault(process.env.APP_TIMEZONE || 'UTC');
}


async function bootstrap(): Promise<void> {
  configureDayjs();

  const prisma = new PrismaClient();

  const modules: Module[] = [
    new BotModule(prisma),
  ];

  try {
    await Promise.all(modules.map(module => module.launch()));
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
  await prisma.$disconnect();
  console.log('Database disconnected.');
}

bootstrap();