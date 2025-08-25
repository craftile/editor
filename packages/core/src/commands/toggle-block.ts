import type { Block, Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export interface ToggleBlockOptions {
  blockId: string;
  disabled?: boolean;
  emit: EngineEmitFn;
}

export class ToggleBlockCommand implements Command {
  private page: Page;
  private blockId: string;
  private targetDisabled?: boolean;
  private originalDisabled?: boolean;
  private block?: Block;
  private emit: EngineEmitFn;

  constructor(page: Page, options: ToggleBlockOptions) {
    this.page = page;
    this.blockId = options.blockId;
    this.targetDisabled = options.disabled;
    this.emit = options.emit;
  }

  apply(): void {
    this.block = this.page.blocks[this.blockId];

    if (!this.block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.originalDisabled = this.block.disabled;

    if (this.targetDisabled !== undefined) {
      this.block.disabled = this.targetDisabled;
    } else {
      this.block.disabled = !this.block.disabled;
    }

    this.emit('block:toggle', {
      blockId: this.blockId,
      disabled: this.block.disabled ?? false,
      oldValue: this.originalDisabled,
    });
  }

  revert(): void {
    if (!this.block) {
      return;
    }

    if (this.originalDisabled !== undefined) {
      this.block.disabled = this.originalDisabled;
    } else {
      this.block.disabled = !this.block.disabled;
    }

    this.emit('block:toggle', {
      blockId: this.blockId,
      disabled: this.block.disabled ?? false,
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
    return this.block?.disabled;
  }
}
