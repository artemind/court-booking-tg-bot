import { ReplyableException } from './replyable.exception';

export class AccessRestrictedException extends ReplyableException {
  constructor() {
    super('exceptions.access_restricted');
  }
}
