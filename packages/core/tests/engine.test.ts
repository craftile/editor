import { beforeEach, describe, expect, it } from 'vitest';
import { Engine } from '../src/engine';
import type { BlockSchema, Page } from '@craftile/types';

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
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1', 'block-2'] }],
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
  {
    type: 'box',
    properties: [{ type: 'text', label: 'Class Name', default: '', id: 'className' }],
    accepts: ['*'],
  },
  {
    type: 'text',
    properties: [{ type: 'text', label: 'Value', default: 'Text', id: 'value' }],
    accepts: [],
  },
];

describe('Engine', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine({
      page: structuredClone(testPage),
      blockSchemas: testSchemas,
    });
  });

  describe('Basic Functionality', () => {
    it('should create engine successfully', () => {
      expect(engine).toBeDefined();
      expect(engine.getPage).toBeDefined();
    });

    it('should return correct page', () => {
      const page = engine.getPage();
      expect(page).toBeDefined();
      expect(page.blocks).toBeDefined();
      expect(page.regions).toBeDefined();
    });

    it('should register block schemas', () => {
      const blocksManager = engine.getBlocksManager();
      expect(blocksManager.get('button')).toBeDefined();
      expect(blocksManager.get('box')).toBeDefined();
      expect(blocksManager.get('text')).toBeDefined();
    });

    it('should set new page', () => {
      const newPage: Page = {
        blocks: {
          'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
        },
        regions: [{ name: 'main', blocks: ['new-block'] }],
      };

      engine.setPage(newPage);
      const page = engine.getPage();
      expect(page.blocks['new-block']).toBeDefined();
    });
  });

  describe('Block Operations', () => {
    it('should insert block', () => {
      const blockId = engine.insertBlock('text');
      const page = engine.getPage();

      expect(blockId).toBeDefined();
      expect(page.blocks[blockId]).toBeDefined();
      expect(page.blocks[blockId].type).toBe('text');
      expect(page.regions[0].blocks).toContain(blockId);
    });

    it('should remove block', () => {
      const initialBlockCount = Object.keys(engine.getPage().blocks).length;

      engine.removeBlock('block-1');

      const page = engine.getPage();
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount - 1);
      expect(page.blocks['block-1']).toBeUndefined();
    });

    it('should move block', () => {
      const initialOrder = [...engine.getPage().regions[0].blocks];

      engine.moveBlock('block-1', { targetIndex: 1 });

      const page = engine.getPage();
      expect(page.regions[0].blocks).not.toEqual(initialOrder);
      expect(page.regions[0].blocks).toContain('block-1');
    });

    it('should toggle block', () => {
      engine.toggleBlock('block-1');

      const page = engine.getPage();
      expect(page.blocks['block-1'].disabled).toBe(true);
    });

    it('should set block property', () => {
      engine.setBlockProperty('block-1', 'text', 'Updated Button');

      const page = engine.getPage();
      expect(page.blocks['block-1'].properties.text).toBe('Updated Button');
    });

    it('should duplicate block', () => {
      const initialBlockCount = Object.keys(engine.getPage().blocks).length;

      const duplicatedId = engine.duplicateBlock('block-1');

      const page = engine.getPage();
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 1);
      expect(page.blocks[duplicatedId]).toBeDefined();
      expect(page.blocks[duplicatedId].type).toBe('button');
    });
  });

  describe('History Management', () => {
    it('should support undo/redo', () => {
      const originalText = engine.getPage().blocks['block-1'].properties.text;

      // Make a change
      engine.setBlockProperty('block-1', 'text', 'Changed');
      expect(engine.getPage().blocks['block-1'].properties.text).toBe('Changed');

      // Undo
      expect(engine.canUndo()).toBe(true);
      engine.undo();
      expect(engine.getPage().blocks['block-1'].properties.text).toBe(originalText);

      // Redo
      expect(engine.canRedo()).toBe(true);
      engine.redo();
      expect(engine.getPage().blocks['block-1'].properties.text).toBe('Changed');
    });

    it('should keep setPage non-undoable', () => {
      engine.setBlockProperty('block-1', 'text', 'Changed');
      expect(engine.canUndo()).toBe(true);

      engine.setPage({
        blocks: {
          'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
        },
        regions: [{ name: 'main', blocks: ['new-block'] }],
      });

      expect(engine.canUndo()).toBe(false);
      expect(engine.undo()).toBe(false);
      expect(engine.getPage().blocks['new-block']).toBeDefined();
    });

    it('should replace the page as an undoable history entry', () => {
      const replacementPage: Page = {
        blocks: {
          'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
        },
        regions: [{ name: 'main', blocks: ['new-block'] }],
      };

      engine.replacePage(replacementPage);
      expect(engine.getPage().blocks['new-block']).toBeDefined();
      expect(engine.getPage().blocks['block-1']).toBeUndefined();

      expect(engine.undo()).toBe(true);
      expect(engine.getPage().blocks['block-1']).toBeDefined();
      expect(engine.getPage().blocks['new-block']).toBeUndefined();

      expect(engine.redo()).toBe(true);
      expect(engine.getPage().blocks['new-block']).toBeDefined();
      expect(engine.getPage().blocks['block-1']).toBeUndefined();
    });

    it('should emit page:replace when replacing, undoing, and redoing a page replacement', () => {
      const events: Array<{ previousPage: Page; newPage: Page }> = [];
      engine.on('page:replace', (event) => {
        events.push(event);
      });

      const replacementPage: Page = {
        blocks: {
          'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
        },
        regions: [{ name: 'main', blocks: ['new-block'] }],
      };

      engine.replacePage(replacementPage);
      engine.undo();
      engine.redo();

      expect(events).toHaveLength(3);
      expect(events[0].previousPage.blocks['block-1']).toBeDefined();
      expect(events[0].newPage.blocks['new-block']).toBeDefined();
      expect(events[1].previousPage.blocks['new-block']).toBeDefined();
      expect(events[1].newPage.blocks['block-1']).toBeDefined();
      expect(events[2].previousPage.blocks['block-1']).toBeDefined();
      expect(events[2].newPage.blocks['new-block']).toBeDefined();
    });

    it('should preserve previous command history after undoing a page replacement', () => {
      engine.setBlockProperty('block-1', 'text', 'Changed');

      engine.replacePage({
        blocks: {
          'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
        },
        regions: [{ name: 'main', blocks: ['new-block'] }],
      });

      expect(engine.undo()).toBe(true);
      expect(engine.getPage().blocks['block-1'].properties.text).toBe('Changed');
      expect(engine.canUndo()).toBe(true);

      expect(engine.undo()).toBe(true);
      expect(engine.getPage().blocks['block-1'].properties.text).toBe('Click me');
    });

    it('should reject replacePage inside a batch and rollback prior batched commands', () => {
      expect(() => {
        engine.batch(() => {
          engine.setBlockProperty('block-1', 'text', 'Changed');
          engine.replacePage({
            blocks: {
              'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
            },
            regions: [{ name: 'main', blocks: ['new-block'] }],
          });
        });
      }).toThrow('replacePage cannot be called inside batch');

      expect(engine.getPage().blocks['block-1'].properties.text).toBe('Click me');
      expect(engine.canUndo()).toBe(false);
    });

    it('should normalize replaced pages like setPage', () => {
      engine.replacePage({
        blocks: {
          parent: { id: 'parent', type: 'box', properties: {}, children: ['child'] },
          child: { id: 'child', type: 'text', properties: {}, children: [] },
        },
        regions: [],
      });

      const page = engine.getPage();
      expect(page.regions).toEqual([{ id: 'main', name: 'main', blocks: ['parent', 'child'] }]);
      expect(page.blocks.child.parentId).toBe('parent');
    });

    it('should undo and redo batched operations as a single history entry', () => {
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
});
