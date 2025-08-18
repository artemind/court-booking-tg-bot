import { formatMinutes } from '../../utils/time.utils';
import { Booking, Court } from '../../generated/prisma';
import dayjs from 'dayjs';
import { I18nContext } from '@edjopato/telegraf-i18n';

export class BookingFormatter {
  static format(i18n: I18nContext, booking: Booking & {court: Court}): string {
    const startDate = dayjs(booking.dateFrom).tz();
    const endDate = dayjs(booking.dateTill).tz();
    const dateFormat = 'DD.MM';
    let formattedDate;
    if (startDate.isSame(dayjs.tz(), 'day')) {
      formattedDate = `${startDate.format(dateFormat)} (${i18n.t('today')})`;
    } else {
      formattedDate = startDate.format(dateFormat + ' (ddd)');
    }

    return [
      `⛳️ *${i18n.t('court')}:* ${booking.court.name}`,
      `📅 *${i18n.t('date')}:* ${formattedDate}`,
      `🏁 *${i18n.t('start_time')}:* ${startDate.format('HH:mm')}`,
      `🏁 *${i18n.t('end_time')}:* ${endDate.format('HH:mm')}`,
      `🔄 *${i18n.t('duration')}:* ${formatMinutes(endDate.diff(startDate, 'minutes'))}`,
    ].join('\n');
  }
}