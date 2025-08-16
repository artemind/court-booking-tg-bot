import { ReplyableException } from './replyable.exception';

export class AccessRestrictedException extends ReplyableException {
    protected getI18nKey(): string {
        return 'exceptions.access_restricted';
    }
}