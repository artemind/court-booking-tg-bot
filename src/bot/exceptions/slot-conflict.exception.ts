import { ReplyableException } from './replyable.exception';

export class SlotConflictException extends ReplyableException {
  public getI18nKey(): string {
    return 'errors.slot_already_booked';
  }
}
