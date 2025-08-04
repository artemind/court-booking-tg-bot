import { formatMinutes } from '../../../utils/time.utils';
import { Booking, Court } from '../../../generated/prisma';
import dayjs from 'dayjs';

export class BookingFormatter {
  static format(booking: Booking & {court: Court}): string {
    const startDate = dayjs(booking.dateFrom).tz();
    const endDate = dayjs(booking.dateTill).tz();
    const dateFormat = 'DD.MM';
    let formattedDate;
    if (startDate.isSame(dayjs.tz(), 'day')) {
      formattedDate = startDate.format(dateFormat) + ' (Today)';
    } else {
      formattedDate = startDate.format(dateFormat + ' (ddd)');
    }

    return [
      `*Court:* ${booking.court.name}`,
      `*Date:* ${formattedDate}`,
      `*Start Time:* ${startDate.format('HH:mm')}`,
      `*End Time:* ${endDate.format('HH:mm')}`,
      `*Duration:* ${formatMinutes(endDate.diff(startDate, 'minutes'))}`,
    ].join('\n');
  }
}