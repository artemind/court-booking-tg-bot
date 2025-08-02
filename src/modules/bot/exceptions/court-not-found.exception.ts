import { ReplyableException } from './replyable.exception';

export class CourtNotFoundException extends ReplyableException {
  constructor() {
    super('Court not found');
  }
}