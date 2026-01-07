import type { Block, Page } from '@craftile/types';
import { getRegionId } from '../utils';
import type { Command, EngineEmitFn } from '../types';

export interface RemoveBlockOptions {
  blockId: string;
  emit: EngineEmitFn;
}

export class RemoveBlockCommand implements Command {
  private page: Page;
  private blockId: string;
  private removedBlock?: Block;
  private originalIndex?: number;
  private originalParentId?: string;
  private regionId?: string;
  private emit: EngineEmitFn;

  constructor(page: Page, options: RemoveBlockOptions) {
    this.page = page;
    this.blockId = options.blockId;
    this.emit = options.emit;
  }

  apply(): void {
    this.removedBlock = this.page.blocks[this.blockId];

    if (!this.removedBlock) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.originalParentId = this.removedBlock.parentId;

    if (this.originalParentId) {
      const parent = this.page.blocks[this.originalParentId];
      if (parent) {
        this.originalIndex = parent.children.indexOf(this.blockId);
        if (this.originalIndex !== -1) {
          parent.children.splice(this.originalIndex, 1);
        }
      }
    } else {
      const region = this.page.regions.find((r) => r.blocks.includes(this.blockId));
      if (region) {
        this.originalIndex = region.blocks.indexOf(this.blockId);
        this.regionId = getRegionId(region);
        region.blocks.splice(this.originalIndex, 1);
      }
    }

    delete this.page.blocks[this.blockId];

    this.emit('block:remove', {
      blockId: this.blockId,
      block: this.removedBlock,
      parentId: this.originalParentId,
    });
  }

  revert(): void {
    if (!this.removedBlock || this.originalIndex === undefined) {
      return;
    }

    this.page.blocks[this.blockId] = this.removedBlock;

    if (this.originalParentId) {
      const parent = this.page.blocks[this.originalParentId];
      if (parent) {
        parent.children.splice(this.originalIndex, 0, this.blockId);
      }
    } else if (this.regionId) {
      const region = this.page.regions.find((r) => getRegionId(r) === this.regionId);
      if (region) {
        region.blocks.splice(this.originalIndex, 0, this.blockId);
      }
    }

    this.emit('block:insert', {
      blockId: this.blockId,
      block: this.removedBlock,
      parentId: this.originalParentId,
      index: this.originalIndex,
      regionId: this.regionId,
    });
  }

  getBlockId(): string {
    return this.blockId;
  }

  getRemovedBlock(): Block | undefined {
    return this.removedBlock;
  }
}
