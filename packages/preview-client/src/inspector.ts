import type { WindowMessenger } from '@craftile/messenger';
import type { WindowMessages } from '@craftile/types';

export class Inspector {
  private active = true;
  private messenger: WindowMessenger<WindowMessages>;
  private currentHoveredBlock: HTMLElement | null = null;
  private currentSelectedBlock: HTMLElement | null = null;
  private overlayButtonHovered = false;

  private resizeObserver: ResizeObserver | null = null;
  private mutationObserver: MutationObserver | null = null;

  constructor(messenger: WindowMessenger<WindowMessages>) {
    this.messenger = messenger;

    this.messenger.listen('craftile.inspector.enable', () => this.enable());
    this.messenger.listen('craftile.inspector.disable', () => this.disable());
    this.messenger.listen('craftile.inspector.overlay-button-enter', this.handleOverlayButtonEnter.bind(this));
    this.messenger.listen('craftile.inspector.overlay-button-leave', this.handleOverlayButtonLeave.bind(this));
    this.messenger.listen('craftile.editor.select-block', this.handleEditorSelectBlock.bind(this));
    this.messenger.listen('craftile.editor.deselect-block', this.handleEditorDeselectBlock.bind(this));

    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    this.setupGlobalEventListeners();
  }

  /**
   * Update the tracked element reference when a block's DOM element changes.
   * This is needed when the root tag of a block changes during an update.
   */
  updateTrackedElement(blockId: string, newElement: HTMLElement): void {
    // Update hovered block if it matches
    if (this.currentHoveredBlock?.dataset.block === blockId) {
      this.currentHoveredBlock = newElement;
      this.sendHoveredBlockPosition();
    }

    // Update selected block if it matches and re-track it
    if (this.currentSelectedBlock?.dataset.block === blockId) {
      this.currentSelectedBlock = newElement;
      this.sendSelectedBlockPosition(true);
      this.trackSelectedBlock();
    }
  }

  enable() {
    this.active = true;
    document.body.classList.add('craftile-inspector-active');

    // Re-track selected block if it exists
    if (this.currentSelectedBlock) {
      this.trackSelectedBlock();
    }
  }

  disable() {
    this.active = false;
    document.body.classList.remove('craftile-inspector-active');
    this.currentHoveredBlock = null;
    this.overlayButtonHovered = false;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  private handleOverlayButtonEnter() {
    this.overlayButtonHovered = true;
  }

  private handleOverlayButtonLeave(_data: { blockId: string }) {
    this.overlayButtonHovered = false;

    if (!this.currentHoveredBlock) {
      this.messenger.send('craftile.preview.block-leave');
    }
  }

  private handleEditorSelectBlock(data: { blockId: string }) {
    const element = document.querySelector(`[data-block="${data.blockId}"]`) as HTMLElement;

    if (element) {
      this.currentSelectedBlock = element;
      this.sendSelectedBlockPosition();
      this.trackSelectedBlock();
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  private handleEditorDeselectBlock() {
    this.currentSelectedBlock = null;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  private handleScroll() {
    if (!this.active) {
      return;
    }

    if (this.currentSelectedBlock) {
      this.sendSelectedBlockPosition();
    }

    if (this.currentHoveredBlock) {
      this.sendHoveredBlockPosition();
    }
  }

  private setupGlobalEventListeners() {
    document.addEventListener('mouseover', this.handleGlobalHover.bind(this));
    document.addEventListener('mouseout', this.handleGlobalLeave.bind(this));
    document.addEventListener('click', this.handleGlobalClick.bind(this), { capture: true });
  }

  private handleGlobalHover(e: Event) {
    if (!this.active) {
      return;
    }

    const blockElement = (e.target as Element).closest('[data-block]') as HTMLElement;

    if (!blockElement) {
      return;
    }

    e.stopPropagation();
    this.currentHoveredBlock = blockElement;
    this.sendHoveredBlockPosition();
  }

  private handleGlobalLeave(e: Event) {
    if (!this.active) {
      return;
    }

    const blockElement = (e.target as Element).closest('[data-block]') as HTMLElement;
    if (!blockElement) {
      return;
    }

    // Only clear overlay if button is not being hovered
    if (!this.overlayButtonHovered) {
      this.currentHoveredBlock = null;
      this.messenger.send('craftile.preview.block-leave');
    }
  }

  private handleGlobalClick(e: Event) {
    this.messenger.send('craftile.preview.click');

    if (!this.active) {
      return;
    }

    const blockElement = (e.target as Element).closest('[data-block]') as HTMLElement;
    if (!blockElement) {
      return;
    }

    const blockId = blockElement.getAttribute('data-block');
    if (!blockId) {
      return;
    }

    const isAlreadySelected = this.currentSelectedBlock === blockElement;

    if (!isAlreadySelected) {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.currentSelectedBlock = blockElement;
      this.sendSelectedBlockPosition();
      this.trackSelectedBlock();
    }
  }

  private sendHoveredBlockPosition() {
    const position = this.computeElementPositioning(this.currentHoveredBlock!);

    this.messenger.send('craftile.preview.block-hover', {
      blockRect: position.rect,
      parentRect: position.parentRect,
      scrollTop: position.scrollTop,
      scrollLeft: position.scrollLeft,
      blockId: this.currentHoveredBlock!.dataset.block as string,
      parentFlexDirection: position.parentFlexDirection,
    });
  }

  private sendSelectedBlockPosition(updates: boolean = false) {
    if (!this.currentSelectedBlock) {
      return;
    }

    const position = this.computeElementPositioning(this.currentSelectedBlock!);
    this.messenger.send(updates ? 'craftile.preview.update-selected-block' : 'craftile.preview.block-select', {
      blockRect: position.rect,
      scrollTop: position.scrollTop,
      scrollLeft: position.scrollLeft,
      blockId: this.currentSelectedBlock!.dataset.block as string,
    });
  }

  private trackSelectedBlock() {
    if (!this.currentSelectedBlock) {
      return;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.active && this.currentSelectedBlock) {
        this.sendSelectedBlockPosition(true);
      }
    });
    this.resizeObserver.observe(this.currentSelectedBlock);

    this.mutationObserver = new MutationObserver(() => {
      if (this.active && this.currentSelectedBlock) {
        this.sendSelectedBlockPosition(true);
      }
    });

    this.mutationObserver.observe(this.currentSelectedBlock, {
      attributes: true,
      subtree: false,
    });

    // Also observe parent elements that might affect positioning
    let parent = this.currentSelectedBlock.parentElement;
    while (parent) {
      this.mutationObserver.observe(parent, {
        childList: true,
        subtree: false,
      });

      if (parent === document.body) {
        break;
      }

      parent = parent.parentElement;
    }
  }

  private computeElementPositioning(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    const eldestParent = this.findEldestParentBlock(element);
    const parentRect = eldestParent && eldestParent !== element ? eldestParent.getBoundingClientRect() : undefined;
    const parentFlexDirection = this.getElementFlexDirection(element.parentElement);

    return {
      rect,
      parentRect,
      scrollTop,
      scrollLeft,
      parentFlexDirection,
    };
  }

  private findEldestParentBlock(element: HTMLElement): HTMLElement | null {
    let eldestParent: HTMLElement | null = null;
    let parentElement = element.parentElement;

    while (parentElement && parentElement !== document.body) {
      if (parentElement.hasAttribute('data-block')) {
        eldestParent = parentElement;
      }
      parentElement = parentElement.parentElement;
    }

    return eldestParent;
  }

  private getElementFlexDirection(element: HTMLElement | null): 'row' | 'column' {
    if (!element) {
      return 'column';
    }

    const style = window.getComputedStyle(element);
    const flexDirection = style.display.includes('flex') ? style.flexDirection : 'column';

    return flexDirection === 'row' || flexDirection === 'row-reverse' ? 'row' : 'column';
  }
}
