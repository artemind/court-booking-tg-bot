import { ReplyableException } from './replyable.exception';

export class AccessRestrictedException extends ReplyableException {
  constructor() {
    super('Access restricted');
  }
}