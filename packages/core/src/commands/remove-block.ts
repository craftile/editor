import type { Block, Page } from '@craftile/types';
import { getRegionId } from '../utils';
import type { Command, EngineEmitFn } from '../types';

export interface RemoveBlockOptions {
  blockId: string;
  emit: EngineEmitFn;
}

export class RemoveBlockCommand implements Command {
  private getPage: () => Page;
  private blockId: string;
  private removedBlock?: Block;
  private removedDescendants: Block[] = [];
  private originalIndex?: number;
  private originalParentId?: string;
  private regionId?: string;
  private emit: EngineEmitFn;

  constructor(getPage: () => Page, options: RemoveBlockOptions) {
    this.getPage = getPage;
    this.blockId = options.blockId;
    this.emit = options.emit;
  }

  apply(): void {
    const page = this.getPage();
    this.removedBlock = page.blocks[this.blockId];

    if (!this.removedBlock) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.originalParentId = this.removedBlock.parentId;

    if (this.originalParentId) {
      const parent = page.blocks[this.originalParentId];
      if (parent) {
        this.originalIndex = parent.children.indexOf(this.blockId);
        if (this.originalIndex !== -1) {
          parent.children.splice(this.originalIndex, 1);
        }
      }
    } else {
      const region = page.regions.find((r) => r.blocks.includes(this.blockId));
      if (region) {
        this.originalIndex = region.blocks.indexOf(this.blockId);
        this.regionId = getRegionId(region);
        region.blocks.splice(this.originalIndex, 1);
      }
    }

    this.removedDescendants = this.collectDescendants(page, this.removedBlock);
    for (const descendant of this.removedDescendants) {
      delete page.blocks[descendant.id];
    }

    delete page.blocks[this.blockId];

    this.emit('block:remove', {
      blockId: this.blockId,
      block: this.removedBlock,
      parentId: this.originalParentId,
      regionId: this.regionId,
    });
  }

  revert(): void {
    if (!this.removedBlock || this.originalIndex === undefined) {
      return;
    }

    const page = this.getPage();

    page.blocks[this.blockId] = this.removedBlock;
    for (const descendant of this.removedDescendants) {
      page.blocks[descendant.id] = descendant;
    }

    if (this.originalParentId) {
      const parent = page.blocks[this.originalParentId];
      if (parent) {
        parent.children.splice(this.originalIndex, 0, this.blockId);
      }
    } else if (this.regionId) {
      const region = page.regions.find((r) => getRegionId(r) === this.regionId);
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

  private collectDescendants(page: Page, block: Block): Block[] {
    const descendants: Block[] = [];

    for (const childId of block.children) {
      const child = page.blocks[childId];
      if (child) {
        descendants.push(child, ...this.collectDescendants(page, child));
      }
    }

    return descendants;
  }
}
