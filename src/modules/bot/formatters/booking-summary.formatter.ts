import { BookingData } from '../context';

export class BookingSummaryFormatter {
  static format(bookingData: BookingData) {
    const result = [];
    if (bookingData.courtName) {
      result.push('*Court:* ' + bookingData.courtName);
    }
    if (bookingData.date) {
      result.push('*Date:* ' + bookingData.date.format('DD.MM.YYYY'));
    }
    if (bookingData.time) {
      result.push('*Time:* ' + bookingData.time);
    }
    if (bookingData.duration) {
      result.push('*Duration:* ' + bookingData.duration);
    }

    return result.join('\n');
  }
}