import { ReplyableException } from './replyable.exception';

export class CourtNotFoundException extends ReplyableException {
  constructor() {
    super('exceptions.court_not_found');
  }
}
