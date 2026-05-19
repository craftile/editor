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
});
