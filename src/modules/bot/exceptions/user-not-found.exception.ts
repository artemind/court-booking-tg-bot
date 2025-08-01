import { ReplyableException } from './replyable.exception';

export class UserNotFoundException extends ReplyableException {
  constructor() {
    super('User not found');
  }
}