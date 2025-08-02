import { ReplyableException } from './replyable.exception';

export class InvalidDateSelectedException extends ReplyableException {
  constructor() {
    super('Invalid date selected');
  }
}