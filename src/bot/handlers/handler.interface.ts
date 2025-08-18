export interface IHandler {
  register(): Promise<void>;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IHandlerConstructor<T extends IHandler = IHandler> = new (...args: any[]) => T;
