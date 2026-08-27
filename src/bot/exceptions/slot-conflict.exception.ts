import { ReplyableException } from './replyable.exception';

export class SlotConflictException extends ReplyableException {
  constructor() {
    super('errors.slot_already_booked');
  }
}
