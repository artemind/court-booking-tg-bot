import { AccessRestrictedException } from '../exceptions/access-restricted.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { Context } from '../context';
import { injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

@injectable()
@provide()
export class RestrictAccessMiddleware {
  middleware(): (ctx: Context, next: () => Promise<void>) => Promise<void> {
    return async (ctx: Context, next: () => Promise<void>): Promise<void> => {
      if (ctx.user === undefined) {
        throw new UserNotFoundException(ctx.i18n);
      }
      if (ctx.user.isAccessRestricted) {
        throw new AccessRestrictedException(ctx.i18n);
      }

      return next();
    };
  }
}