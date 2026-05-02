import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChooseCourtHandler } from '../../../../src/bot/handlers/booking/choose-court.handler';
import { CourtNotFoundException } from '../../../../src/bot/exceptions/court-not-found.exception';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { Court } from '../../../../src/generated/prisma';

const fakeCourt: Court = {
  id: 3,
  name: 'Centre Court',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeHandler() {
  const actions: Array<{ pattern: string | RegExp; cb: Function }> = [];
  const bot = { action: vi.fn((p, cb) => actions.push({ pattern: p, cb })) };
  const courtService = { findById: vi.fn() };
  const showChooseDateAction = { run: vi.fn().mockResolvedValue(true) };

  const handler = new ChooseCourtHandler(
    bot as any,
    courtService as any,
    showChooseDateAction as any,
  );

  const getAction = () => actions[0]!.cb;

  return { handler, bot, courtService, showChooseDateAction, getAction };
}

function ctxWithMatch(courtId: string) {
  return createMockContext({
    match: ['', courtId] as unknown as RegExpExecArray,
    session: { sessionStartsAt: new Date(), bookingData: {} },
  });
}

describe('ChooseCourtHandler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers one action on the bot', async () => {
    const { handler, bot } = makeHandler();
    await handler.register();
    expect(bot.action).toHaveBeenCalledOnce();
    expect(bot.action.mock.calls[0]![0]).toEqual(/^BOOKING_CHOOSE_COURT_(\d+)$/);
  });

  describe('action callback', () => {
    it('throws CourtNotFoundException when court does not exist', async () => {
      const { handler, courtService, getAction } = makeHandler();
      await handler.register();
      courtService.findById.mockResolvedValue(null);

      await expect(getAction()(ctxWithMatch('99'))).rejects.toBeInstanceOf(CourtNotFoundException);
    });

    it('sets courtId and courtName in session bookingData', async () => {
      const { handler, courtService, getAction } = makeHandler();
      await handler.register();
      courtService.findById.mockResolvedValue(fakeCourt);

      const ctx = ctxWithMatch('3');
      await getAction()(ctx);

      expect(ctx.session.bookingData).toEqual({ courtId: fakeCourt.id, courtName: fakeCourt.name });
    });

    it('calls courtService.findById with parsed match id', async () => {
      const { handler, courtService, getAction } = makeHandler();
      await handler.register();
      courtService.findById.mockResolvedValue(fakeCourt);

      await getAction()(ctxWithMatch('3'));

      expect(courtService.findById).toHaveBeenCalledWith(3);
    });

    it('calls showChooseDateAction.run(ctx, false) after selecting court', async () => {
      const { handler, courtService, showChooseDateAction, getAction } = makeHandler();
      await handler.register();
      courtService.findById.mockResolvedValue(fakeCourt);

      const ctx = ctxWithMatch('3');
      await getAction()(ctx);

      expect(showChooseDateAction.run).toHaveBeenCalledWith(ctx, false);
    });

    it('calls courtService.findById with NaN when match[1] is undefined', async () => {
      const { handler, courtService, getAction } = makeHandler();
      await handler.register();
      courtService.findById.mockResolvedValue(null);

      const ctx = createMockContext({
        match: [''] as unknown as RegExpExecArray,
        session: { sessionStartsAt: new Date(), bookingData: {} },
      });
      await expect(getAction()(ctx)).rejects.toBeInstanceOf(CourtNotFoundException);
      expect(courtService.findById).toHaveBeenCalledWith(NaN);
    });
  });
});
