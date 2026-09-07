// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { CraftileEditor } from '../src/editor';
import type { BlockSchema, Page } from '@craftile/types';

const testPage: Page = {
  blocks: {
    'block-1': {
      id: 'block-1',
      type: 'button',
      properties: { text: 'Click me', variant: 'primary' },
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1'] }],
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
    type: 'text',
    properties: [{ type: 'text', label: 'Value', default: 'Text', id: 'value' }],
    accepts: [],
  },
];

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

vi.stubGlobal('ResizeObserver', ResizeObserverStub);

describe('CraftileEditor', () => {
  it('should expose batched history operations', () => {
    const editor = new CraftileEditor({
      initialPage: structuredClone(testPage),
      blockSchemas: testSchemas,
    });

    editor.batch(() => {
      editor.setBlockProperty('block-1', 'text', 'Changed');
      editor.setBlockProperty('block-1', 'variant', 'secondary');
    });

    expect(editor.engine.undo()).toBe(true);
    expect(editor.engine.getPage().blocks['block-1'].properties).toMatchObject({
      text: 'Click me',
      variant: 'primary',
    });
    expect(editor.engine.canUndo()).toBe(false);
  });

  it('should expose undoable page replacement', () => {
    const editor = new CraftileEditor({
      initialPage: structuredClone(testPage),
      blockSchemas: testSchemas,
    });

    editor.replacePage({
      blocks: {
        'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
      },
      regions: [{ name: 'main', blocks: ['new-block'] }],
    });

    expect(editor.engine.getPage().blocks['new-block']).toBeDefined();
    expect(editor.engine.undo()).toBe(true);
    expect(editor.engine.getPage().blocks['block-1']).toBeDefined();
  });

  it('should expose undoable region replacement', () => {
    const editor = new CraftileEditor({
      initialPage: structuredClone(testPage),
      blockSchemas: testSchemas,
    });

    editor.replaceRegion('main', [{ type: 'text', properties: { value: 'Region' }, children: [] }]);

    const page = editor.engine.getPage();
    const newRootId = page.regions[0].blocks[0];
    expect(page.blocks['block-1']).toBeUndefined();
    expect(page.blocks[newRootId].type).toBe('text');

    expect(editor.engine.undo()).toBe(true);
    expect(editor.engine.getPage().blocks['block-1']).toBeDefined();
  });

  it('clears the selection when the selected block is pruned by patchBlocks', () => {
    const editor = new CraftileEditor({
      initialPage: {
        blocks: {
          box: { id: 'box', type: 'box', properties: {}, children: ['block-1'] },
          'block-1': { id: 'block-1', type: 'button', properties: {}, children: [], parentId: 'box' },
        },
        regions: [{ name: 'main', blocks: ['box'] }],
      },
      blockSchemas: [...testSchemas, { type: 'box', properties: [], accepts: ['*'] }],
    });

    editor.mount(document.createElement('div'));
    editor.ui.setSelectedBlock('block-1');

    editor.engine.patchBlocks({ box: { id: 'box', type: 'box', properties: {}, children: [] } });

    expect(editor.ui.state.selectedBlockId).toBeNull();
  });

  it('keeps the selection when the selected block survives patchBlocks', () => {
    const editor = new CraftileEditor({
      initialPage: structuredClone(testPage),
      blockSchemas: testSchemas,
    });

    editor.mount(document.createElement('div'));
    editor.ui.setSelectedBlock('block-1');

    editor.engine.patchBlocks({
      'block-1': { id: 'block-1', type: 'button', properties: { text: 'Resolved' }, children: [] },
    });

    expect(editor.ui.state.selectedBlockId).toBe('block-1');
  });
});
