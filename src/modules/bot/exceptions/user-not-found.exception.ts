import { ReplyableException } from './replyable.exception';

export class UserNotFoundException extends ReplyableException {
    protected getI18nKey(): string {
        return 'exceptions.user_not_found';
    }
}