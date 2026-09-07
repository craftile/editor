import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Engine } from '../src/engine';
import { collectVanishedDescendants } from '../src/utils';
import type { Block, BlockSchema, Page } from '@craftile/types';

const testPage: Page = {
  blocks: {
    hero: { id: 'hero', type: 'box', properties: { className: 'hero' }, children: ['title', 'subtitle'] },
    title: { id: 'title', type: 'text', properties: { value: 'Title' }, children: [], parentId: 'hero' },
    subtitle: { id: 'subtitle', type: 'box', properties: {}, children: ['subtitle-icon'], parentId: 'hero' },
    'subtitle-icon': { id: 'subtitle-icon', type: 'text', properties: {}, children: [], parentId: 'subtitle' },
    footer: { id: 'footer', type: 'box', properties: {}, children: [] },
  },
  regions: [{ id: 'main', name: 'main', blocks: ['hero', 'footer'] }],
};

const testSchemas: BlockSchema[] = [
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

function block(id: string, overrides: Partial<Block> = {}): Block {
  return { id, type: 'text', properties: {}, children: [], ...overrides };
}

describe('collectVanishedDescendants', () => {
  it('collects the whole subtree of a dropped child', () => {
    const vanished = collectVanishedDescendants(testPage.blocks, {
      hero: block('hero', { type: 'box', children: ['title'] }),
    });

    expect([...vanished].sort()).toEqual(['subtitle', 'subtitle-icon']);
  });

  it('never prunes a block that is still in the patch', () => {
    const vanished = collectVanishedDescendants(testPage.blocks, {
      hero: block('hero', { type: 'box', children: ['title'] }),
      subtitle: block('subtitle', { type: 'box', parentId: 'footer', children: ['subtitle-icon'] }),
    });

    expect(vanished.size).toBe(0);
  });

  it('ignores patch blocks unknown to the previous page', () => {
    const vanished = collectVanishedDescendants(testPage.blocks, {
      fresh: block('fresh', { type: 'box' }),
    });

    expect(vanished.size).toBe(0);
  });
});

describe('Engine.patchBlocks', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine({ page: structuredClone(testPage), blockSchemas: testSchemas });
  });

  it('replaces existing blocks wholesale and inserts unknown ones', () => {
    engine.patchBlocks({
      title: block('title', { properties: { value: 'Resolved' }, parentId: 'hero' }),
      fresh: block('fresh', { parentId: 'footer' }),
    });

    const page = engine.getPage();
    expect(page.blocks.title).toEqual(block('title', { properties: { value: 'Resolved' }, parentId: 'hero' }));
    expect(page.blocks.fresh).toEqual(block('fresh', { parentId: 'footer' }));
    expect(page.regions).toEqual(testPage.regions);
  });

  it('does not deep merge properties', () => {
    engine.patchBlocks({ hero: block('hero', { type: 'box', properties: {}, children: ['title', 'subtitle'] }) });

    expect(engine.getPage().blocks.hero.properties).toEqual({});
  });

  it('stores clones of the given blocks', () => {
    const patched = block('title', { properties: { value: 'Resolved' }, parentId: 'hero' });
    engine.patchBlocks({ title: patched });

    patched.properties.value = 'Mutated after patch';

    expect(engine.getPage().blocks.title.properties.value).toBe('Resolved');
  });

  it('uses parentId as given without back-filling it', () => {
    engine.patchBlocks({
      hero: block('hero', { type: 'box', children: ['title', 'subtitle', 'orphan'] }),
      orphan: block('orphan'),
    });

    expect(engine.getPage().blocks.orphan.parentId).toBeUndefined();
  });

  it('prunes the whole subtree of a child dropped by a patched block', () => {
    engine.patchBlocks({ hero: block('hero', { type: 'box', children: ['title'] }) });

    const page = engine.getPage();
    expect(page.blocks.subtitle).toBeUndefined();
    expect(page.blocks['subtitle-icon']).toBeUndefined();
    expect(page.blocks.title).toBeDefined();
    expect(page.blocks.footer).toBeDefined();
  });

  it('never prunes a block present in the patch, even if its previous parent dropped it', () => {
    engine.patchBlocks({
      hero: block('hero', { type: 'box', children: ['title'] }),
      subtitle: block('subtitle', { type: 'box', parentId: 'footer', children: ['subtitle-icon'] }),
      footer: block('footer', { type: 'box', children: ['subtitle'] }),
    });

    const page = engine.getPage();
    expect(page.blocks.subtitle.parentId).toBe('footer');
    expect(page.blocks['subtitle-icon']).toBeDefined();
  });

  it('emits blocks:patch with the patch, the pruned ids and cloned pages', () => {
    const listener = vi.fn();
    engine.on('blocks:patch', listener);

    const patch = { hero: block('hero', { type: 'box', children: ['title'] }) };
    engine.patchBlocks(patch);

    expect(listener).toHaveBeenCalledTimes(1);
    const payload = listener.mock.calls[0][0];
    expect(payload.blocks).toBe(patch);
    expect(payload.removed.sort()).toEqual(['subtitle', 'subtitle-icon']);
    expect(payload.previousPage.blocks.subtitle).toBeDefined();
    expect(payload.newPage.blocks.subtitle).toBeUndefined();
    expect(payload.newPage.blocks.hero).toEqual(patch.hero);
    expect(payload.newPage).not.toBe((engine as any).page);
  });

  it('does nothing for an empty patch', () => {
    const listener = vi.fn();
    engine.on('blocks:patch', listener);

    engine.patchBlocks({});

    expect(listener).not.toHaveBeenCalled();
    expect(engine.getPage()).toEqual(engine.getPage());
  });

  it('throws when called inside a batch', () => {
    expect(() => {
      engine.batch(() => {
        engine.patchBlocks({ title: block('title', { parentId: 'hero' }) });
      });
    }).toThrow('patchBlocks cannot be called inside batch');
  });

  it('does not add a history entry and does not clear history', () => {
    expect(engine.canUndo()).toBe(false);

    engine.patchBlocks({ title: block('title', { parentId: 'hero' }) });
    expect(engine.canUndo()).toBe(false);

    engine.setBlockProperty('title', 'value', 'Edited');
    engine.patchBlocks({ title: block('title', { properties: { value: 'Edited' }, parentId: 'hero' }) });

    expect(engine.canUndo()).toBe(true);
    expect(engine.undo()).toBe(true);
    expect(engine.canUndo()).toBe(false);
  });

  it('keeps the live page object', () => {
    const before = (engine as any).page;
    engine.patchBlocks({ title: block('title', { parentId: 'hero' }) });

    expect((engine as any).page).toBe(before);
  });

  it('undo of a property change made before the patch restores the value on the patched block', () => {
    engine.setBlockProperty('title', 'value', 'Edited');
    engine.patchBlocks({ title: block('title', { properties: { value: 'Edited', extra: 1 }, parentId: 'hero' }) });

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks.title.properties).toEqual({ value: 'Title', extra: 1 });

    expect(engine.redo()).toBe(true);
    expect(engine.getPage().blocks.title.properties).toEqual({ value: 'Edited', extra: 1 });
  });

  it('undo of an insert made before a patch that reordered the parent removes the right child', () => {
    const blockId = engine.insertBlock('text', { parentId: 'hero' });
    engine.patchBlocks({ hero: block('hero', { type: 'box', children: [blockId, 'title', 'subtitle'] }) });

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks[blockId]).toBeUndefined();
    expect(engine.getPage().blocks.hero.children).toEqual(['title', 'subtitle']);
  });

  it('undo of a remove made before the patch restores the block', () => {
    engine.removeBlock('title');
    engine.patchBlocks({ hero: block('hero', { type: 'box', children: ['subtitle'] }) });

    expect(engine.undo()).toBe(true);
    expect(engine.getPage().blocks.title).toBeDefined();
    expect(engine.getPage().blocks.hero.children).toEqual(['title', 'subtitle']);
  });
});
