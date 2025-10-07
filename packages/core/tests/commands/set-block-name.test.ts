import { beforeEach, describe, expect, it } from 'vitest';
import type { Page } from '@craftile/types';
import { SetBlockNameCommand } from '../../src/commands/set-block-name';

const testPage: Page = {
  blocks: {
    'block-1': {
      id: 'block-1',
      type: 'button',
      properties: { text: 'Click me', variant: 'primary' },
      children: [],
    },
    'block-2': {
      id: 'block-2',
      type: 'box',
      name: 'My Container',
      properties: { className: 'container' },
      children: ['child-1'],
    },
    'child-1': {
      id: 'child-1',
      type: 'text',
      properties: { value: 'Nested text' },
      parentId: 'block-2',
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1', 'block-2'] }],
};

describe('SetBlockNameCommand', () => {
  let page: Page;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
  });

  it('should set name on block without existing name', () => {
    const command = new SetBlockNameCommand(page, {
      blockId: 'block-1',
      name: 'Primary Button',
      emit: mockEmit,
    });

    command.apply();

    const block = page.blocks['block-1'];
    expect(block.name).toBe('Primary Button');

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].event).toBe('block:update');
    expect(emittedEvents[0].data).toEqual({
      blockId: 'block-1',
      block: block,
      property: 'name',
      value: 'Primary Button',
      oldValue: undefined,
    });
  });

  it('should update existing name on block', () => {
    const command = new SetBlockNameCommand(page, {
      blockId: 'block-2',
      name: 'Updated Container',
      emit: mockEmit,
    });

    command.apply();

    const block = page.blocks['block-2'];
    expect(block.name).toBe('Updated Container');

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].event).toBe('block:update');
    expect(emittedEvents[0].data).toEqual({
      blockId: 'block-2',
      block: block,
      property: 'name',
      value: 'Updated Container',
      oldValue: 'My Container',
    });
  });

  it('should revert name change to undefined', () => {
    const command = new SetBlockNameCommand(page, {
      blockId: 'block-1',
      name: 'Primary Button',
      emit: mockEmit,
    });

    const block = page.blocks['block-1'];
    expect(block.name).toBeUndefined();

    command.apply();
    expect(block.name).toBe('Primary Button');

    command.revert();
    expect(block.name).toBeUndefined();

    expect(emittedEvents).toHaveLength(2);
    expect(emittedEvents[1].event).toBe('block:update');
    expect(emittedEvents[1].data.value).toBeUndefined();
    expect(emittedEvents[1].data.oldValue).toBe('Primary Button');
  });

  it('should revert name change to previous value', () => {
    const command = new SetBlockNameCommand(page, {
      blockId: 'block-2',
      name: 'Updated Container',
      emit: mockEmit,
    });

    const block = page.blocks['block-2'];
    const originalName = block.name;

    command.apply();
    expect(block.name).toBe('Updated Container');

    command.revert();
    expect(block.name).toBe(originalName);

    expect(emittedEvents).toHaveLength(2);
    expect(emittedEvents[1].event).toBe('block:update');
    expect(emittedEvents[1].data.value).toBe('My Container');
  });
});
