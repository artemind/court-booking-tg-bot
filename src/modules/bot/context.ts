import type { Context as TelegrafContext } from 'telegraf';
import { User } from '../../generated/prisma';
import type { Update } from 'telegraf/types';
import dayjs from 'dayjs';
import { I18nContext } from '@edjopato/telegraf-i18n';

export interface Context <U extends Update = Update> extends TelegrafContext<U> {
  match: RegExpExecArray,
  user?: User,
  session: {
    sessionStartsAt: Date,
    bookingData?: BookingData;
  },
  i18n: I18nContext;
}

export interface BookingData {
  courtId?: number;
  courtName?: string;
  date?: dayjs.Dayjs;
  time?: string;
  dateAndTime?: dayjs.Dayjs;
  duration?: number;
}