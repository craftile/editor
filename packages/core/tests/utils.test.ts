import { describe, expect, it } from 'vitest';
import type { Block } from '@craftile/types';
import { canInsertDynamicChildAt } from '../src/utils';

const makeBlock = (id: string, isStatic: boolean): Block => ({
  id,
  type: 'mock',
  properties: {},
  children: [],
  static: isStatic || undefined,
});

describe('canInsertDynamicChildAt', () => {
  it('allows any index when there are no children', () => {
    const blocks: Record<string, Block> = {};
    expect(canInsertDynamicChildAt([], blocks, 0)).toBe(true);
  });

  it('allows only the outer edges when all children are static', () => {
    const blocks = {
      s1: makeBlock('s1', true),
      s2: makeBlock('s2', true),
    };
    const children = ['s1', 's2'];
    expect(canInsertDynamicChildAt(children, blocks, 0)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 1)).toBe(false);
    expect(canInsertDynamicChildAt(children, blocks, 2)).toBe(true);
  });

  it('rejects every interior gap of a static-only run', () => {
    const blocks = {
      s1: makeBlock('s1', true),
      s2: makeBlock('s2', true),
      s3: makeBlock('s3', true),
    };
    const children = ['s1', 's2', 's3'];
    expect(canInsertDynamicChildAt(children, blocks, 0)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 1)).toBe(false);
    expect(canInsertDynamicChildAt(children, blocks, 2)).toBe(false);
    expect(canInsertDynamicChildAt(children, blocks, 3)).toBe(true);
  });

  it('allows both edges of a single-static parent', () => {
    const blocks = { s1: makeBlock('s1', true) };
    const children = ['s1'];
    expect(canInsertDynamicChildAt(children, blocks, 0)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 1)).toBe(true);
  });

  it('locks to the leading dynamic group', () => {
    const blocks = {
      d1: makeBlock('d1', false),
      s1: makeBlock('s1', true),
    };
    const children = ['d1', 's1'];
    expect(canInsertDynamicChildAt(children, blocks, 0)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 1)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 2)).toBe(false);
  });

  it('locks to the trailing dynamic group', () => {
    const blocks = {
      s1: makeBlock('s1', true),
      d1: makeBlock('d1', false),
    };
    const children = ['s1', 'd1'];
    expect(canInsertDynamicChildAt(children, blocks, 0)).toBe(false);
    expect(canInsertDynamicChildAt(children, blocks, 1)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 2)).toBe(true);
  });

  it('locks to a middle dynamic group between two statics', () => {
    const blocks = {
      s1: makeBlock('s1', true),
      d1: makeBlock('d1', false),
      d2: makeBlock('d2', false),
      s2: makeBlock('s2', true),
    };
    const children = ['s1', 'd1', 'd2', 's2'];
    expect(canInsertDynamicChildAt(children, blocks, 0)).toBe(false);
    expect(canInsertDynamicChildAt(children, blocks, 1)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 2)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 3)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 4)).toBe(false);
  });

  it('allows any index when all children are dynamic', () => {
    const blocks = {
      d1: makeBlock('d1', false),
      d2: makeBlock('d2', false),
    };
    const children = ['d1', 'd2'];
    expect(canInsertDynamicChildAt(children, blocks, 0)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 1)).toBe(true);
    expect(canInsertDynamicChildAt(children, blocks, 2)).toBe(true);
  });
});
