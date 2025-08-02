import type { Context as TelegrafContext } from 'telegraf';
import { User } from '../../generated/prisma';
import type { Update } from 'telegraf/types';
import dayjs from 'dayjs';

export interface Context <U extends Update = Update> extends TelegrafContext<U> {
  match: RegExpExecArray,
  user?: User,
  session: {
    sessionStartsAt: Date,
    bookingData?: BookingData;
  }
}

export interface BookingData {
  courtId?: number;
  courtName?: string;
  date?: dayjs.Dayjs;
  time?: string;
  duration?: number;
}