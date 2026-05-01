import { vi } from 'vitest';

function createModelMock() {
  return {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  };
}

export function createMockPrisma() {
  return {
    booking: createModelMock(),
    user: createModelMock(),
    court: createModelMock(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  };
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;
