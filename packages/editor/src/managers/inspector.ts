import type { EventBus } from '@craftile/event-bus';
import type { PreviewManager } from './preview';
import type { UIManager } from './ui';

export interface InspectorState {
  enabled: boolean;

  hoveredBlockId: string | null;
  hoveredBlockRect: DOMRect | null;
  hoveredParentRect: DOMRect | null;
  parentFlexDirection: 'row' | 'column';

  selectedBlockId: string | null;
  selectedBlockRect: DOMRect | null;

  iframeRect: DOMRect | null;
}

export class InspectorManager {
  public readonly state: InspectorState;
  private events: EventBus;
  private preview: PreviewManager;
  private ui: UIManager;

  constructor(events: EventBus, preview: PreviewManager, ui: UIManager) {
    this.events = events;
    this.preview = preview;
    this.ui = ui;

    this.state = reactive({
      enabled: true,
      hoveredBlockId: null,
      hoveredBlockRect: null,
      hoveredParentRect: null,
      parentFlexDirection: 'column',
      selectedBlockId: null,
      selectedBlockRect: null,
      iframeRect: null,
    });

    this.preview.onReady(() => {
      this.preview.onMessage('craftile.preview.block-hover', (data) => {
        this.setHoveredBlock(data.blockId, data.blockRect, data.parentRect);
        this.state.parentFlexDirection = data.parentFlexDirection;
      });

      this.preview.onMessage('craftile.preview.block-select', (data) => {
        this.setSelectedBlock(data.blockId, data.blockRect);
        this.ui.setSelectedBlock(data.blockId);
      });

      this.preview.onMessage('craftile.preview.update-selected-block', (data) => {
        if (this.state.selectedBlockId) {
          this.setSelectedBlock(data.blockId, data.blockRect);
        }
      });

      this.preview.onMessage('craftile.preview.block-leave', () => {
        this.clearHoveredBlock();
      });
    });
  }

  enable() {
    this.state.enabled = true;
    this.events.emit('inspector:enabled', {});
    this.preview.sendMessage('craftile.inspector.enable');
  }

  disable(): void {
    this.state.enabled = false;
    this.events.emit('inspector:disabled', {});
    this.preview.sendMessage('craftile.inspector.disable');
  }

  toggle(): void {
    if (this.state.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  setHoveredBlock(blockId: string, blockRect: DOMRect, parentRect?: DOMRect): void {
    this.state.hoveredBlockId = blockId;
    this.state.hoveredBlockRect = blockRect;
    this.state.hoveredParentRect = parentRect || null;
  }

  setSelectedBlock(blockId: string, blockRect: DOMRect): void {
    this.state.selectedBlockId = blockId;
    this.state.selectedBlockRect = blockRect;
  }

  clearHoveredBlock() {
    this.state.hoveredBlockId = null;
    this.state.hoveredBlockRect = null;
    this.state.hoveredParentRect = null;
  }

  clearSelectedBlock() {
    this.state.selectedBlockId = null;
    this.state.selectedBlockRect = null;
  }

  setIframeRect(rect: DOMRect) {
    this.state.iframeRect = rect;
  }
}
