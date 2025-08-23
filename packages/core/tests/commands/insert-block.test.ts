import { beforeEach, describe, expect, it } from 'vitest';
import type { BlockSchema } from '@craftile/types';
import type { Page } from '../../src/types';
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
      const initialRegionLength = page.regions![0].blocks.length;

      command.apply();

      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 1);
      expect(page.regions![0].blocks).toHaveLength(initialRegionLength + 1);

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
        regionName: 'main',
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
      expect(page.regions![0].blocks[1]).toBe(insertedId);

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
  });

  describe('Command Revert', () => {
    it('should revert block insertion', () => {
      const command = new InsertBlockCommand(page, {
        blockType: 'text',
        blockSchema: textSchema,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;
      const initialRegionBlocks = [...page.regions![0].blocks];

      command.apply();
      const insertedId = command.getBlockId();
      expect(page.blocks[insertedId]).toBeDefined();
      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:insert');

      command.revert();
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount);
      expect(page.blocks[insertedId]).toBeUndefined();
      expect(page.regions![0].blocks).toEqual(initialRegionBlocks);

      expect(emittedEvents).toHaveLength(2);
      expect(emittedEvents[1].event).toBe('block:remove');
      expect(emittedEvents[1].data.blockId).toBe(insertedId);
    });
  });
});
