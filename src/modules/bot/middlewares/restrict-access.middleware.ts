import { AccessRestrictedException } from '../exceptions/access-restricted.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { Context } from '../context';

export class RestrictAccessMiddleware {

  apply = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    if (ctx.user === undefined) {
      throw new UserNotFoundException(ctx.i18n);
    }
    if (ctx.user.isAccessRestricted) {
      throw new AccessRestrictedException(ctx.i18n);
    }

    return next();
  };
}