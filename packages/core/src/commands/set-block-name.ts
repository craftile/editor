import type { Block, Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export interface SetBlockNameOptions {
  blockId: string;
  name: string;
  emit: EngineEmitFn;
}

export class SetBlockNameCommand implements Command {
  private page: Page;
  private blockId: string;
  private newName: string;
  private oldName: string | undefined;
  private block: Block | undefined;
  private emit: EngineEmitFn;

  constructor(page: Page, options: SetBlockNameOptions) {
    this.page = page;
    this.blockId = options.blockId;
    this.newName = options.name;
    this.emit = options.emit;
    this.block = this.page.blocks[this.blockId];

    if (!this.block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.oldName = this.block.name;
  }

  apply(): void {
    if (!this.block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.block.name = this.newName;

    this.emit('block:update', {
      blockId: this.blockId,
      block: this.block,
      property: 'name',
      value: this.newName,
      oldValue: this.oldName,
    });
  }

  revert(): void {
    if (!this.block) {
      return;
    }

    this.block.name = this.oldName;

    this.emit('block:update', {
      blockId: this.blockId,
      block: this.block,
      property: 'name',
      value: this.oldName,
      oldValue: this.newName,
    });
  }
}
