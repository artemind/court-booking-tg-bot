import { I18nContext } from '@edjopato/telegraf-i18n';

export abstract class ReplyableException extends Error {
  constructor(protected i18n: I18nContext) {
    super();
    this.message = i18n.t(this.getI18nKey());
  }

  protected abstract getI18nKey(): string;
}