import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayjs from 'dayjs';
import { ChooseDurationHandler } from '../../../../src/bot/handlers/booking/choose-duration.handler';
import { ContextManager } from '../../../../src/bot/context.manager';
import { createMockContext } from '../../../helpers/create-mock-context';

const FUTURE_DATE_AND_TIME = dayjs.utc('2026-05-15T10:00:00Z');
const SELECTED_DURATION = 60;

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };

  const createBookingAction = { run: vi.fn().mockResolvedValue(true) };
  const showChooseTimeAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ChooseDurationHandler(
    bot as any,
    createBookingAction as any,
    showChooseTimeAction as any,
  );

  const backCb = () => actions[0]!.cb;
  const selectCb = () => actions[1]!.cb;

  return { handler, bot, createBookingAction, showChooseTimeAction, backCb, selectCb };
}

describe('ChooseDurationHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('BOOKING_CHOOSE_DURATION_BACK', () => {
    it('clears time selection via ContextManager', async () => {
      const { handler, backCb } = makeHandler();
      await handler.register();
      const spy = vi.spyOn(ContextManager, 'clearTimeSelection');
      const ctx = createMockContext();

      await backCb()(ctx);

      expect(spy).toHaveBeenCalledWith(ctx);
    });

    it('navigates to time selection', async () => {
      const { handler, showChooseTimeAction, backCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext();

      await backCb()(ctx);

      expect(showChooseTimeAction.run).toHaveBeenCalledWith(ctx, false);
    });
  });

  describe('BOOKING_CHOOSE_DURATION_<minutes>', () => {
    it('delegates to createBookingAction with parsed duration', async () => {
      const { handler, createBookingAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        match: ['', `${SELECTED_DURATION}`] as unknown as RegExpExecArray,
        session: {
          sessionStartsAt: new Date(),
          bookingData: { courtId: 1, dateAndTime: FUTURE_DATE_AND_TIME },
        },
      });

      await selectCb()(ctx);

      expect(createBookingAction.run).toHaveBeenCalledWith(ctx, SELECTED_DURATION);
    });

    it('delegates to createBookingAction with null when match[1] is missing', async () => {
      const { handler, createBookingAction, selectCb } = makeHandler();
      await handler.register();
      const ctx = createMockContext({
        match: [''] as unknown as RegExpExecArray,
        session: {
          sessionStartsAt: new Date(),
          bookingData: { courtId: 1, dateAndTime: FUTURE_DATE_AND_TIME },
        },
      });

      await selectCb()(ctx);

      expect(createBookingAction.run).toHaveBeenCalledWith(ctx, null);
    });
  });
});
