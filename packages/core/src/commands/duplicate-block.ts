import type { Command, EngineEmitFn } from '../types';
import { getRegionId } from '../utils';
import type { Block, Page } from '@craftile/types';
import { generateId } from '../utils';

export interface DuplicateBlockOptions {
  blockId: string;
  emit: EngineEmitFn;
}

export class DuplicateBlockCommand implements Command {
  private getPage: () => Page;
  private blockId: string;

  // State for reverting
  private duplicatedBlockId!: string;
  private duplicatedBlock?: Block;
  private parentId?: string | null;
  private insertIndex!: number;
  private regionId?: string | null;
  private emit: EngineEmitFn;

  constructor(getPage: () => Page, options: DuplicateBlockOptions) {
    this.getPage = getPage;
    this.blockId = options.blockId;
    this.emit = options.emit;
  }

  apply(): void {
    const page = this.getPage();
    const originalBlock = page.blocks[this.blockId];
    if (!originalBlock) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.duplicatedBlockId = generateId();

    this.duplicatedBlock = this.cloneBlockWithNewIds(
      page,
      originalBlock,
      this.duplicatedBlockId,
      originalBlock.parentId
    );

    this.determineInsertLocation(page);

    this.insertDuplicatedBlock(page);

    this.emit('block:duplicate', {
      originalBlockId: this.blockId,
      newBlockId: this.duplicatedBlockId,
      newBlock: this.duplicatedBlock,
      parentId: this.parentId || undefined,
      index: this.insertIndex,
      regionId: this.regionId || undefined,
    });
  }

  revert(): void {
    if (!this.duplicatedBlock || !this.duplicatedBlockId) {
      return;
    }

    this.removeDuplicatedBlock(this.getPage());
  }

  getBlockId(): string {
    return this.blockId;
  }

  getDuplicatedBlockId(): string {
    return this.duplicatedBlockId;
  }

  getDuplicatedBlock(): Block | undefined {
    return this.duplicatedBlock;
  }

  getParentId(): string | null | undefined {
    return this.parentId;
  }

  getInsertIndex(): number {
    return this.insertIndex;
  }

  getRegionId(): string | null | undefined {
    return this.regionId;
  }

  private cloneBlockWithNewIds(page: Page, block: Block, newId: string, newParentId?: string): Block {
    const clonedBlock: Block = {
      ...structuredClone(block),
      id: newId,
      parentId: newParentId,
      children: [],
    };

    if (block.children && block.children.length > 0) {
      for (const childId of block.children) {
        const childBlock = page.blocks[childId];
        if (childBlock) {
          const newChildId = generateId();
          this.cloneBlockWithNewIds(page, childBlock, newChildId, newId);
          clonedBlock.children.push(newChildId);
        }
      }
    }

    page.blocks[newId] = clonedBlock;

    return clonedBlock;
  }

  private determineInsertLocation(page: Page): void {
    const originalBlock = page.blocks[this.blockId];

    this.parentId = originalBlock.parentId || null;

    if (this.parentId) {
      const parent = page.blocks[this.parentId];
      if (parent) {
        const index = parent.children.indexOf(this.blockId);
        this.insertIndex = index !== -1 ? index + 1 : parent.children.length;
      } else {
        this.insertIndex = 0;
      }
    } else {
      const region = page.regions.find((r) => r.blocks.includes(this.blockId));
      if (region) {
        const index = region.blocks.indexOf(this.blockId);
        this.regionId = getRegionId(region);
        this.insertIndex = index + 1;
      } else {
        this.regionId = getRegionId(page.regions[0]) || 'main';
        this.insertIndex = page.regions[0].blocks.length || 0;
      }
    }
  }

  private insertDuplicatedBlock(page: Page): void {
    if (!this.duplicatedBlock) {
      return;
    }

    if (this.parentId) {
      const targetParent = page.blocks[this.parentId];
      if (!targetParent) {
        throw new Error(`Parent block not found: ${this.parentId}`);
      }

      targetParent.children.splice(this.insertIndex, 0, this.duplicatedBlockId);
    } else {
      let targetRegion = page.regions.find((r) => getRegionId(r) === this.regionId);

      if (!targetRegion) {
        targetRegion = { name: this.regionId || 'main', blocks: [] };
        page.regions.push(targetRegion);
      }

      targetRegion.blocks.splice(this.insertIndex, 0, this.duplicatedBlockId);
    }
  }

  private removeDuplicatedBlock(page: Page): void {
    if (!this.duplicatedBlockId) {
      return;
    }

    this.removeBlockAndChildren(page, this.duplicatedBlockId);

    if (this.parentId) {
      // Remove from parent's children array
      const targetParent = page.blocks[this.parentId];
      if (targetParent) {
        const index = targetParent.children.indexOf(this.duplicatedBlockId);
        if (index !== -1) {
          targetParent.children.splice(index, 1);
        }
      }
    } else {
      // Remove from region
      if (page.regions) {
        const targetRegion = page.regions.find((r) => getRegionId(r) === this.regionId);
        if (targetRegion) {
          const index = targetRegion.blocks.indexOf(this.duplicatedBlockId);
          if (index !== -1) {
            targetRegion.blocks.splice(index, 1);
          }
        }
      }
    }
  }

  private removeBlockAndChildren(page: Page, blockId: string): void {
    const block = page.blocks[blockId];
    if (!block) {
      return;
    }

    for (const childId of block.children) {
      this.removeBlockAndChildren(page, childId);
    }

    delete page.blocks[blockId];
  }
}
