import { BookingData } from '../context';
import { formatMinutes } from '../../../utils/time.utils';
import { I18nContext } from '@edjopato/telegraf-i18n';

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
    if (bookingData.dateAndTime && bookingData.duration) {
      result.push(`🏁 *${i18n.t('end_time')}:* ` + bookingData.dateAndTime.add(bookingData.duration, 'minutes').tz().format('HH:mm'));
    }
    if (bookingData.duration) {
      result.push(`🔄 *${i18n.t('duration')}:* ` + formatMinutes(bookingData.duration));
    }

    return result.join('\n');
  }
}