import { beforeEach, describe, expect, it } from 'vitest';
import { BlocksManager } from '../../src/blocks-manager';
import { Engine } from '../../src/engine';
import { ReplaceRegionCommand } from '../../src/commands/replace-region';
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

function createBlocksManager(): BlocksManager {
  const blocksManager = new BlocksManager();
  testSchemas.forEach((schema) => blocksManager.register(schema.type, schema));
  return blocksManager;
}

describe('ReplaceRegionCommand', () => {
  let page: Page;
  let engine: Engine;

  beforeEach(() => {
    page = structuredClone(testPage);
    engine = new Engine({
      page: structuredClone(testPage),
      blockSchemas: testSchemas,
    });
  });

  it('should replace a region and restore it on revert', () => {
    const events: Array<{ previousRegion: { blocks: string[] }; newRegion: { blocks: string[] } }> = [];
    const command = new ReplaceRegionCommand(() => page, {
      regionId: 'main',
      structures: [{ type: 'text', properties: { value: 'Replacement' }, children: [] }],
      blocksManager: createBlocksManager(),
      emit: (event, payload) => {
        if (event === 'region:replace') {
          events.push(payload);
        }
      },
    });

    command.apply();

    expect(page.regions[0].blocks).toHaveLength(1);
    expect(page.blocks['block-1']).toBeUndefined();
    expect(page.blocks['block-2']).toBeUndefined();
    expect(page.blocks['block-2-1']).toBeUndefined();
    expect(page.blocks[page.regions[0].blocks[0]].type).toBe('text');

    command.revert();

    expect(page.regions[0].blocks).toEqual(['block-1', 'block-2']);
    expect(page.blocks['block-1']).toBeDefined();
    expect(page.blocks['block-2']).toBeDefined();
    expect(page.blocks['block-2-1']).toBeDefined();
    expect(events).toHaveLength(2);
  });

  it('should replace one region as an undoable history entry', () => {
    engine.setPage({
      blocks: {
        header: { id: 'header', type: 'text', properties: { value: 'Header' }, children: [] },
        main: { id: 'main', type: 'button', properties: { text: 'Main' }, children: [] },
      },
      regions: [
        { id: 'header', name: 'Header', blocks: ['header'] },
        { id: 'main', name: 'Main', blocks: ['main'] },
      ],
    });

    engine.replaceRegion('header', [
      {
        type: 'box',
        properties: { className: 'new-header' },
        children: [{ type: 'text', id: 'headline', properties: { value: 'New Header' }, children: [] }],
      },
    ]);

    let currentPage = engine.getPage();
    expect(currentPage.regions[0].name).toBe('Header');
    expect(currentPage.regions[0].blocks).toHaveLength(1);
    expect(currentPage.blocks.header).toBeUndefined();
    expect(currentPage.blocks.main).toBeDefined();
    expect(currentPage.blocks[currentPage.regions[0].blocks[0]].type).toBe('box');
    expect(currentPage.blocks[currentPage.regions[0].blocks[0]].children).toHaveLength(1);

    expect(engine.undo()).toBe(true);
    currentPage = engine.getPage();
    expect(currentPage.regions[0]).toEqual({ id: 'header', name: 'Header', blocks: ['header'] });
    expect(currentPage.blocks.header).toBeDefined();
    expect(currentPage.blocks.main).toBeDefined();

    expect(engine.redo()).toBe(true);
    currentPage = engine.getPage();
    expect(currentPage.blocks.header).toBeUndefined();
    expect(currentPage.blocks.main).toBeDefined();
    expect(currentPage.blocks[currentPage.regions[0].blocks[0]].type).toBe('box');
  });

  it('should emit region:replace when replacing, undoing, and redoing a region replacement', () => {
    const events: Array<{
      regionId: string;
      previousRegion: { blocks: string[] };
      newRegion: { blocks: string[] };
      removedBlocks: Record<string, any>;
      newBlocks: Record<string, any>;
    }> = [];
    engine.on('region:replace', (event) => {
      events.push(event);
    });

    engine.replaceRegion('main', [{ type: 'text', properties: { value: 'Replacement' }, children: [] }]);
    engine.undo();
    engine.redo();

    expect(events).toHaveLength(3);
    expect(events[0].regionId).toBe('main');
    expect(events[0].previousRegion.blocks).toEqual(['block-1', 'block-2']);
    expect(events[0].newRegion.blocks).toHaveLength(1);
    expect(events[0].removedBlocks['block-1']).toBeDefined();
    expect(Object.values(events[0].newBlocks)[0].type).toBe('text');
    expect(events[1].previousRegion.blocks).toEqual(events[0].newRegion.blocks);
    expect(events[1].newRegion.blocks).toEqual(['block-1', 'block-2']);
    expect(events[2].previousRegion.blocks).toEqual(['block-1', 'block-2']);
    expect(events[2].newRegion.blocks).toEqual(events[0].newRegion.blocks);
  });

  it('should normalize replacement structures with fresh ids, semantic ids, defaults, and parent links', () => {
    engine.replaceRegion('main', [
      {
        type: 'box',
        id: 'semantic-box',
        properties: {},
        children: [
          {
            type: 'button',
            id: 'semantic-button',
            properties: { text: 'CTA' },
            children: [],
          },
        ],
      },
    ]);

    const currentPage = engine.getPage();
    const rootId = currentPage.regions[0].blocks[0];
    const childId = currentPage.blocks[rootId].children[0];

    expect(rootId).not.toBe('semantic-box');
    expect(childId).not.toBe('semantic-button');
    expect(currentPage.blocks[rootId]).toMatchObject({
      type: 'box',
      semanticId: 'semantic-box',
      properties: { className: '' },
    });
    expect(currentPage.blocks[childId]).toMatchObject({
      type: 'button',
      parentId: rootId,
      semanticId: 'semantic-button',
      properties: { text: 'CTA', variant: 'primary' },
    });
  });

  it('should preserve previous command history after undoing a region replacement', () => {
    engine.setBlockProperty('block-1', 'text', 'Changed');

    engine.replaceRegion('main', [{ type: 'text', properties: { value: 'Replacement' }, children: [] }]);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['block-1'].properties.text).toBe('Changed');
    expect(engine.canUndo()).toBe(true);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['block-1'].properties.text).toBe('Click me');
  });

  it('should throw when replacing a missing region', () => {
    expect(() => {
      engine.replaceRegion('missing', [{ type: 'text', properties: { value: 'Replacement' }, children: [] }]);
    }).toThrow('Region not found: missing');
  });

  it('should throw for unknown nested block types without mutating the page', () => {
    const originalPage = engine.getPage();

    expect(() => {
      engine.replaceRegion('main', [
        {
          type: 'box',
          properties: {},
          children: [{ type: 'unknown', properties: {}, children: [] }],
        },
      ]);
    }).toThrow("Block type 'unknown' is not registered");

    expect(engine.getPage()).toEqual(originalPage);
    expect(engine.canUndo()).toBe(false);
  });

  it('should reject replaceRegion inside a batch and rollback prior batched commands', () => {
    expect(() => {
      engine.batch(() => {
        engine.setBlockProperty('block-1', 'text', 'Changed');
        engine.replaceRegion('main', [{ type: 'text', properties: { value: 'Replacement' }, children: [] }]);
      });
    }).toThrow('replaceRegion cannot be called inside batch');

    expect(engine.getPage().blocks['block-1'].properties.text).toBe('Click me');
    expect(engine.canUndo()).toBe(false);
  });

  it('should preserve additional data from replacement structures', () => {
    engine.replaceRegion('main', [
      {
        type: 'box',
        properties: {},
        keep: true,
        meta: { source: 'cms' },
        children: [{ type: 'text', properties: { value: 'Child' }, keep: false, meta: { role: 'body' } }],
      },
    ]);

    const page = engine.getPage();
    const rootId = page.regions[0].blocks[0];
    const root = page.blocks[rootId];
    const child = page.blocks[root.children[0]];

    expect(root.keep).toBe(true);
    expect(root.meta).toEqual({ source: 'cms' });
    expect(child.keep).toBe(false);
    expect(child.meta).toEqual({ role: 'body' });
    expect(child.parentId).toBe(rootId);
  });
});
