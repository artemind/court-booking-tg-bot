import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShowChooseCourtAction } from '../../../../src/bot/actions/booking/show-choose-court.action';
import { ChooseCourtMessage } from '../../../../src/bot/messages/booking/choose-court.message';
import { createMockContext } from '../../../helpers/create-mock-context';
import type { Court } from '../../../../src/generated/prisma';

const fakeCourts: Court[] = [
  { id: 1, name: 'Court A', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Court B', createdAt: new Date(), updatedAt: new Date() },
];

function makeAction() {
  const courtService = { all: vi.fn().mockResolvedValue(fakeCourts) };
  const action = new ShowChooseCourtAction(courtService as any);
  return { action, courtService };
}

describe('ShowChooseCourtAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(ChooseCourtMessage, 'reply').mockResolvedValue({ message_id: 1 } as any);
    vi.spyOn(ChooseCourtMessage, 'editMessageText').mockResolvedValue(true);
  });

  it('fetches all courts from CourtService', async () => {
    const { action, courtService } = makeAction();
    await action.run(createMockContext(), true);
    expect(courtService.all).toHaveBeenCalledOnce();
  });

  it('calls ChooseCourtMessage.reply with courts when reply=true', async () => {
    const { action } = makeAction();
    const ctx = createMockContext();
    await action.run(ctx, true);
    expect(ChooseCourtMessage.reply).toHaveBeenCalledWith(ctx, fakeCourts);
    expect(ChooseCourtMessage.editMessageText).not.toHaveBeenCalled();
  });

  it('calls ChooseCourtMessage.editMessageText with courts when reply=false', async () => {
    const { action } = makeAction();
    const ctx = createMockContext();
    await action.run(ctx, false);
    expect(ChooseCourtMessage.editMessageText).toHaveBeenCalledWith(ctx, fakeCourts);
    expect(ChooseCourtMessage.reply).not.toHaveBeenCalled();
  });
});
