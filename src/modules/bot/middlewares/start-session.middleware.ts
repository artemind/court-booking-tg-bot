import { Context } from '../context';

export class StartSessionMiddleware {
  apply = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    if (!ctx.session) {
      ctx.session = {
        sessionStartsAt: new Date(),
      };
    }

    return next();
  };
}