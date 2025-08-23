import { SetBlockPropertyCommand } from './../../src/commands/set-block-property';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Page } from '../../src/types';

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

describe('SetBlockPropertyCommand', () => {
  let page: Page;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
  });

  it('should set property on block', () => {
    const command = new SetBlockPropertyCommand(page, {
      blockId: 'block-1',
      propertyKey: 'text',
      propertyValue: 'Updated Button',
      emit: mockEmit,
    });

    command.apply();

    const block = page.blocks['block-1'];
    expect(block.properties.text).toBe('Updated Button');

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].event).toBe('block:property:set');
    expect(emittedEvents[0].data).toEqual({
      blockId: 'block-1',
      key: 'text',
      value: 'Updated Button',
      oldValue: 'Click me',
    });
  });

  it('should revert property change', () => {
    const command = new SetBlockPropertyCommand(page, {
      blockId: 'block-1',
      propertyKey: 'text',
      propertyValue: 'Updated Button',
      emit: mockEmit,
    });

    const block = page.blocks['block-1'];
    const originalValue = block.properties.text;

    command.apply();
    expect(block.properties.text).toBe('Updated Button');

    command.revert();
    expect(block.properties.text).toBe(originalValue);
  });
});
