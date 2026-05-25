import { beforeEach, describe, expect, it } from 'vitest';
import { Engine } from '../../src/engine';
import { ReplacePageCommand } from '../../src/commands/replace-page';
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

const replacementPage: Page = {
  blocks: {
    'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
  },
  regions: [{ name: 'main', blocks: ['new-block'] }],
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

describe('ReplacePageCommand', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine({
      page: structuredClone(testPage),
      blockSchemas: testSchemas,
    });
  });

  it('should swap page snapshots and emit page:replace on apply and revert', () => {
    let page = structuredClone(testPage);
    const events: Array<{ previousPage: Page; newPage: Page }> = [];
    const command = new ReplacePageCommand(
      page,
      structuredClone(replacementPage),
      (nextPage) => {
        page = nextPage;
      },
      (event, payload) => {
        if (event === 'page:replace') {
          events.push(payload);
        }
      }
    );

    command.apply();
    expect(page.blocks['new-block']).toBeDefined();
    expect(page.blocks['block-1']).toBeUndefined();

    command.revert();
    expect(page.blocks['block-1']).toBeDefined();
    expect(page.blocks['new-block']).toBeUndefined();

    expect(events).toHaveLength(2);
    expect(events[0].previousPage.blocks['block-1']).toBeDefined();
    expect(events[0].newPage.blocks['new-block']).toBeDefined();
    expect(events[1].previousPage.blocks['new-block']).toBeDefined();
    expect(events[1].newPage.blocks['block-1']).toBeDefined();
  });

  it('should replace the page as an undoable history entry', () => {
    engine.replacePage(structuredClone(replacementPage));
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

    engine.replacePage(structuredClone(replacementPage));
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

    engine.replacePage(structuredClone(replacementPage));

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
        engine.replacePage(structuredClone(replacementPage));
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
});
