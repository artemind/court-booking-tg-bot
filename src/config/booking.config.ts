export interface IBookingConfig {
  availableFromTime: string;
  availableToTime: string;
  slotSizeMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  daysAhead: number;
  minutesBeforeStartNotification: number;
  minutesBeforeEndNotification: number;
}
