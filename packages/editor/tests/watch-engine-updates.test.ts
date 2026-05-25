import { describe, expect, it, vi } from 'vitest';
import type { Block, Page } from '@craftile/types';
import { watchEngineUpdates } from '../src/watch-engine-updates';

type Listener = (event: any) => void;

class FakeEngine {
  private listeners = new Map<string, Listener[]>();
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getPage(): Page {
    return this.page;
  }

  setPage(page: Page): void {
    this.page = page;
  }

  on(event: string, listener: Listener): () => void {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push(listener);
    this.listeners.set(event, listeners);

    return () => {
      this.listeners.set(
        event,
        (this.listeners.get(event) ?? []).filter((candidate) => candidate !== listener)
      );
    };
  }

  emit(event: string, payload: any): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(payload);
    }
  }
}

function makeBlock(id: string, children: string[] = [], parentId?: string): Block {
  return {
    id,
    type: 'test',
    properties: {},
    children,
    parentId,
  };
}

describe('watchEngineUpdates', () => {
  it('includes removed block snapshots and keeps parent update context', () => {
    vi.useFakeTimers();

    const removedBlock = makeBlock('child', [], 'parent');
    const parentBlock = makeBlock('parent', []);
    const pageAfterRemoval: Page = {
      blocks: {
        parent: parentBlock,
      },
      regions: [{ id: 'main', name: 'main', blocks: ['parent'] }],
    };
    const updates = vi.fn();
    const engine = new FakeEngine(pageAfterRemoval);

    watchEngineUpdates(engine as any, {
      debounceMs: 0,
      onUpdates: updates,
    });

    engine.emit('block:remove', {
      blockId: 'child',
      block: removedBlock,
      parentId: 'parent',
    });

    vi.runAllTimers();

    expect(updates).toHaveBeenCalledTimes(1);
    expect(updates).toHaveBeenCalledWith({
      blocks: {
        child: removedBlock,
        parent: parentBlock,
      },
      regions: pageAfterRemoval.regions,
      changes: {
        added: [],
        updated: [],
        removed: ['child'],
        moved: {},
        positions: {},
      },
    });

    vi.useRealTimers();
  });

  it('emits aggregate updates for page replacement', () => {
    const previousPage: Page = {
      blocks: {
        'old-root': makeBlock('old-root'),
        'shared-root': makeBlock('shared-root'),
      },
      regions: [{ id: 'main', name: 'main', blocks: ['old-root', 'shared-root'] }],
    };
    const newChild = makeBlock('new-child', [], 'new-root');
    const newRoot = makeBlock('new-root', ['new-child']);
    const sharedRoot = makeBlock('shared-root');
    const newPage: Page = {
      blocks: {
        'new-root': newRoot,
        'new-child': newChild,
        'shared-root': sharedRoot,
      },
      regions: [{ id: 'main', name: 'main', blocks: ['new-root', 'shared-root'] }],
    };
    const updates = vi.fn();
    const engine = new FakeEngine(newPage);

    watchEngineUpdates(engine as any, {
      debounceMs: 0,
      onUpdates: updates,
    });

    engine.emit('page:replace', {
      previousPage,
      newPage,
    });

    expect(updates).toHaveBeenCalledTimes(1);
    expect(updates).toHaveBeenCalledWith({
      blocks: {
        'old-root': previousPage.blocks['old-root'],
        'new-root': newRoot,
        'new-child': newChild,
        'shared-root': sharedRoot,
      },
      regions: newPage.regions,
      changes: {
        added: ['new-root', 'shared-root'],
        updated: [],
        removed: ['old-root', 'shared-root'],
        moved: {},
        positions: {
          'new-root': { regionId: 'main', beforeId: 'shared-root' },
          'shared-root': { regionId: 'main', afterId: 'new-root' },
        },
      },
    });
  });

  it('emits aggregate updates for region replacement', () => {
    const oldRoot = makeBlock('old-root', ['old-child']);
    const oldChild = makeBlock('old-child', [], 'old-root');
    const newChild = makeBlock('new-child', [], 'new-root');
    const newRoot = makeBlock('new-root', ['new-child']);
    const footerRoot = makeBlock('footer-root');
    const pageAfterReplacement: Page = {
      blocks: {
        'new-root': newRoot,
        'new-child': newChild,
        'footer-root': footerRoot,
      },
      regions: [
        { id: 'main', name: 'main', blocks: ['new-root'] },
        { id: 'footer', name: 'footer', blocks: ['footer-root'] },
      ],
    };
    const updates = vi.fn();
    const engine = new FakeEngine(pageAfterReplacement);

    watchEngineUpdates(engine as any, {
      debounceMs: 0,
      onUpdates: updates,
    });

    engine.emit('region:replace', {
      regionId: 'main',
      previousRegion: { id: 'main', name: 'main', blocks: ['old-root'] },
      newRegion: { id: 'main', name: 'main', blocks: ['new-root'] },
      removedBlocks: {
        'old-root': oldRoot,
        'old-child': oldChild,
      },
      newBlocks: {
        'new-root': newRoot,
        'new-child': newChild,
      },
    });

    expect(updates).toHaveBeenCalledTimes(1);
    expect(updates).toHaveBeenCalledWith({
      blocks: {
        'new-root': newRoot,
        'new-child': newChild,
        'old-root': oldRoot,
      },
      regions: pageAfterReplacement.regions,
      changes: {
        added: ['new-root'],
        updated: [],
        removed: ['old-root'],
        moved: {},
        positions: {
          'new-root': { regionId: 'main' },
        },
      },
    });
  });
});
