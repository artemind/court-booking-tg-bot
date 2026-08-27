import { ReplyableException } from './replyable.exception';

export class UserNotFoundException extends ReplyableException {
  constructor() {
    super('exceptions.user_not_found');
  }
}
