import { describe, it, expect } from 'vitest';
import { arrayChunk } from '../../src/utils/array.utils';

describe('arrayChunk', () => {
  it('splits array into chunks of given size', () => {
    expect(arrayChunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns single chunk when size >= array length', () => {
    expect(arrayChunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });

  it('returns empty array for empty input', () => {
    expect(arrayChunk([], 3)).toEqual([]);
  });

  it('wraps single element when size > array length', () => {
    expect(arrayChunk([1], 10)).toEqual([[1]]);
  });

  it('puts each element in its own chunk when size = 1', () => {
    expect(arrayChunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
});
