import { BookingData } from '../context';
import { formatMinutes } from '../../utils/time.utils';
import { I18nContext } from '@edjopato/telegraf-i18n';
import dayjs from 'dayjs';

export class BookingSummaryFormatter {
  static format(i18n: I18nContext, bookingData: BookingData) {
    if (!bookingData) {
      return '';
    }
    const result = [];
    if (bookingData.courtName) {
      result.push(`⛳️ *${i18n.t('court')}:* ` + bookingData.courtName);
    }
    if (bookingData.date) {
      result.push(`📅 *${i18n.t('date')}:* ` + bookingData.date.format('DD.MM.YYYY'));
    }
    if (bookingData.time) {
      result.push(`🏁 *${i18n.t('start_time')}:* ` + bookingData.time);
    }
    if (bookingData.date && bookingData.time && bookingData.duration) {
      const dateAndTime = dayjs.tz(`${bookingData.date.format('YYYY-MM-DD')}T${bookingData.time}`).startOf('minute').utc();
      result.push(`🏁 *${i18n.t('end_time')}:* ` + dateAndTime.add(bookingData.duration, 'minutes').tz().format('HH:mm'));
    }
    if (bookingData.duration) {
      result.push(`🔄 *${i18n.t('duration')}:* ` + formatMinutes(bookingData.duration));
    }

    return result.join('\n');
  }
}