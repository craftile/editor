import { beforeEach, describe, expect, it } from 'vitest';
import type { BlockSchema, Page } from '@craftile/types';
import { InsertBlockFromPresetCommand } from '../../src/commands/insert-block-from-preset';
import { BlocksManager } from '../../src/blocks-manager';

const testPage: Page = {
  blocks: {
    'existing-block': {
      id: 'existing-block',
      type: 'text',
      properties: { content: 'Existing' },
      children: [],
    },
    'parent-block': {
      id: 'parent-block',
      type: 'container',
      properties: { direction: 'vertical' },
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['existing-block', 'parent-block'] }],
};

const containerSchema: BlockSchema = {
  type: 'container',
  properties: [
    { id: 'direction', type: 'select', label: 'Direction', default: 'vertical' },
    { id: 'gap', type: 'number', label: 'Gap', default: 16 },
  ],
  accepts: ['*'],
  presets: [
    {
      name: 'Empty Container',
      properties: { gap: 24 },
    },
    {
      name: 'Heading and Text',
      properties: { gap: 12 },
      children: [
        {
          type: 'text',
          id: 'heading',
          properties: { content: '<h1>Title</h1>' },
        },
        {
          type: 'text',
          id: 'description',
          properties: { content: '<p>Description</p>' },
        },
      ],
    },
    {
      name: 'Nested Layout',
      children: [
        {
          type: 'container',
          id: 'nested-container',
          properties: { direction: 'horizontal' },
          children: [
            {
              type: 'text',
              properties: { content: 'Column 1' },
            },
            {
              type: 'text',
              properties: { content: 'Column 2' },
            },
          ],
        },
      ],
    },
  ],
};

const textSchema: BlockSchema = {
  type: 'text',
  properties: [{ id: 'content', type: 'text', label: 'Content', default: 'Default Text' }],
  accepts: [],
};

describe('InsertBlockFromPresetCommand', () => {
  let page: Page;
  let blocksManager: BlocksManager;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
    blocksManager = new BlocksManager();
    blocksManager.register('container', containerSchema);
    blocksManager.register('text', textSchema);
  });

  describe('Basic Preset Insertion', () => {
    it('should insert block with preset properties', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 0, // Empty Container preset
        blocksManager,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;

      command.apply();

      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 1);

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock).toBeDefined();
      expect(insertedBlock.type).toBe('container');
      expect(insertedBlock.properties.direction).toBe('vertical'); // From schema default
      expect(insertedBlock.properties.gap).toBe(24); // From preset override
      expect(insertedBlock.children).toHaveLength(0);

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe('block:insert');
    });

    it('should insert block with preset children', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 1, // Heading and Text preset
        blocksManager,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;

      command.apply();

      // Should create: 1 container + 2 text blocks = 3 blocks
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 3);

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock).toBeDefined();
      expect(insertedBlock.type).toBe('container');
      expect(insertedBlock.properties.gap).toBe(12); // From preset
      expect(insertedBlock.children).toHaveLength(2);

      // Check first child
      const firstChildId = insertedBlock.children[0];
      const firstChild = page.blocks[firstChildId];
      expect(firstChild).toBeDefined();
      expect(firstChild.type).toBe('text');
      expect(firstChild.semanticId).toBe('heading');
      expect(firstChild.properties.content).toBe('<h1>Title</h1>');
      expect(firstChild.parentId).toBe(insertedId);

      // Check second child
      const secondChildId = insertedBlock.children[1];
      const secondChild = page.blocks[secondChildId];
      expect(secondChild).toBeDefined();
      expect(secondChild.type).toBe('text');
      expect(secondChild.semanticId).toBe('description');
      expect(secondChild.properties.content).toBe('<p>Description</p>');
      expect(secondChild.parentId).toBe(insertedId);
    });

    it('should handle nested children', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 2, // Nested Layout preset
        blocksManager,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;

      command.apply();

      // Should create: 1 root container + 1 nested container + 2 text blocks = 4 blocks
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 4);

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      expect(insertedBlock.children).toHaveLength(1);

      // Check nested container
      const nestedContainerId = insertedBlock.children[0];
      const nestedContainer = page.blocks[nestedContainerId];
      expect(nestedContainer).toBeDefined();
      expect(nestedContainer.type).toBe('container');
      expect(nestedContainer.semanticId).toBe('nested-container');
      expect(nestedContainer.properties.direction).toBe('horizontal');
      expect(nestedContainer.parentId).toBe(insertedId);
      expect(nestedContainer.children).toHaveLength(2);

      // Check nested container's children
      const col1Id = nestedContainer.children[0];
      const col1 = page.blocks[col1Id];
      expect(col1).toBeDefined();
      expect(col1.type).toBe('text');
      expect(col1.properties.content).toBe('Column 1');
      expect(col1.parentId).toBe(nestedContainerId);

      const col2Id = nestedContainer.children[1];
      const col2 = page.blocks[col2Id];
      expect(col2).toBeDefined();
      expect(col2.type).toBe('text');
      expect(col2.properties.content).toBe('Column 2');
      expect(col2.parentId).toBe(nestedContainerId);
    });
  });

  describe('Insertion Location', () => {
    it('should insert in specified region', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 0,
        regionName: 'main',
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      expect(page.regions[0].blocks).toContain(insertedId);
    });

    it('should insert as child at specific index', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 0,
        parentId: 'parent-block',
        index: 0,
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const parentBlock = page.blocks['parent-block'];
      expect(parentBlock.children[0]).toBe(insertedId);

      const insertedBlock = page.blocks[insertedId];
      expect(insertedBlock.parentId).toBe('parent-block');
    });
  });

  describe('Validation', () => {
    it('should throw error for invalid block type', () => {
      expect(() => {
        new InsertBlockFromPresetCommand(page, {
          blockType: 'invalid-type',
          presetIndex: 0,
          blocksManager,
          emit: mockEmit,
        });
      }).toThrow("Block type 'invalid-type' not found");
    });

    it('should throw error for invalid preset index', () => {
      expect(() => {
        new InsertBlockFromPresetCommand(page, {
          blockType: 'container',
          presetIndex: 999,
          blocksManager,
          emit: mockEmit,
        });
      }).toThrow('Preset at index 999 not found');
    });

    it('should throw error for non-existent parent', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 0,
        parentId: 'non-existent-parent',
        blocksManager,
        emit: mockEmit,
      });

      expect(() => {
        command.apply();
      }).toThrow('Parent block not found: non-existent-parent');
    });
  });

  describe('Command Revert', () => {
    it('should revert preset insertion with children', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 1, // Has 2 children
        blocksManager,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;
      const initialRegionBlocks = [...page.regions[0].blocks];

      command.apply();
      const insertedId = command.getBlockId();

      // Should have created 3 blocks total
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 3);

      command.revert();

      // All blocks should be removed
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount);
      expect(page.blocks[insertedId]).toBeUndefined();
      expect(page.regions[0].blocks).toEqual(initialRegionBlocks);

      expect(emittedEvents).toHaveLength(2);
      expect(emittedEvents[1].event).toBe('block:remove');
    });

    it('should revert nested preset insertion', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 2, // Nested layout
        blocksManager,
        emit: mockEmit,
      });

      const initialBlockCount = Object.keys(page.blocks).length;

      command.apply();
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 4);

      command.revert();
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount);
    });
  });

  describe('Semantic IDs', () => {
    it('should preserve semantic IDs from preset', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 1,
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      const children = insertedBlock.children.map((id) => page.blocks[id]);

      expect(children[0].semanticId).toBe('heading');
      expect(children[1].semanticId).toBe('description');

      // Ensure actual IDs are still unique (not the semantic IDs)
      expect(children[0].id).not.toBe('heading');
      expect(children[1].id).not.toBe('description');
    });

    it('should handle missing semantic IDs', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container',
        presetIndex: 2, // Has some children without semantic IDs
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const nestedContainerId = page.blocks[insertedId].children[0];
      const nestedContainer = page.blocks[nestedContainerId];

      const textBlocks = nestedContainer.children.map((id) => page.blocks[id]);

      // Text blocks in nested layout don't have semantic IDs
      expect(textBlocks[0].semanticId).toBeUndefined();
      expect(textBlocks[1].semanticId).toBeUndefined();
    });
  });

  describe('Preset Child Metadata', () => {
    const schemaWithMetadataPreset: BlockSchema = {
      type: 'container',
      properties: [{ id: 'direction', type: 'select', label: 'Direction', default: 'vertical' }],
      accepts: ['*'],
      presets: [
        {
          name: 'Container with Custom Metadata',
          children: [
            {
              type: 'text',
              id: 'custom-text',
              name: 'Custom Text Block', // Custom name
              properties: { content: 'Custom content' },
            },
            {
              type: 'text',
              id: 'static-text',
              name: 'Static Text', // Custom name
              static: true, // Static flag
              properties: { content: 'Cannot be removed' },
            },
            {
              type: 'container',
              name: 'Nested Container',
              children: [
                {
                  type: 'text',
                  name: 'Nested Static Text',
                  static: true,
                  properties: { content: 'Nested static' },
                },
              ],
            },
          ],
        },
      ],
    };

    beforeEach(() => {
      blocksManager.register('container-metadata', schemaWithMetadataPreset);
    });

    it('should preserve custom name from preset child', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container-metadata',
        presetIndex: 0,
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      const firstChild = page.blocks[insertedBlock.children[0]];
      expect(firstChild.name).toBe('Custom Text Block');
    });

    it('should preserve static flag from preset child', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container-metadata',
        presetIndex: 0,
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      const secondChild = page.blocks[insertedBlock.children[1]];
      expect(secondChild.static).toBe(true);
      expect(secondChild.name).toBe('Static Text');
    });

    it('should preserve static flag in nested children', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container-metadata',
        presetIndex: 0,
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      // Get nested container
      const nestedContainerId = insertedBlock.children[2];
      const nestedContainer = page.blocks[nestedContainerId];
      expect(nestedContainer.name).toBe('Nested Container');

      // Check nested container's child
      const nestedChildId = nestedContainer.children[0];
      const nestedChild = page.blocks[nestedChildId];
      expect(nestedChild.name).toBe('Nested Static Text');
      expect(nestedChild.static).toBe(true);
    });

    it('should handle children without custom name or static flag', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container-metadata',
        presetIndex: 0,
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      const firstChild = page.blocks[insertedBlock.children[0]];
      // Should fall back to schema meta name, then type
      expect(firstChild.name).toBe('Custom Text Block');
      // Static should be undefined (not false)
      expect(firstChild.static).toBeUndefined();
    });

    it('should combine custom name and static flag', () => {
      const command = new InsertBlockFromPresetCommand(page, {
        blockType: 'container-metadata',
        presetIndex: 0,
        blocksManager,
        emit: mockEmit,
      });

      command.apply();

      const insertedId = command.getBlockId();
      const insertedBlock = page.blocks[insertedId];

      const secondChild = page.blocks[insertedBlock.children[1]];
      expect(secondChild.name).toBe('Static Text');
      expect(secondChild.static).toBe(true);
      expect(secondChild.semanticId).toBe('static-text');
    });
  });
});
