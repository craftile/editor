import { beforeEach, describe, expect, it } from 'vitest';
import { Engine } from '../../src/engine';
import { BatchCommand } from '../../src/commands/batch';
import type { BlockSchema, Page } from '@craftile/types';
import type { Command } from '../../src/types';

const testPage: Page = {
  blocks: {
    'block-1': {
      id: 'block-1',
      type: 'button',
      properties: { text: 'Click me', variant: 'primary' },
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1'] }],
};

const testSchemas: BlockSchema[] = [
  {
    type: 'button',
    properties: [
      { type: 'text', label: 'Text', default: 'Button', id: 'text' },
      { type: 'select', label: 'Variant', options: ['primary', 'secondary'], default: 'primary', id: 'variant' },
    ],
    accepts: [],
  },
];

describe('BatchCommand', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine({
      page: structuredClone(testPage),
      blockSchemas: testSchemas,
    });
  });

  it('should apply commands in order and revert them in reverse order', () => {
    const calls: string[] = [];
    const commands: Command[] = [
      {
        apply: () => calls.push('apply-first'),
        revert: () => calls.push('revert-first'),
      },
      {
        apply: () => calls.push('apply-second'),
        revert: () => calls.push('revert-second'),
      },
    ];

    const command = new BatchCommand(commands);
    command.apply();
    command.revert();

    expect(calls).toEqual(['apply-first', 'apply-second', 'revert-second', 'revert-first']);
  });

  it('should undo and redo batched engine operations as a single history entry', () => {
    engine.batch(() => {
      engine.setBlockProperty('block-1', 'text', 'Changed');
      engine.setBlockProperty('block-1', 'variant', 'secondary');
    });

    expect(engine.getPage().blocks['block-1'].properties).toMatchObject({
      text: 'Changed',
      variant: 'secondary',
    });

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['block-1'].properties).toMatchObject({
      text: 'Click me',
      variant: 'primary',
    });
    expect(engine.canUndo()).toBe(false);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks['block-1'].properties).toMatchObject({
      text: 'Changed',
      variant: 'secondary',
    });
  });

  it('should flatten nested batches into one history entry', () => {
    engine.batch(() => {
      engine.setBlockProperty('block-1', 'text', 'Outer');
      engine.batch(() => {
        engine.setBlockProperty('block-1', 'variant', 'secondary');
      });
    });

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['block-1'].properties).toMatchObject({
      text: 'Click me',
      variant: 'primary',
    });
    expect(engine.canUndo()).toBe(false);
  });

  it('should rollback only failed nested batch operations when the outer batch catches the error', () => {
    engine.batch(() => {
      engine.setBlockProperty('block-1', 'text', 'Outer');

      try {
        engine.batch(() => {
          engine.setBlockProperty('block-1', 'variant', 'secondary');
          engine.setBlockProperty('missing-block', 'text', 'Nope');
        });
      } catch {
        engine.setBlockName('block-1', 'Renamed');
      }
    });

    expect(engine.getPage().blocks['block-1']).toMatchObject({
      name: 'Renamed',
      properties: {
        text: 'Outer',
        variant: 'primary',
      },
    });

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['block-1']).toMatchObject({
      name: undefined,
      properties: {
        text: 'Click me',
        variant: 'primary',
      },
    });
    expect(engine.canUndo()).toBe(false);
  });

  it('should rollback a failed batch without adding history', () => {
    expect(() => {
      engine.batch(() => {
        engine.setBlockProperty('block-1', 'text', 'Changed');
        engine.setBlockProperty('missing-block', 'text', 'Nope');
      });
    }).toThrow('Block not found: missing-block');

    expect(engine.getPage().blocks['block-1'].properties.text).toBe('Click me');
    expect(engine.canUndo()).toBe(false);
  });

  it('should not add an empty batch to history', () => {
    engine.batch(() => {});

    expect(engine.canUndo()).toBe(false);
  });

  it('should clear redo history when committing a new batch after undo', () => {
    engine.setBlockProperty('block-1', 'text', 'First');
    expect(engine.undo()).toBe(true);
    expect(engine.canRedo()).toBe(true);

    engine.batch(() => {
      engine.setBlockProperty('block-1', 'text', 'Second');
      engine.setBlockProperty('block-1', 'variant', 'secondary');
    });

    expect(engine.canRedo()).toBe(false);
    expect(engine.redo()).toBe(false);
    expect(engine.getPage().blocks['block-1'].properties).toMatchObject({
      text: 'Second',
      variant: 'secondary',
    });
  });
});
