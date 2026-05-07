import dayjs from 'dayjs';
import { BookingData, Context } from './context';

export class ContextManager {
  private static clearBookingFields(ctx: Context, props: Array<keyof BookingData>): void {
    if (!ctx.session.bookingData) {
      return;
    }

    props.forEach(prop => {
      delete ctx.session.bookingData![prop];
    });
  }

  static resetBookingData(ctx: Context): void {
    ctx.session.bookingData = {};
  }

  static clearDateSelection(ctx: Context): void {
    this.clearTimeSelection(ctx);
    this.clearBookingFields(ctx, ['date']);
  }

  static clearTimeSelection(ctx: Context): void {
    this.clearBookingFields(ctx, ['time']);
  }

  static getDateAndTime(ctx: Context): dayjs.Dayjs | undefined {
    const { date, time } = ctx.session.bookingData ?? {};
    if (!date || !time) return undefined;
    return dayjs.tz(`${date.format('YYYY-MM-DD')}T${time}`).startOf('minute').utc();
  }
}