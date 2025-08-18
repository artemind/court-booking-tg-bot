import { Context } from '../context';
import { injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class StartSessionMiddleware {
  middleware(): (ctx: Context, next: () => Promise<void>) => Promise<void> {
    return async (ctx: Context, next: () => Promise<void>): Promise<void> => {
      if (!ctx.session) {
        ctx.session = {
          sessionStartsAt: new Date(),
          bookingData: {}
        };
      }

      return next();
    };
  }
}