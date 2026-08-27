import { ReplyableException } from './replyable.exception';

export class InvalidDateSelectedException extends ReplyableException {
  constructor() {
    super('exceptions.invalid_date_selected');
  }
}
