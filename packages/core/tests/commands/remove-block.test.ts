import { beforeEach, describe, expect, it } from 'vitest';
import type { Page } from '@craftile/types';
import { RemoveBlockCommand } from '../../src/commands/remove-block';

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
      children: ['block-2-1'],
    },
    'block-2-1': {
      id: 'block-2-1',
      type: 'text',
      properties: { value: 'Nested text' },
      parentId: 'block-2',
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1', 'block-2'] }],
};

describe('RemoveBlockCommand', () => {
  let page: Page;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
  });

  describe('Basic Removal', () => {
    it('should remove top-level block from region', () => {
      const command = new RemoveBlockCommand(page, {
        blockId: 'block-1',
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;

      command.apply();

      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount - 1);
      expect(page.blocks['block-1']).toBeUndefined();
      expect(page.regions[0].blocks).not.toContain('block-1');
      expect(page.regions[0].blocks).toEqual(['block-2']);

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:remove');
      expect(emittedEvents[0].data.blockId).toBe('block-1');
    });

    it('should remove child block from parent', () => {
      const command = new RemoveBlockCommand(page, {
        blockId: 'block-2-1',
        emit: mockEmit,
      });

      const parentBlock = page.blocks['block-2'];
      const initialChildCount = parentBlock.children.length;

      command.apply();

      expect(parentBlock.children).toHaveLength(initialChildCount - 1);
      expect(parentBlock.children).not.toContain('block-2-1');
      expect(page.blocks['block-2-1']).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should throw error for non-existent block', () => {
      const command = new RemoveBlockCommand(page, {
        blockId: 'non-existent-block',
        emit: mockEmit,
      });

      expect(() => {
        command.apply();
      }).toThrow('Block not found: non-existent-block');
    });
  });

  describe('Command Revert', () => {
    it('should revert block removal', () => {
      const command = new RemoveBlockCommand(page, {
        blockId: 'block-1',
        emit: mockEmit,
      });

      const originalBlock = structuredClone(page.blocks['block-1']);
      const originalRegionBlocks = [...page.regions[0].blocks];
      const originalBlockCount = Object.keys(page.blocks).length;

      command.apply();
      expect(page.blocks['block-1']).toBeUndefined();

      command.revert();
      expect(Object.keys(page.blocks)).toHaveLength(originalBlockCount);
      expect(page.blocks['block-1']).toBeDefined();
      expect(page.blocks['block-1']).toEqual(originalBlock);
      expect(page.regions[0].blocks).toEqual(originalRegionBlocks);
    });
  });
});
