import { Context } from '../../context';
import type { Message } from 'telegraf/types';
import { UserService } from '../../services/user.service';
import {
  NotificationPreferencesUpdatedMessage
} from '../../messages/notification-preferences/notification-preferences-updated.message';
import { inject, injectable } from 'inversify';
import { provide } from '@inversifyjs/binding-decorators';

type NotificationPreferenceField = 'notifyBeforeBookingStarts' | 'notifyBeforeBookingEnds';

@injectable()
@provide()
export class UpdateNotificationPreferencesAction {
  constructor(
    @inject(UserService)
    private userService: UserService
  ) {}

  async run(ctx: Context, field: NotificationPreferenceField, value: boolean): Promise<Message.TextMessage> {
    const user = await this.userService.update(ctx.user!.id, { [field]: value });
    return NotificationPreferencesUpdatedMessage.reply(ctx, user);
  }
}
