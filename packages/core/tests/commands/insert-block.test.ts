import { beforeEach, describe, expect, it } from 'vitest';
import type { BlockSchema, Page } from '@craftile/types';
import { InsertBlockCommand } from '../../src/commands/insert-block';

const testPage: Page = {
  blocks: {
    'existing-block': {
      id: 'existing-block',
      type: 'text',
      properties: { value: 'Existing' },
      children: [],
    },
    'parent-block': {
      id: 'parent-block',
      type: 'box',
      properties: { className: 'parent' },
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['existing-block', 'parent-block'] }],
};

const textSchema: BlockSchema = {
  type: 'text',
  properties: [{ id: 'value', type: 'text', label: 'Value', default: 'Default Text' }],
  accepts: [],
};

const buttonSchema: BlockSchema = {
  type: 'button',
  meta: {
    name: 'Button',
  },
  properties: [{ id: 'text', type: 'text', label: 'Text', default: 'Click me' }],
  accepts: [],
};

describe('InsertBlockCommand', () => {
  let page: Page;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
  });

  describe('Basic Insertion', () => {
    it('should insert block in region', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        blockSchema: textSchema,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;
      const initialRegionLength = page.regions[0].blocks.length;

      command.apply();

      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 1);
      expect(page.regions[0].blocks).toHaveLength(initialRegionLength + 1);

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock).toBeDefined();
      expect(insertedBlock.type).toBe('text');
      expect(insertedBlock.properties.value).toBe('Default Text');

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:insert');
      expect(emittedEvents[0].data).toEqual({
        blockId: insertedId,
        block: insertedBlock,
        parentId: undefined,
        index: 2, // Should be at end of main region
        regionId: 'main',
      });
    });

    it('should insert block at specific index', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        index: 1,
        blockSchema: textSchema,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      expect(page.regions[0].blocks[1]).toBe(insertedId);

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:insert');
      expect(emittedEvents[0].data.index).toBe(1);
    });

    it('should insert block as child', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        parentId: 'parent-block',
        blockSchema: textSchema,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const parentBlock = page.blocks['parent-block'];
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock).toBeDefined();
      expect(insertedBlock.parentId).toBe('parent-block');
      expect(parentBlock.children).toContain(insertedId);
    });
  });

  describe('Validation', () => {
    it('should reject insertion into a non-existent region without mutating the page', () => {
      const pageBefore = structuredClone(page);
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        regionId: 'missing',
        blockSchema: textSchema,
        emit: mockEmit,
      });

      expect(() => command.apply()).toThrow('Region not found: missing');
      expect(page).toEqual(pageBefore);
      expect(emittedEvents).toHaveLength(0);
    });

    it('should throw error for non-existent parent', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        parentId: 'non-existent-parent',
        blockSchema: textSchema,
        emit: mockEmit,
      });

      expect(() => {
        command.apply();
      }).toThrow('Parent block not found: non-existent-parent');
    });

    it('rejects insertion that would split the dynamic-children group', () => {
      // parent-block: [dynamic-1, static-1] — dynamic group must stay before static-1
      page.blocks['parent-block'].children = ['dynamic-1', 'static-1'];
      page.blocks['dynamic-1'] = {
        id: 'dynamic-1',
        type: 'text',
        properties: {},
        parentId: 'parent-block',
        children: [],
      };
      page.blocks['static-1'] = {
        id: 'static-1',
        type: 'text',
        properties: {},
        parentId: 'parent-block',
        children: [],
        static: true,
      };

      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        parentId: 'parent-block',
        index: 2,
        blockSchema: textSchema,
        emit: mockEmit,
      });

      const blocksBefore = Object.keys(page.blocks).length;

      expect(() => command.apply()).toThrow(/not a valid slot/);

      // No leak: the new block is never added to page.blocks on a rejected insertion
      expect(Object.keys(page.blocks)).toHaveLength(blocksBefore);
      expect(emittedEvents).toHaveLength(0);
    });

    it('rejects insertion wedged between two adjacent static children', () => {
      const setupAllStaticParent = () => {
        page = structuredClone(testPage);
        page.blocks['parent-block'].children = ['static-a', 'static-b'];
        page.blocks['static-a'] = {
          id: 'static-a',
          type: 'text',
          properties: {},
          parentId: 'parent-block',
          children: [],
          static: true,
        };
        page.blocks['static-b'] = {
          id: 'static-b',
          type: 'text',
          properties: {},
          parentId: 'parent-block',
          children: [],
          static: true,
        };
      };

      // Between the two statics: rejected
      setupAllStaticParent();
      const blocksBefore = Object.keys(page.blocks).length;
      const reject = new InsertBlockCommand(page, {
        blockType: 'text',
        parentId: 'parent-block',
        index: 1,
        blockSchema: textSchema,
        emit: mockEmit,
      });
      expect(() => reject.apply()).toThrow(/not a valid slot/);
      expect(Object.keys(page.blocks)).toHaveLength(blocksBefore);

      // Outer-leading edge: allowed
      setupAllStaticParent();
      const before = new InsertBlockCommand(page, {
        blockType: 'text',
        parentId: 'parent-block',
        index: 0,
        blockSchema: textSchema,
        emit: mockEmit,
      });
      expect(() => before.apply()).not.toThrow();

      // Outer-trailing edge: allowed (fresh parent state)
      setupAllStaticParent();
      const after = new InsertBlockCommand(page, {
        blockType: 'text',
        parentId: 'parent-block',
        index: 2,
        blockSchema: textSchema,
        emit: mockEmit,
      });
      expect(() => after.apply()).not.toThrow();
    });

    it('allows insertion that keeps the dynamic-children group contiguous', () => {
      // parent-block: [dynamic-1, static-1] — index 0 and 1 both stay in the leading group
      page.blocks['parent-block'].children = ['dynamic-1', 'static-1'];
      page.blocks['dynamic-1'] = {
        id: 'dynamic-1',
        type: 'text',
        properties: {},
        parentId: 'parent-block',
        children: [],
      };
      page.blocks['static-1'] = {
        id: 'static-1',
        type: 'text',
        properties: {},
        parentId: 'parent-block',
        children: [],
        static: true,
      };

      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        parentId: 'parent-block',
        index: 1,
        blockSchema: textSchema,
        emit: mockEmit,
      });

      expect(() => command.apply()).not.toThrow();
      expect(page.blocks['parent-block'].children[1]).toBe(command.getBlockId());
    });
  });

  describe('Command Revert', () => {
    it('should revert block insertion', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        blockSchema: textSchema,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;
      const initialRegionBlocks = [...page.regions[0].blocks];

      command.apply();
      const insertedId = command.getBlockId();
      expect(page.blocks[insertedId]).toBeDefined();
      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:insert');

      command.revert();
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount);
      expect(page.blocks[insertedId]).toBeUndefined();
      expect(page.regions[0].blocks).toEqual(initialRegionBlocks);

      expect(emittedEvents).toHaveLength(2);
      expect(emittedEvents[1].event).toBe('block:remove');
      expect(emittedEvents[1].data.blockId).toBe(insertedId);
    });
  });

  describe('Block Naming', () => {
    it('should set block name from schema meta name', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'button',
        blockSchema: buttonSchema,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock.name).toBe('Button');
    });

    it('should set block name to block type if no schema meta name', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        blockSchema: textSchema,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock.name).toBe('text');
    });

    it('should set block name to block type if no schema provided', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'custom-block',
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock.name).toBe('custom-block');
    });
  });
});
