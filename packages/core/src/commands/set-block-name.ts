import type { Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export interface SetBlockNameOptions {
  blockId: string;
  name: string;
  emit: EngineEmitFn;
}

export class SetBlockNameCommand implements Command {
  private getPage: () => Page;
  private blockId: string;
  private newName: string;
  private oldName: string | undefined;
  private emit: EngineEmitFn;

  constructor(getPage: () => Page, options: SetBlockNameOptions) {
    this.getPage = getPage;
    this.blockId = options.blockId;
    this.newName = options.name;
    this.emit = options.emit;

    const block = this.getPage().blocks[this.blockId];

    if (!block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.oldName = block.name;
  }

  apply(): void {
    const block = this.getPage().blocks[this.blockId];

    if (!block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    block.name = this.newName;

    this.emit('block:update', {
      blockId: this.blockId,
      block,
      property: 'name',
      value: this.newName,
      oldValue: this.oldName,
    });
  }

  revert(): void {
    const block = this.getPage().blocks[this.blockId];

    if (!block) {
      return;
    }

    block.name = this.oldName;

    this.emit('block:update', {
      blockId: this.blockId,
      block,
      property: 'name',
      value: this.oldName,
      oldValue: this.newName,
    });
  }
}
