import { beforeEach, describe, expect, it } from 'vitest';
import type { Page } from '@craftile/types';
import { ToggleBlockCommand } from '../../src/commands/toggle-block';

const testPage: Page = {
  blocks: {
    'block-1': {
      id: 'block-1',
      type: 'button',
      properties: { text: 'Click me' },
      children: [],
    },
    'block-2': {
      id: 'block-2',
      type: 'box',
      properties: { className: 'container' },
      children: ['child-1'],
    },
    'child-1': {
      id: 'child-1',
      type: 'text',
      properties: { value: 'Child text' },
      parentId: 'block-2',
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1', 'block-2'] }],
};

describe('ToggleBlockCommand', () => {
  let page: Page;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
  });

  it('should disable block when not disabled', () => {
    const command = new ToggleBlockCommand(page, {
      blockId: 'block-1',
      emit: mockEmit,
    });

    command.apply();

    const block = page.blocks['block-1'];
    expect(block.disabled).toBe(true);

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].event).toBe('block:toggle');
    expect(emittedEvents[0].data).toEqual({
      blockId: 'block-1',
      disabled: true,
      previousDisabled: undefined,
    });
  });

  it('should enable block when disabled', () => {
    const block = page.blocks['block-1'];
    block.disabled = true;

    const command = new ToggleBlockCommand(page, {
      blockId: 'block-1',
      emit: mockEmit,
    });

    command.apply();

    expect(block.disabled).toBe(false);
  });

  it('should set explicit disabled state', () => {
    const command = new ToggleBlockCommand(page, {
      blockId: 'block-1',
      disabled: true,
      emit: mockEmit,
    });

    command.apply();

    const block = page.blocks['block-1'];
    expect(block.disabled).toBe(true);
  });

  it('should revert toggle operation', () => {
    const command = new ToggleBlockCommand(page, {
      blockId: 'block-1',
      emit: mockEmit,
    });

    const block = page.blocks['block-1'];
    expect(block.disabled).toBeFalsy();

    command.apply();
    expect(block.disabled).toBe(true);

    command.revert();
    expect(block.disabled).toBe(false);
  });
});
