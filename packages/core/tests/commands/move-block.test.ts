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

      expect(page.regions[0].blocks).toEqual(['block-1', 'block-2', 'block-3']);

      command.apply();

      expect(page.regions[0].blocks).toEqual(['block-2', 'block-3', 'block-1']);

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:move');
      expect(emittedEvents[0].data.blockId).toBe('block-1');
    });

    it('should emit the resolved region id when moving to the default region', () => {
      page.regions[0] = {
        id: 'main',
        name: 'Main Content',
        blocks: ['block-1', 'block-2', 'block-3'],
      };

      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetIndex: 2,
        emit: mockEmit,
      });

      command.apply();

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:move');
      expect(emittedEvents[0].data.targetRegionId).toBe('main');
    });

    it('should move block to different region', () => {
      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetRegionId: 'sidebar',
        targetIndex: 0,
        emit: mockEmit,
      });

      command.apply();

      expect(page.regions[0].blocks).toEqual(['block-2', 'block-3']);
      expect(page.regions[1].blocks).toEqual(['block-1', 'parent-a']);
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

      expect(page.regions[0].blocks).toEqual(['block-2', 'block-3']);
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

      expect(page.regions[0].blocks).toEqual(['block-1', 'child-1', 'block-2', 'block-3']);
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

  describe('Dynamic-children contiguity', () => {
    it('rejects a cross-parent move that would split the target dynamic group and restores the source', () => {
      // parent-a starts: [dynamic-a, static-a] — group sits before static-a
      page.blocks['dynamic-a'] = {
        id: 'dynamic-a',
        type: 'text',
        properties: {},
        parentId: 'parent-a',
        children: [],
      };
      page.blocks['static-a'] = {
        id: 'static-a',
        type: 'text',
        properties: {},
        parentId: 'parent-a',
        children: [],
        static: true,
      };
      page.blocks['parent-a'].children = ['dynamic-a', 'static-a'];

      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetParentId: 'parent-a',
        targetIndex: 2, // would land after static-a, splitting the dynamic group
        emit: mockEmit,
      });

      expect(() => command.apply()).toThrow(/not a valid slot/);

      // Source untouched: validation runs before any mutation
      expect(page.regions[0].blocks).toEqual(['block-1', 'block-2', 'block-3']);
      expect(page.blocks['parent-a'].children).toEqual(['dynamic-a', 'static-a']);
      expect(emittedEvents).toHaveLength(0);
    });

    it('rejects a same-parent reorder that would split the dynamic group and leaves the array untouched', () => {
      // parent-a: [dynamic-1, dynamic-2, static-1] — dynamic group sits before static-1
      page.blocks['dynamic-1'] = {
        id: 'dynamic-1',
        type: 'text',
        properties: {},
        parentId: 'parent-a',
        children: [],
      };
      page.blocks['dynamic-2'] = {
        id: 'dynamic-2',
        type: 'text',
        properties: {},
        parentId: 'parent-a',
        children: [],
      };
      page.blocks['static-1'] = {
        id: 'static-1',
        type: 'text',
        properties: {},
        parentId: 'parent-a',
        children: [],
        static: true,
      };
      page.blocks['parent-a'].children = ['dynamic-1', 'dynamic-2', 'static-1'];

      const command = new MoveBlockCommand(page, {
        blockId: 'dynamic-1',
        targetParentId: 'parent-a',
        targetIndex: 2, // moves dynamic-1 past static-1, splitting dynamic-2 from it
        emit: mockEmit,
      });

      expect(() => command.apply()).toThrow(/not a valid slot/);

      // Order untouched
      expect(page.blocks['parent-a'].children).toEqual(['dynamic-1', 'dynamic-2', 'static-1']);
      expect(emittedEvents).toHaveLength(0);
    });

    it('allows a cross-parent move into a valid slot', () => {
      page.blocks['static-a'] = {
        id: 'static-a',
        type: 'text',
        properties: {},
        parentId: 'parent-a',
        children: [],
        static: true,
      };
      page.blocks['parent-a'].children = ['static-a'];

      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetParentId: 'parent-a',
        targetIndex: 0, // before the static — first dynamic, still contiguous
        emit: mockEmit,
      });

      expect(() => command.apply()).not.toThrow();
      expect(page.blocks['parent-a'].children).toEqual(['block-1', 'static-a']);
    });
  });

  describe('Command Revert', () => {
    it('should revert region reordering', () => {
      const originalOrder = [...page.regions[0].blocks];

      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetIndex: 2,
        emit: mockEmit,
      });

      command.apply();
      expect(page.regions[0].blocks).not.toEqual(originalOrder);

      command.revert();
      expect(page.regions[0].blocks).toEqual(originalOrder);
    });

    it('should revert cross-region movement', () => {
      const originalMainBlocks = [...page.regions[0].blocks];
      const originalSidebarBlocks = [...page.regions[1].blocks];

      const command = new MoveBlockCommand(page, {
        blockId: 'block-1',
        targetRegionId: 'sidebar',
        targetIndex: 0,
        emit: mockEmit,
      });

      command.apply();
      expect(page.regions[0].blocks).not.toEqual(originalMainBlocks);

      command.revert();
      expect(page.regions[0].blocks).toEqual(originalMainBlocks);
      expect(page.regions[1].blocks).toEqual(originalSidebarBlocks);
    });
  });
});
