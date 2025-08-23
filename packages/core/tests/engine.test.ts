import { beforeEach, describe, expect, it } from 'vitest';
import { Engine } from '../src/engine';
import type { Page } from '../src/types';
import type { BlockSchema } from '@craftile/types';

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
      expect(page.regions![0].blocks).toContain(blockId);
    });

    it('should remove block', () => {
      const initialBlockCount = Object.keys(engine.getPage().blocks).length;

      engine.removeBlock('block-1');

      const page = engine.getPage();
      expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount - 1);
      expect(page.blocks['block-1']).toBeUndefined();
    });

    it('should move block', () => {
      const initialOrder = [...engine.getPage().regions![0].blocks];

      engine.moveBlock('block-1', { targetIndex: 1 });

      const page = engine.getPage();
      expect(page.regions![0].blocks).not.toEqual(initialOrder);
      expect(page.regions![0].blocks).toContain('block-1');
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
  });
});
