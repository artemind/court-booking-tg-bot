import dayjs from 'dayjs';
import { Booking } from '../../../generated/prisma';

export class BookingSlotService {
  constructor(
    private bookingAvailableFromTime: string,
    private bookingAvailableToTime: string,
    private bookingSlotSizeMins: number,
    private bookingMinDurationMinutes: number,
    private bookingMaxDurationMinutes: number,
  ) {
  }

  generateDateSlots(days: number = 7): dayjs.Dayjs[] {
    const slots: dayjs.Dayjs[] = [];
    let currentDate = dayjs().startOf('day');
    const endDate = currentDate.clone().add(days, 'day');
    while (currentDate <= endDate) {
      slots.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    return slots;
  }

  generateTimeSlots(startHour?: string, endHour?: string): string[] {
    const slots: string[] = [];
    let currentTime = dayjs(`1970-01-01T${startHour || this.bookingAvailableFromTime}`);
    const endTime = dayjs(`1970-01-01T${endHour || this.bookingAvailableToTime}`);

    while (currentTime <= endTime) {
      slots.push(currentTime.format('HH:mm'));

      currentTime = currentTime.add(this.bookingSlotSizeMins, 'minute');
    }

    return slots;
  }

  generateAvailableTimeSlots(date: dayjs.Dayjs, bookings: Booking[]): string[] {
    let startTime = this.bookingAvailableFromTime;
    if (date.startOf('day').utc().isSame(dayjs().startOf('day').utc(), 'day')) {
      const now = dayjs().tz();
      startTime = now.startOf('hour').add(Math.floor(now.minute() / 30) * 30, 'minute').format('HH:mm');
    }
    const allSlots: string[] = this.generateTimeSlots(startTime, this.bookingAvailableToTime);
    const bookedSlots: string[] = this.getBookedTimeSlots(bookings);

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  getBookedTimeSlots(bookings: Booking[]): string[] {
    let bookedSlots: string[] = [];
    bookings.forEach(booking => {
      bookedSlots = [...bookedSlots, ...this.generateTimeSlots(dayjs(booking.dateFrom).tz().format('HH:mm'), dayjs(booking.dateTill).tz().subtract(1, 'second').format('HH:mm'))];
    });

    return bookedSlots;
  }

  generateDurations(min?: number, max?: number): number[] {
    min ||= this.bookingMinDurationMinutes;
    max ||= this.bookingMaxDurationMinutes;
    const result = [];
    while (min <= max) {
      result.push(min);
      min += this.bookingSlotSizeMins;
    }

    return result;
  }

  generateAvailableDurations(startTime: dayjs.Dayjs, bookings: Booking[]): number[] {
    startTime = startTime.utc();
    const allDurations = this.generateDurations();
    const bookingEndOfDay = dayjs.tz(`${startTime.tz().format('YYYY-MM-DD')}T${this.bookingAvailableToTime}`).utc();
    return allDurations.filter(duration => {
      const endTime = startTime.add(duration, 'minute');
      if (endTime.subtract(1, 'minute').isAfter(bookingEndOfDay)) {
        return false;
      }

      return !bookings.some(booking => {
        const bookingStart = dayjs(booking.dateFrom);
        const bookingEnd = dayjs(booking.dateTill);

        return startTime.isBefore(bookingEnd) && endTime.isAfter(bookingStart);
      });
    });
  }
}