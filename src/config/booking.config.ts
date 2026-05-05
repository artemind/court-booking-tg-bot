export const BOOKING_CONFIG_TOKEN = 'BookingConfig';

export interface IBookingConfig {
  availableFromTime: string;
  availableToTime: string;
  slotSizeMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  minutesBeforeStartNotification: number;
  minutesBeforeEndNotification: number;
}
