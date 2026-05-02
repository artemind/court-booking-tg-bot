import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ShowChooseTimeAction } from '../../../../src/bot/actions/booking/show-choose-time.action';
import { ChooseTimeMessage } from '../../../../src/bot/messages/booking/choose-time.message';
import { createMockContext } from '../../../helpers/create-mock-context';

const fakeBookings = [{ id: 1, courtId: 1 }];
const fakeTimeSlots = ['10:00', '10:30', '11:00'];
const fakeDate = dayjs('2026-05-10');

function makeAction() {
  const bookingService = {
    getByDate: vi.fn().mockResolvedValue(fakeBookings),
  };
  const bookingSlotService = {
    generateAvailableTimeSlots: vi.fn().mockReturnValue(fakeTimeSlots),
  };
  const showChooseDateAction = {
    run: vi.fn().mockResolvedValue(true),
  };
  const action = new ShowChooseTimeAction(
    bookingService as any,
    bookingSlotService as any,
    showChooseDateAction as any,
  );
  return { action, bookingService, bookingSlotService, showChooseDateAction };
}

describe('ShowChooseTimeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ChooseTimeMessage, 'reply').mockResolvedValue({ message_id: 1 } as any);
    vi.spyOn(ChooseTimeMessage, 'editMessageText').mockResolvedValue(true);
  });

  describe('when required session data is missing', () => {
    it('redirects to ShowChooseDateAction when courtId is missing', async () => {
      const { action, showChooseDateAction } = makeAction();
      const ctx = createMockContext({
        session: { sessionStartsAt: new Date(), bookingData: { date: fakeDate } },
      });
      await action.run(ctx, true);
      expect(showChooseDateAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('redirects to ShowChooseDateAction when date is missing', async () => {
      const { action, showChooseDateAction } = makeAction();
      const ctx = createMockContext({
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } },
      });
      await action.run(ctx, false);
      expect(showChooseDateAction.run).toHaveBeenCalledWith(ctx, false);
    });

    it('does not query bookings when redirecting', async () => {
      const { action, bookingService } = makeAction();
      const ctx = createMockContext({ session: { sessionStartsAt: new Date(), bookingData: {} } });
      await action.run(ctx, true);
      expect(bookingService.getByDate).not.toHaveBeenCalled();
    });
  });

  describe('when courtId and date are present', () => {
    const ctxWithData = () =>
      createMockContext({
        session: { sessionStartsAt: new Date(), bookingData: { courtId: 1, date: fakeDate } },
      });

    it('queries bookings by courtId and date', async () => {
      const { action, bookingService } = makeAction();
      await action.run(ctxWithData(), true);
      expect(bookingService.getByDate).toHaveBeenCalledWith(1, fakeDate);
    });

    it('generates available time slots from bookings', async () => {
      const { action, bookingSlotService } = makeAction();
      await action.run(ctxWithData(), true);
      expect(bookingSlotService.generateAvailableTimeSlots).toHaveBeenCalledWith(fakeDate, fakeBookings);
    });

    it('calls ChooseTimeMessage.reply when reply=true', async () => {
      const { action } = makeAction();
      const ctx = ctxWithData();
      await action.run(ctx, true);
      expect(ChooseTimeMessage.reply).toHaveBeenCalledWith(ctx, fakeTimeSlots);
      expect(ChooseTimeMessage.editMessageText).not.toHaveBeenCalled();
    });

    it('calls ChooseTimeMessage.editMessageText when reply=false', async () => {
      const { action } = makeAction();
      const ctx = ctxWithData();
      await action.run(ctx, false);
      expect(ChooseTimeMessage.editMessageText).toHaveBeenCalledWith(ctx, fakeTimeSlots);
      expect(ChooseTimeMessage.reply).not.toHaveBeenCalled();
    });
  });
});
