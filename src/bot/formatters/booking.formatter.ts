import { formatMinutes } from '../../utils/time.utils';
import { Booking, Court } from '../../generated/prisma';
import dayjs from 'dayjs';
import { I18n, I18nContext } from '@edjopato/telegraf-i18n';

export class BookingFormatter {
  static format(i18n: I18nContext, booking: Booking & {court: Court}): string;
  static format(i18n: I18n, booking: Booking & {court: Court}, locale: string): string;
  static format(i18n: I18nContext|I18n, booking: Booking & {court: Court}, locale?: string): string {
    const t = (key: string): string => {
      if ('locale' in i18n) {
        return i18n.t(key);
      } else {
        return i18n.t(locale!, key);
      }
    };

    const startDate = dayjs(booking.dateFrom).tz();
    const endDate = dayjs(booking.dateTill).tz();
    const dateFormat = 'DD.MM';
    let formattedDate;
    if (startDate.isSame(dayjs.tz(), 'day')) {
      formattedDate = `${startDate.format(dateFormat)} (${t('today')})`;
    } else {
      formattedDate = startDate.format(dateFormat + ' (ddd)');
    }

    return [
      `⛳️ *${t('court')}:* ${booking.court.name}`,
      `📅 *${t('date')}:* ${formattedDate}`,
      `🏁 *${t('start_time')}:* ${startDate.format('HH:mm')}`,
      `🏁 *${t('end_time')}:* ${endDate.format('HH:mm')}`,
      `🔄 *${t('duration')}:* ${formatMinutes(endDate.diff(startDate, 'minutes'))}`,
    ].join('\n');
  }
}