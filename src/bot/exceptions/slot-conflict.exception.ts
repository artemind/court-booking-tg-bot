export class SlotConflictException extends Error {
  constructor() {
    super('Slot already booked');
  }
}
