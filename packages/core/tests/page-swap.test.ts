import { beforeEach, describe, expect, it } from 'vitest';
import { Engine } from '../src/engine';
import type { BlockSchema, Page } from '@craftile/types';

const testPage: Page = {
  blocks: {
    box: { id: 'box', type: 'box', properties: { className: 'wrap' }, children: ['text-1', 'text-2'] },
    'text-1': { id: 'text-1', type: 'text', properties: { value: 'One' }, children: [], parentId: 'box' },
    'text-2': { id: 'text-2', type: 'text', properties: { value: 'Two' }, children: [], parentId: 'box' },
    'root-text': { id: 'root-text', type: 'text', properties: { value: 'Root' }, children: [] },
  },
  regions: [{ id: 'main', name: 'main', blocks: ['box', 'root-text'] }],
};

const testSchemas: BlockSchema[] = [
  {
    type: 'box',
    properties: [{ type: 'text', label: 'Class Name', default: '', id: 'className' }],
    accepts: ['*'],
    presets: [
      {
        name: 'Box with text',
        properties: { className: 'preset' },
        children: [{ type: 'text', properties: { value: 'Preset child' } }],
      },
    ],
  },
  {
    type: 'text',
    properties: [{ type: 'text', label: 'Value', default: 'Text', id: 'value' }],
    accepts: [],
  },
];

/**
 * Swap the engine's live page object for a structured clone, the way an external
 * consumer re-syncing server state does. Every command created before this call
 * must keep working against the new object.
 */
function swapPage(engine: Engine): void {
  (engine as any).replacePageState(engine.getPage());
}

describe('history across page object swaps', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine({ page: structuredClone(testPage), blockSchemas: testSchemas });
  });

  it('insertBlock: undo removes and redo restores the block on the swapped page', () => {
    const blockId = engine.insertBlock('text', { parentId: 'box' });
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeUndefined();
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeDefined();
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2', blockId]);
  });

  it('insertBlock into a region: undo removes and redo restores the root block', () => {
    const blockId = engine.insertBlock('text', { index: 0 });
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeUndefined();
    expect(engine.getPage().regions[0].blocks).toEqual(['box', 'root-text']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().regions[0].blocks).toEqual([blockId, 'box', 'root-text']);
  });

  it('insertBlockFromPreset: undo removes the whole preset subtree on the swapped page', () => {
    const blockId = engine.insertBlockFromPreset('box', 0);
    const childId = engine.getPage().blocks[blockId].children[0];
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeUndefined();
    expect(engine.getPage().blocks[childId]).toBeUndefined();
    expect(engine.getPage().regions[0].blocks).toEqual(['box', 'root-text']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeDefined();
    expect(engine.getPage().regions[0].blocks).toEqual(['box', 'root-text', blockId]);
  });

  it('pasteBlock: undo removes the pasted subtree on the swapped page', () => {
    const structure = engine.exportBlockAsNestedStructure('box');
    const blockId = engine.pasteBlock(structure, { index: 0 });
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeUndefined();
    expect(engine.getPage().regions[0].blocks).toEqual(['box', 'root-text']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().regions[0].blocks).toEqual([blockId, 'box', 'root-text']);
  });

  it('removeBlock: undo restores the block into the swapped page', () => {
    engine.removeBlock('text-1');
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['text-1']).toMatchObject({ properties: { value: 'One' } });
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks['text-1']).toBeUndefined();
    expect(engine.getPage().blocks.box.children).toEqual(['text-2']);
  });

  it('moveBlock within a parent: undo restores the order on the swapped page', () => {
    engine.moveBlock('text-2', { targetParentId: 'box', targetIndex: 0 });
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks.box.children).toEqual(['text-2', 'text-1']);
  });

  it('moveBlock to a region: undo restores the parent on the swapped page', () => {
    engine.moveBlock('text-1', { targetRegionId: 'main', targetIndex: 0 });
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2']);
    expect(engine.getPage().regions[0].blocks).toEqual(['box', 'root-text']);
    expect(engine.getPage().blocks['text-1'].parentId).toBe('box');

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks.box.children).toEqual(['text-2']);
    expect(engine.getPage().regions[0].blocks).toEqual(['text-1', 'box', 'root-text']);
    expect(engine.getPage().blocks['text-1'].parentId).toBeUndefined();
  });

  it('toggleBlock: undo and redo act on the swapped page', () => {
    engine.toggleBlock('text-1');
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].disabled).toBeFalsy();

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].disabled).toBe(true);
  });

  it('setBlockProperty: undo and redo act on the swapped page', () => {
    engine.setBlockProperty('text-1', 'value', 'Changed');
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].properties.value).toBe('One');

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].properties.value).toBe('Changed');
  });

  it('setBlockProperty: revert is a no-op when the block is gone from the swapped page', () => {
    engine.setBlockProperty('text-1', 'value', 'Changed');
    const page = engine.getPage();
    delete page.blocks['text-1'];
    page.blocks.box.children = ['text-2'];
    (engine as any).replacePageState(page);

    expect(() => engine.undo()).not.toThrow();
    expect(engine.getPage().blocks['text-1']).toBeUndefined();
  });

  it('setBlockName: undo and redo act on the swapped page', () => {
    engine.setBlockName('text-1', 'Renamed');
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].name).toBeUndefined();

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].name).toBe('Renamed');
  });

  it('duplicateBlock: undo removes the duplicate from the swapped page', () => {
    const duplicateId = engine.duplicateBlock('text-1');
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[duplicateId]).toBeUndefined();
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks.box.children).toHaveLength(3);
    expect(engine.getPage().blocks.box.children[0]).toBe('text-1');
  });

  it('replaceRegion: undo restores the previous region blocks on the swapped page', () => {
    engine.replaceRegion('main', [{ type: 'text', properties: { value: 'Replacement' }, children: [] }]);
    const replacementId = engine.getPage().regions[0].blocks[0];
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().regions[0].blocks).toEqual(['box', 'root-text']);
    expect(engine.getPage().blocks[replacementId]).toBeUndefined();
    expect(engine.getPage().blocks['text-1']).toBeDefined();

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().regions[0].blocks).toEqual([replacementId]);
    expect(engine.getPage().blocks.box).toBeUndefined();
  });

  it('batch: undo reverts every grouped command on the swapped page', () => {
    engine.batch(() => {
      engine.setBlockProperty('text-1', 'value', 'Batched');
      engine.toggleBlock('text-2', true);
      engine.insertBlock('text', { parentId: 'box' });
    });
    swapPage(engine);

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].properties.value).toBe('One');
    expect(engine.getPage().blocks['text-2'].disabled).toBeFalsy();
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks['text-1'].properties.value).toBe('Batched');
    expect(engine.getPage().blocks['text-2'].disabled).toBe(true);
    expect(engine.getPage().blocks.box.children).toHaveLength(3);
  });

  it('replacePage followed by undo of an earlier insertBlock', () => {
    const blockId = engine.insertBlock('text', { parentId: 'box' });
    engine.replacePage({
      blocks: { solo: { id: 'solo', type: 'text', properties: { value: 'Solo' }, children: [] } },
      regions: [{ id: 'main', name: 'main', blocks: ['solo'] }],
    });

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeDefined();

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeUndefined();
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2']);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks.box.children).toEqual(['text-1', 'text-2', blockId]);

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks.solo).toBeDefined();
    expect(engine.getPage().blocks.box).toBeUndefined();
  });
});
