import { describe, expect, it } from 'vitest';
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
});
