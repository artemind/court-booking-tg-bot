import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ShowChooseDurationAction } from '../../../../src/bot/actions/booking/show-choose-duration.action';
import { ChooseDurationMessage } from '../../../../src/bot/messages/booking/choose-duration.message';
import { createMockContext } from '../../../helpers/create-mock-context';

const fakeBookings = [{ id: 1, courtId: 1 }];
const fakeDurations = [30, 60, 90, 120];
const fakeDate = dayjs('2026-05-10');
const fakeDateAndTime = dayjs('2026-05-10T10:00:00Z');

function makeAction() {
  const bookingService = {
    getByDate: vi.fn().mockResolvedValue(fakeBookings),
  };
  const bookingSlotService = {
    generateAvailableDurations: vi.fn().mockReturnValue(fakeDurations),
  };
  const showChooseTimeAction = {
    run: vi.fn().mockResolvedValue(true),
  };
  const action = new ShowChooseDurationAction(
    bookingService as any,
    bookingSlotService as any,
    showChooseTimeAction as any,
  );
  return { action, bookingService, bookingSlotService, showChooseTimeAction };
}

describe('ShowChooseDurationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ChooseDurationMessage, 'reply').mockResolvedValue({ message_id: 1 } as any);
    vi.spyOn(ChooseDurationMessage, 'editMessageText').mockResolvedValue(true);
  });

  describe('when required session data is missing', () => {
    it('redirects when courtId is missing', async () => {
      const { action, showChooseTimeAction } = makeAction();
      const ctx = createMockContext({
        session: {
          sessionStartsAt: new Date(),
          bookingData: { date: fakeDate, dateAndTime: fakeDateAndTime },
        },
      });
      await action.run(ctx, true);
      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('redirects when date is missing', async () => {
      const { action, showChooseTimeAction } = makeAction();
      const ctx = createMockContext({
        session: {
          sessionStartsAt: new Date(),
          bookingData: { courtId: 1, dateAndTime: fakeDateAndTime },
        },
      });
      await action.run(ctx, false);
      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, false);
    });

    it('redirects when dateAndTime is missing', async () => {
      const { action, showChooseTimeAction } = makeAction();
      const ctx = createMockContext({
        session: {
          sessionStartsAt: new Date(),
          bookingData: { courtId: 1, date: fakeDate },
        },
      });
      await action.run(ctx, true);
      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('does not query bookings when redirecting', async () => {
      const { action, bookingService } = makeAction();
      const ctx = createMockContext({ session: { sessionStartsAt: new Date(), bookingData: {} } });
      await action.run(ctx, true);
      expect(bookingService.getByDate).not.toHaveBeenCalled();
    });
  });

  describe('when all required session data is present', () => {
    const ctxWithData = () =>
      createMockContext({
        session: {
          sessionStartsAt: new Date(),
          bookingData: { courtId: 1, date: fakeDate, dateAndTime: fakeDateAndTime },
        },
      });

    it('queries bookings by courtId and date', async () => {
      const { action, bookingService } = makeAction();
      await action.run(ctxWithData(), true);
      expect(bookingService.getByDate).toHaveBeenCalledWith(1, fakeDate);
    });

    it('generates available durations from dateAndTime and bookings', async () => {
      const { action, bookingSlotService } = makeAction();
      await action.run(ctxWithData(), true);
      expect(bookingSlotService.generateAvailableDurations).toHaveBeenCalledWith(fakeDateAndTime, fakeBookings);
    });

    it('calls ChooseDurationMessage.reply when reply=true', async () => {
      const { action } = makeAction();
      const ctx = ctxWithData();
      await action.run(ctx, true);
      expect(ChooseDurationMessage.reply).toHaveBeenCalledWith(ctx, fakeDurations);
      expect(ChooseDurationMessage.editMessageText).not.toHaveBeenCalled();
    });

    it('calls ChooseDurationMessage.editMessageText when reply=false', async () => {
      const { action } = makeAction();
      const ctx = ctxWithData();
      await action.run(ctx, false);
      expect(ChooseDurationMessage.editMessageText).toHaveBeenCalledWith(ctx, fakeDurations);
      expect(ChooseDurationMessage.reply).not.toHaveBeenCalled();
    });
  });
});
