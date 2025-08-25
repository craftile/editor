import { beforeEach, describe, expect, it } from 'vitest';
import type { Page } from '@craftile/types';
import { MoveBlockCommand } from '../../src/commands/move-block';

const testPage: Page = {
  blocks: {
    'block-1': {
      id: 'block-1',
      type: 'button',
      properties: { text: 'Button 1' },
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
      properties: { value: 'Child 1' },
      parentId: 'block-2',
      children: [],
    },
    'block-3': {
      id: 'block-3',
      type: 'text',
      properties: { value: 'Text block' },
      children: [],
    },
    'parent-a': {
      id: 'parent-a',
      type: 'box',
      properties: { className: 'parent-a' },
      children: [],
    },
  },
  regions: [
    { name: 'main', blocks: ['block-1', 'block-2', 'block-3'] },
    { name: 'sidebar', blocks: ['parent-a'] },
  ],
};

describe('MoveBlockCommand', () => {
  let page: Page;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
  });

  describe('Basic Movement', () => {
    it('should reorder block within same region', () => {
      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetIndex: 2,
        emit: mockEmit,
      });

      expect(page.regions![0].blocks).toEqual(['block-1', 'block-2', 'block-3']);

      command.apply();

      expect(page.regions![0].blocks).toEqual(['block-2', 'block-3', 'block-1']);

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:move');
      expect(emittedEvents[0].data.blockId).toBe('block-1');
    });

    it('should move block to different region', () => {
      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetRegionName: 'sidebar',
        targetIndex: 0,
        emit: mockEmit,
      });

      command.apply();

      expect(page.regions![0].blocks).toEqual(['block-2', 'block-3']);
      expect(page.regions![1].blocks).toEqual(['block-1', 'parent-a']);
      expect(page.blocks['block-1']).toBeDefined();
    });

    it('should move top-level block to become child', () => {
      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetParentId: 'parent-a',
        targetIndex: 0,
        emit: mockEmit,
      });

      command.apply();

      expect(page.regions![0].blocks).toEqual(['block-2', 'block-3']);
      expect(page.blocks['parent-a'].children).toContain('block-1');
      expect(page.blocks['block-1'].parentId).toBe('parent-a');
    });

    it('should move child block to top-level', () => {
      const command = new MoveBlockCommand(page, {
        blockId: 'child-1',
        targetIndex: 1,
        emit: mockEmit,
      });

      command.apply();

      expect(page.regions![0].blocks).toEqual(['block-1', 'child-1', 'block-2', 'block-3']);
      expect(page.blocks['block-2'].children).not.toContain('child-1');
      expect(page.blocks['child-1'].parentId).toBeUndefined();
      expect(page.blocks['child-1']).toBeDefined();
    });

    it('should move child block between different parents', () => {
      const command = new MoveBlockCommand(page, {
        blockId: 'child-1',
        targetParentId: 'parent-a',
        targetIndex: 0,
        emit: mockEmit,
      });

      command.apply();

      expect(page.blocks['block-2'].children).not.toContain('child-1');
      expect(page.blocks['parent-a'].children).toContain('child-1');
      expect(page.blocks['child-1'].parentId).toBe('parent-a');
    });
  });

  describe('Command Revert', () => {
    it('should revert region reordering', () => {
      const originalOrder = [...page.regions![0].blocks];

      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetIndex: 2,
        emit: mockEmit,
      });

      command.apply();
      expect(page.regions![0].blocks).not.toEqual(originalOrder);

      command.revert();
      expect(page.regions![0].blocks).toEqual(originalOrder);
    });

    it('should revert cross-region movement', () => {
      const originalMainBlocks = [...page.regions![0].blocks];
      const originalSidebarBlocks = [...page.regions![1].blocks];

      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetRegionName: 'sidebar',
        targetIndex: 0,
        emit: mockEmit,
      });

      command.apply();
      expect(page.regions![0].blocks).not.toEqual(originalMainBlocks);

      command.revert();
      expect(page.regions![0].blocks).toEqual(originalMainBlocks);
      expect(page.regions![1].blocks).toEqual(originalSidebarBlocks);
    });
  });
});
