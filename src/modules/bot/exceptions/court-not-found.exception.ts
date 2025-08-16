import { ReplyableException } from './replyable.exception';

export class CourtNotFoundException extends ReplyableException {
    protected getI18nKey(): string {
        return 'exceptions.court_not_found';
    }
}