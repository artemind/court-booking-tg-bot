import { AccessRestrictedException } from '../exceptions/access-restricted.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

export class RestrictAccessMiddleware {

  apply = async (ctx: any, next: any) => {
    if (ctx.user === undefined) {
      throw new UserNotFoundException();
    }
    if (ctx.user.isAccessRestricted) {
      throw new AccessRestrictedException();
    }

    return next();
  }
}