import { BookingData } from '../context';
import { formatMinutes } from '../../../utils/time.utils';

export class BookingSummaryFormatter {
  static format(bookingData: BookingData) {
    if (!bookingData) {
      return '';
    }
    const result = [];
    if (bookingData.courtName) {
      result.push('⛳️ *Court:* ' + bookingData.courtName);
    }
    if (bookingData.date) {
      result.push('📅 *Date:* ' + bookingData.date.format('DD.MM.YYYY'));
    }
    if (bookingData.time) {
      result.push('🏁 *Start Time:* ' + bookingData.time);
    }
    if (bookingData.dateAndTime && bookingData.duration) {
      result.push('🏁 *End Time:* ' + bookingData.dateAndTime.add(bookingData.duration, 'minutes').tz().format('HH:mm'));
    }
    if (bookingData.duration) {
      result.push('🔄 *Duration:* ' + formatMinutes(bookingData.duration));
    }

    return result.join('\n');
  }
}