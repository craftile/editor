import type { Block, Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export interface MoveBlockOptions {
  blockId: string;
  targetParentId?: string;
  targetIndex?: number;
  targetRegionName?: string;
  emit: EngineEmitFn;
}

export class MoveBlockCommand implements Command {
  private page: Page;
  private blockId: string;
  private targetParentId?: string;
  private targetIndex?: number;
  private targetRegionName?: string;

  // State for reverting
  private blockToMove?: Block;
  private originalParentId?: string;
  private originalIndex!: number;
  private originalRegionName?: string;

  private emit: EngineEmitFn;

  constructor(page: Page, options: MoveBlockOptions) {
    this.page = page;
    this.blockId = options.blockId;
    this.targetParentId = options.targetParentId;
    this.targetIndex = options.targetIndex;
    this.targetRegionName = options.targetRegionName;
    this.emit = options.emit;
  }

  apply(): void {
    this.blockToMove = this.page.blocks[this.blockId];

    if (!this.blockToMove) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    if (this.targetParentId && !this.page.blocks[this.targetParentId]) {
      throw new Error(`Target parent not found: ${this.targetParentId}`);
    }

    this.originalParentId = this.blockToMove.parentId;

    // First we remove the block from the current position
    if (this.originalParentId) {
      const parent = this.page.blocks[this.originalParentId];
      if (parent) {
        this.originalIndex = parent.children.indexOf(this.blockId);
        if (this.originalIndex !== -1) {
          parent.children.splice(this.originalIndex, 1);
        }
      }
    } else {
      // it is a region level block
      const region = this.page.regions!.find((r) => r.blocks.includes(this.blockId));
      if (region) {
        this.originalIndex = region.blocks.indexOf(this.blockId);
        this.originalRegionName = region.name;
        region.blocks.splice(this.originalIndex, 1);
      }
    }

    // the we insert the block at the new position
    if (this.targetParentId) {
      const targetParent = this.page.blocks[this.targetParentId];
      this.blockToMove.parentId = this.targetParentId;

      if (this.targetIndex !== undefined && this.targetIndex >= 0 && this.targetIndex <= targetParent.children.length) {
        targetParent.children.splice(this.targetIndex, 0, this.blockId);
      } else {
        targetParent.children.push(this.blockId);
      }
    } else {
      this.blockToMove.parentId = undefined;

      const regionName = this.targetRegionName || this.page.regions![0].name || 'main';
      let targetRegion = this.page.regions!.find((r) => r.name === regionName);

      if (!targetRegion) {
        targetRegion = { name: regionName, blocks: [] };
        this.page.regions!.push(targetRegion);
      }

      if (this.targetIndex !== undefined && this.targetIndex >= 0 && this.targetIndex <= targetRegion.blocks.length) {
        targetRegion.blocks.splice(this.targetIndex, 0, this.blockId);
      } else {
        targetRegion.blocks.push(this.blockId);
      }
    }

    this.emit('block:move', {
      blockId: this.blockId,
      targetParentId: this.targetParentId,
      targetIndex: this.targetIndex,
      targetRegionName: this.targetRegionName,
      sourceParentId: this.originalParentId || null,
      sourceRegionName: this.originalRegionName || null,
      sourceIndex: this.originalIndex,
    });
  }

  revert(): void {
    if (!this.blockToMove || this.originalIndex === undefined) {
      return;
    }

    if (this.blockToMove.parentId) {
      const currentParent = this.page.blocks[this.blockToMove.parentId];
      if (currentParent) {
        const index = currentParent.children.indexOf(this.blockId);
        if (index !== -1) {
          currentParent.children.splice(index, 1);
        }
      }
    } else {
      const region = this.page.regions!.find((r) => r.blocks.includes(this.blockId));
      if (region) {
        const index = region.blocks.indexOf(this.blockId);
        if (index !== -1) {
          region.blocks.splice(index, 1);
        }
      }
    }

    this.blockToMove.parentId = this.originalParentId;

    if (this.originalParentId) {
      const originalParent = this.page.blocks[this.originalParentId];
      if (originalParent) {
        originalParent.children.splice(this.originalIndex, 0, this.blockId);
      }
    } else if (this.originalRegionName) {
      const region = this.page.regions!.find((r) => r.name === this.originalRegionName);
      if (region) {
        region.blocks.splice(this.originalIndex, 0, this.blockId);
      }
    }

    this.emit('block:move', {
      blockId: this.blockId,
      targetParentId: this.originalParentId,
      targetIndex: this.originalIndex,
      targetRegionName: this.originalRegionName,
      sourceParentId: this.targetParentId || null,
      sourceRegionName: this.targetRegionName || null,
      sourceIndex: this.targetIndex || 0,
    });
  }

  getBlockId(): string {
    return this.blockId;
  }

  getTargetParentId(): string | undefined {
    return this.targetParentId;
  }

  getTargetIndex(): number | undefined {
    return this.targetIndex;
  }

  getTargetRegionName(): string | undefined {
    return this.targetRegionName;
  }

  getSourceParentId(): string | null {
    return this.originalParentId || null;
  }

  getSourceRegionName(): string | null {
    return this.originalRegionName || null;
  }

  getSourceIndex(): number {
    return this.originalIndex;
  }
}
