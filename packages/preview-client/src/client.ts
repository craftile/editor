import type { Block, WindowMessages } from '@craftile/types';
import { createParentMessenger, WindowMessenger } from '@craftile/messenger';
import { EventBus } from '@craftile/event-bus';
import { Inspector } from './inspector';

export interface PreviewClientEvents extends WindowMessages {
  [event: string]: any;

  'block.select': {
    blockId: string;
    block?: Block;
    blockType?: string;
    element: HTMLElement;
  };

  'block.deselect': {
    blockId: string;
    block?: Block;
    blockType?: string;
    element: HTMLElement;
  };
}

export class PreviewClient extends EventBus<PreviewClientEvents> {
  private messenger: WindowMessenger<WindowMessages>;
  private blocks = new Map<string, Block>();
  public inspector: Inspector;

  constructor() {
    super();

    this.messenger = createParentMessenger(window.origin);
    this.inspector = new Inspector(this.messenger, this);

    this.initialize();
  }

  private initialize() {
    window.addEventListener('load', () => {
      this.messenger.send('craftile.preview.ready', {});
      setTimeout(() => {
        this.sendPageData();
      }, 0);
    });

    this.messenger.listen('craftile.editor.updates', (payload) => {
      this.updateBlocks(payload);
      this.emit('craftile.editor.updates', payload);
    });

    this.messenger.registerFallbackHandler((data: any) => {
      const { type, payload } = data;
      this.emit(type, payload);
    });
  }

  getBlock(blockId: string): Block | undefined {
    return this.blocks.get(blockId);
  }

  private updateBlocks(updates: WindowMessages['craftile.editor.updates']): void {
    for (const [blockId, block] of Object.entries(updates.blocks)) {
      this.blocks.set(blockId, block);
    }

    for (const blockId of updates.changes.removed) {
      this.blocks.delete(blockId);
    }
  }

  private sendPageData() {
    const pageDataElement = document.getElementById('page-data');

    if (!pageDataElement) {
      return;
    }

    try {
      const pageData = JSON.parse(pageDataElement.textContent || '{}');
      this.blocks.clear();

      for (const [blockId, block] of Object.entries(pageData.content.blocks || {}) as [string, Block][]) {
        this.blocks.set(blockId, block);
      }

      this.messenger.send('craftile.preview.page-data', { pageData });
    } catch (error) {
      console.error('Failed to parse page data:', error);
    }
  }
}
