import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ShowChooseDateAction } from '../../../../src/bot/actions/booking/show-choose-date.action';
import { ShowChooseCourtAction } from '../../../../src/bot/actions/booking/show-choose-court.action';
import { ChooseDateMessage } from '../../../../src/bot/messages/booking/choose-date.message';
import { createMockContext } from '../../../helpers/create-mock-context';

const fakeDateSlots = [dayjs('2026-01-01'), dayjs('2026-01-02'), dayjs('2026-01-03')];
const fakeDateSlotsAsDates = fakeDateSlots.map(d => d.toDate());

function makeAction() {
  const bookingSlotService = {
    generateDateSlots: vi.fn().mockReturnValue(fakeDateSlots),
  };
  const showChooseCourtAction = {
    run: vi.fn().mockResolvedValue(true),
  };
  const action = new ShowChooseDateAction(
    bookingSlotService as any,
    showChooseCourtAction as any,
  );
  return { action, bookingSlotService, showChooseCourtAction };
}

describe('ShowChooseDateAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ChooseDateMessage, 'reply').mockResolvedValue({ message_id: 1 } as any);
    vi.spyOn(ChooseDateMessage, 'editMessageText').mockResolvedValue(true);
  });

  describe('when courtId is missing from session', () => {
    it('redirects to ShowChooseCourtAction', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = createMockContext({ session: { sessionStartsAt: new Date(), bookingData: {} } });
      await action.run(ctx, true);
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('does not generate date slots', async () => {
      const { action, bookingSlotService } = makeAction();
      const ctx = createMockContext({ session: { sessionStartsAt: new Date(), bookingData: {} } });
      await action.run(ctx, false);
      expect(bookingSlotService.generateDateSlots).not.toHaveBeenCalled();
    });
  });

  describe('when courtId is present', () => {
    const ctxWithCourt = () =>
      createMockContext({ session: { sessionStartsAt: new Date(), bookingData: { courtId: 1 } } });

    it('generates date slots', async () => {
      const { action, bookingSlotService } = makeAction();
      await action.run(ctxWithCourt(), true);
      expect(bookingSlotService.generateDateSlots).toHaveBeenCalledOnce();
    });

    it('calls ChooseDateMessage.reply when reply=true', async () => {
      const { action } = makeAction();
      const ctx = ctxWithCourt();
      await action.run(ctx, true);
      expect(ChooseDateMessage.reply).toHaveBeenCalledWith(ctx, fakeDateSlotsAsDates);
      expect(ChooseDateMessage.editMessageText).not.toHaveBeenCalled();
    });

    it('calls ChooseDateMessage.editMessageText when reply=false', async () => {
      const { action } = makeAction();
      const ctx = ctxWithCourt();
      await action.run(ctx, false);
      expect(ChooseDateMessage.editMessageText).toHaveBeenCalledWith(ctx, fakeDateSlotsAsDates);
      expect(ChooseDateMessage.reply).not.toHaveBeenCalled();
    });
  });
});
