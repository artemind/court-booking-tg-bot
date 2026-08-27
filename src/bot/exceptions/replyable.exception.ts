export abstract class ReplyableException extends Error {
  constructor(public readonly i18nKey: string) {
    super();
  }
}
