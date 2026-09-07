import type { Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export interface ToggleBlockOptions {
  blockId: string;
  disabled?: boolean;
  emit: EngineEmitFn;
}

export class ToggleBlockCommand implements Command {
  private getPage: () => Page;
  private blockId: string;
  private targetDisabled?: boolean;
  private originalDisabled?: boolean;
  private newDisabled?: boolean;
  private emit: EngineEmitFn;

  constructor(getPage: () => Page, options: ToggleBlockOptions) {
    this.getPage = getPage;
    this.blockId = options.blockId;
    this.targetDisabled = options.disabled;
    this.emit = options.emit;
  }

  apply(): void {
    const block = this.getPage().blocks[this.blockId];

    if (!block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.originalDisabled = block.disabled;

    if (this.targetDisabled !== undefined) {
      block.disabled = this.targetDisabled;
    } else {
      block.disabled = !block.disabled;
    }

    this.newDisabled = block.disabled;

    this.emit('block:toggle', {
      blockId: this.blockId,
      disabled: block.disabled ?? false,
      oldValue: this.originalDisabled,
    });
  }

  revert(): void {
    const block = this.getPage().blocks[this.blockId];

    if (!block) {
      return;
    }

    if (this.originalDisabled !== undefined) {
      block.disabled = this.originalDisabled;
    } else {
      block.disabled = !block.disabled;
    }

    this.emit('block:toggle', {
      blockId: this.blockId,
      disabled: block.disabled ?? false,
      oldValue: this.targetDisabled !== undefined ? this.targetDisabled : !this.originalDisabled,
    });
  }

  getBlockId(): string {
    return this.blockId;
  }

  getOriginalDisabled(): boolean | undefined {
    return this.originalDisabled;
  }

  getNewDisabled(): boolean | undefined {
    return this.newDisabled;
  }
}
