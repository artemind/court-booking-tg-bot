import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ChooseDateAction } from '../../../../src/bot/actions/booking/choose-date.action';
import { InvalidDateSelectedException } from '../../../../src/bot/exceptions/invalid-date-selected.exception';
import { createMockContext } from '../../../helpers/create-mock-context';

const AVAILABLE_DATE = dayjs.utc('2026-05-15').startOf('day');
const AVAILABLE_TIMESTAMP = AVAILABLE_DATE.valueOf().toString();

function makeAction() {
  const bookingSlotService = {
    generateDateSlots: vi.fn().mockReturnValue([AVAILABLE_DATE]),
  };
  const showChooseCourtAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseTimeAction = { run: vi.fn().mockResolvedValue(true) };

  const action = new ChooseDateAction(
    bookingSlotService as any,
    showChooseCourtAction as any,
    showChooseTimeAction as any,
  );

  return { action, bookingSlotService, showChooseCourtAction, showChooseTimeAction };
}

function ctxWithCourt(courtId?: number) {
  return createMockContext({
    session: {
      sessionStartsAt: new Date(),
      bookingData: courtId !== undefined ? { courtId } : {},
    },
  });
}

describe('ChooseDateAction', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('session guard', () => {
    it('replies with error and redirects when courtId is missing', async () => {
      const { action, showChooseCourtAction } = makeAction();
      const ctx = ctxWithCourt();

      await action.run(ctx, AVAILABLE_TIMESTAMP);

      expect(ctx.reply).toHaveBeenCalledWith('exceptions.an_error_occurred');
      expect(showChooseCourtAction.run).toHaveBeenCalledWith(ctx, true);
    });

    it('does not generate date slots when session guard fails', async () => {
      const { action, bookingSlotService } = makeAction();
      await action.run(ctxWithCourt(), AVAILABLE_TIMESTAMP);
      expect(bookingSlotService.generateDateSlots).not.toHaveBeenCalled();
    });
  });

  describe('date validation', () => {
    it('throws InvalidDateSelectedException when timestampStr is undefined', async () => {
      const { action } = makeAction();
      await expect(action.run(ctxWithCourt(1), undefined)).rejects.toBeInstanceOf(InvalidDateSelectedException);
    });

    it('throws InvalidDateSelectedException for a date not in available list', async () => {
      const { action } = makeAction();
      const pastTimestamp = dayjs.utc('2020-01-01').startOf('day').valueOf().toString();
      await expect(action.run(ctxWithCourt(1), pastTimestamp)).rejects.toBeInstanceOf(InvalidDateSelectedException);
    });
  });

  describe('on valid date', () => {
    it('sets bookingData.date to the parsed UTC date', async () => {
      const { action } = makeAction();
      const ctx = ctxWithCourt(1);

      await action.run(ctx, AVAILABLE_TIMESTAMP);

      expect(ctx.session.bookingData!.date!.format('DD-MM-YYYY')).toBe(AVAILABLE_DATE.format('DD-MM-YYYY'));
    });

    it('calls showChooseTimeAction.run(ctx, false)', async () => {
      const { action, showChooseTimeAction } = makeAction();
      const ctx = ctxWithCourt(1);

      await action.run(ctx, AVAILABLE_TIMESTAMP);

      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, false);
    });
  });
});
