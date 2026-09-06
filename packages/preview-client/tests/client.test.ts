// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Block, WindowMessages } from '@craftile/types';

const messenger = {
  listen: vi.fn(() => () => {}),
  send: vi.fn(),
  registerFallbackHandler: vi.fn(),
};

vi.mock('@craftile/messenger', () => ({
  WindowMessenger: vi.fn(),
  createParentMessenger: vi.fn(() => messenger),
}));

function makeBlock(id: string, type = 'test'): Block {
  return {
    id,
    type,
    properties: {},
    children: [],
  };
}

function makeUpdates(
  blocks: Record<string, Block>,
  changes: Partial<WindowMessages['craftile.editor.updates']['changes']> = {}
): WindowMessages['craftile.editor.updates'] {
  return {
    blocks,
    regions: [{ id: 'main', name: 'main', blocks: [] }],
    changes: {
      added: [],
      updated: [],
      removed: [],
      moved: {},
      ...changes,
    },
  };
}

async function importPreviewClient() {
  vi.resetModules();
  return import('../src/client');
}

describe('PreviewClient block cache', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    messenger.listen.mockClear();
    messenger.send.mockClear();
    messenger.registerFallbackHandler.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('seeds getBlock from page data', async () => {
    const initialBlock = makeBlock('initial', 'hero');
    document.body.innerHTML = `<script id="page-data" type="application/json">${JSON.stringify({
      content: { blocks: { initial: initialBlock } },
      regions: [],
    })}</script>`;

    const { PreviewClient } = await importPreviewClient();
    const client = new PreviewClient();

    (client as any).sendPageData();

    expect(client.getBlock('initial')).toEqual(initialBlock);
    expect(messenger.send).toHaveBeenCalledWith('craftile.preview.page-data', {
      pageData: {
        content: { blocks: { initial: initialBlock } },
        regions: [],
      },
    });
  });

  it('updates getBlock only from craftile.editor.updates', async () => {
    const initialBlock = makeBlock('initial', 'hero');
    const updatedBlock = makeBlock('initial', 'updated-hero');
    const effectsBlock = makeBlock('from-effects', 'effects');
    document.body.innerHTML = `<script id="page-data" type="application/json">${JSON.stringify({
      content: { blocks: { initial: initialBlock } },
      regions: [],
    })}</script>`;

    const { PreviewClient } = await importPreviewClient();
    const client = new PreviewClient();
    let emittedUpdates: WindowMessages['craftile.editor.updates'] | undefined;
    let blockDuringEmit: Block | undefined;
    let removedDuringEmit: Block | undefined;

    client.on('craftile.editor.updates', (payload) => {
      emittedUpdates = payload;
      blockDuringEmit = client.getBlock('initial');
      removedDuringEmit = client.getBlock('removed');
    });

    (client as any).sendPageData();

    const fallbackHandler = messenger.registerFallbackHandler.mock.calls[0][0];
    fallbackHandler({
      type: 'updates.effects',
      payload: {
        ...makeUpdates({ 'from-effects': effectsBlock }),
        effects: {},
      },
    });

    expect(client.getBlock('from-effects')).toBeUndefined();

    const updates = makeUpdates({ initial: updatedBlock, removed: makeBlock('removed') }, { removed: ['removed'] });
    const updatesHandler = messenger.listen.mock.calls.find(([type]) => type === 'craftile.editor.updates')![1];
    updatesHandler(updates);

    expect(client.getBlock('initial')).toEqual(updatedBlock);
    expect(client.getBlock('removed')).toBeUndefined();
    expect(emittedUpdates).toBe(updates);
    expect(blockDuringEmit).toEqual(updatedBlock);
    expect(removedDuringEmit).toBeUndefined();
  });
});

describe('PreviewClient inspector block events', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div data-block="known"></div><div data-block="unknown"></div>';
    Object.defineProperty(globalThis.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      }))
    );
    vi.stubGlobal(
      'MutationObserver',
      vi.fn(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      }))
    );
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      })
    );
    messenger.listen.mockClear();
    messenger.send.mockClear();
    messenger.registerFallbackHandler.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('includes block data on select and deselect events when available', async () => {
    const knownBlock = makeBlock('known', 'section');
    document.body.innerHTML += `<script id="page-data" type="application/json">${JSON.stringify({
      content: { blocks: { known: knownBlock } },
      regions: [],
    })}</script>`;

    const { PreviewClient } = await importPreviewClient();
    const client = new PreviewClient();
    const emit = vi.spyOn(client, 'emit');

    (client as any).sendPageData();

    const selectHandler = messenger.listen.mock.calls.find(([type]) => type === 'craftile.editor.select-block')![1];
    const deselectHandler = messenger.listen.mock.calls.find(([type]) => type === 'craftile.editor.deselect-block')![1];
    const element = document.querySelector('[data-block="known"]') as HTMLElement;

    selectHandler({ blockId: 'known' });
    deselectHandler();

    expect(emit).toHaveBeenCalledWith('block.select', {
      blockId: 'known',
      block: knownBlock,
      blockType: 'section',
      element,
    });
    expect(emit).toHaveBeenCalledWith('block.deselect', {
      blockId: 'known',
      block: knownBlock,
      blockType: 'section',
      element,
    });
  });

  it('preserves minimal select payload when block data is unavailable', async () => {
    const { PreviewClient } = await importPreviewClient();
    const client = new PreviewClient();
    const emit = vi.spyOn(client, 'emit');
    const selectHandler = messenger.listen.mock.calls.find(([type]) => type === 'craftile.editor.select-block')![1];
    const element = document.querySelector('[data-block="unknown"]') as HTMLElement;

    selectHandler({ blockId: 'unknown' });

    expect(emit).toHaveBeenCalledWith('block.select', {
      blockId: 'unknown',
      element,
    });
  });

  it('updates the selected block position when a tracked transition ends', async () => {
    document.body.innerHTML = '<main id="parent"><div data-block="known"></div></main>';

    const { PreviewClient } = await importPreviewClient();
    new PreviewClient();

    const selectHandler = messenger.listen.mock.calls.find(([type]) => type === 'craftile.editor.select-block')![1];
    const parent = document.getElementById('parent')!;

    selectHandler({ blockId: 'known' });
    messenger.send.mockClear();

    parent.dispatchEvent(new Event('transitionend'));

    expect(messenger.send).toHaveBeenCalledWith('craftile.preview.update-selected-block', {
      blockId: 'known',
      blockRect: expect.objectContaining({
        top: expect.any(Number),
        left: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
      }),
      scrollTop: 0,
      scrollLeft: 0,
    });
  });

  it('re-sends the selected block position when the viewport resizes', async () => {
    const { PreviewClient } = await importPreviewClient();
    new PreviewClient();

    const selectHandler = messenger.listen.mock.calls.find(([type]) => type === 'craftile.editor.select-block')![1];

    selectHandler({ blockId: 'known' });
    messenger.send.mockClear();

    window.dispatchEvent(new Event('resize'));

    expect(messenger.send).toHaveBeenCalledWith('craftile.preview.block-select', {
      blockId: 'known',
      blockRect: expect.objectContaining({
        top: expect.any(Number),
        left: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
      }),
      scrollTop: 0,
      scrollLeft: 0,
    });
  });

  it('coalesces a burst of resize events into a single frame', async () => {
    const frameCallbacks: FrameRequestCallback[] = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      })
    );

    const { PreviewClient } = await importPreviewClient();
    new PreviewClient();

    const selectHandler = messenger.listen.mock.calls.find(([type]) => type === 'craftile.editor.select-block')![1];

    selectHandler({ blockId: 'known' });
    messenger.send.mockClear();

    // Inspectors from earlier tests keep their window listeners, so measure the
    // number of frames one resize schedules instead of assuming a single instance.
    window.dispatchEvent(new Event('resize'));
    const framesPerResize = frameCallbacks.length;
    expect(framesPerResize).toBeGreaterThan(0);

    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));

    expect(frameCallbacks).toHaveLength(framesPerResize);
    expect(messenger.send).not.toHaveBeenCalled();

    frameCallbacks.forEach((callback) => callback(0));

    expect(messenger.send).toHaveBeenCalledWith(
      'craftile.preview.block-select',
      expect.objectContaining({ blockId: 'known' })
    );

    // A later resize schedules a fresh frame once the previous one has run
    window.dispatchEvent(new Event('resize'));
    expect(frameCallbacks).toHaveLength(framesPerResize * 2);
  });
});
