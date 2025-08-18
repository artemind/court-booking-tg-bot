import { ReplyableException } from './replyable.exception';

export class InvalidDateSelectedException extends ReplyableException {
    protected getI18nKey(): string {
        return 'exceptions.invalid_date_selected';
    }
}