import type { Block, Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';
import type { ResolvedTarget } from '../utils';
import { canInsertDynamicChildAt, clampIndex, getRegionId, resolveRegionId } from '../utils';

export interface MoveBlockOptions {
  blockId: string;
  targetParentId?: string;
  targetIndex?: number;
  targetRegionId?: string;
  emit: EngineEmitFn;
}

export class MoveBlockCommand implements Command {
  private page: Page;
  private blockId: string;
  private targetParentId?: string;
  private targetIndex?: number;
  private targetRegionId?: string;

  // State for reverting
  private blockToMove?: Block;
  private originalParentId?: string;
  private originalIndex!: number;
  private originalRegionId?: string;

  private emit: EngineEmitFn;

  constructor(page: Page, options: MoveBlockOptions) {
    this.page = page;
    this.blockId = options.blockId;
    this.targetParentId = options.targetParentId;
    this.targetIndex = options.targetIndex;
    this.targetRegionId = options.targetRegionId;
    this.emit = options.emit;
  }

  apply(): void {
    const target = this.validateAndResolveTarget();

    if (this.originalParentId) {
      const sourceParent = this.page.blocks[this.originalParentId];
      if (sourceParent && this.originalIndex !== -1) {
        sourceParent.children.splice(this.originalIndex, 1);
      }
    } else if (this.originalRegionId) {
      const sourceRegion = this.page.regions.find((r) => getRegionId(r) === this.originalRegionId);
      if (sourceRegion && this.originalIndex !== -1) {
        sourceRegion.blocks.splice(this.originalIndex, 1);
      }
    }

    if (target.kind === 'parent') {
      this.blockToMove!.parentId = target.parent.id;
      target.parent.children.splice(target.index, 0, this.blockId);
    } else {
      this.blockToMove!.parentId = undefined;
      const region = this.page.regions.find((r) => getRegionId(r) === target.regionId)!;
      region.blocks.splice(target.index, 0, this.blockId);
    }

    this.emit('block:move', {
      blockId: this.blockId,
      targetParentId: this.targetParentId,
      targetIndex: this.targetIndex,
      targetRegionId: target.kind === 'region' ? target.regionId : undefined,
      sourceParentId: this.originalParentId || null,
      sourceRegionId: this.originalRegionId || null,
      sourceIndex: this.originalIndex,
    });
  }

  /**
   * Resolve the target parent/region and the splice index, asserting the
   * dynamic-child placement rules against the prospective post-move layout.
   * Captures the source position too so `revert()` can restore it. Pure read —
   * does not mutate `page`.
   */
  private validateAndResolveTarget(): ResolvedTarget {
    this.blockToMove = this.page.blocks[this.blockId];
    if (!this.blockToMove) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    this.originalParentId = this.blockToMove.parentId;
    if (this.originalParentId) {
      const sourceParent = this.page.blocks[this.originalParentId];
      this.originalIndex = sourceParent ? sourceParent.children.indexOf(this.blockId) : -1;
    } else {
      const sourceRegion = this.page.regions.find((r) => r.blocks.includes(this.blockId));
      if (sourceRegion) {
        this.originalRegionId = getRegionId(sourceRegion);
        this.originalIndex = sourceRegion.blocks.indexOf(this.blockId);
      } else {
        this.originalIndex = -1;
      }
    }

    if (this.targetParentId) {
      const parent = this.page.blocks[this.targetParentId];
      if (!parent) {
        throw new Error(`Target parent not found: ${this.targetParentId}`);
      }

      const sourceIsTarget = this.originalParentId === this.targetParentId;
      const prospective = sourceIsTarget ? parent.children.filter((id) => id !== this.blockId) : parent.children;
      const index = clampIndex(prospective.length, this.targetIndex);

      if (!canInsertDynamicChildAt(prospective, this.page.blocks, index)) {
        throw new Error(
          `Cannot place at index ${index} of ${this.targetParentId}: not a valid slot for a dynamic child`
        );
      }

      return { kind: 'parent', parent, index };
    }

    const regionId = resolveRegionId(this.page, this.targetRegionId);
    const existing = this.page.regions.find((r) => getRegionId(r) === regionId);
    if (!existing) {
      throw new Error(`Region not found: ${regionId}`);
    }

    const sourceIsTarget = this.originalRegionId === regionId;
    const prospective = sourceIsTarget ? existing.blocks.filter((id) => id !== this.blockId) : existing.blocks;

    return { kind: 'region', regionId, index: clampIndex(prospective.length, this.targetIndex) };
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
      const region = this.page.regions.find((r) => r.blocks.includes(this.blockId));
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
    } else if (this.originalRegionId) {
      const region = this.page.regions.find((r) => getRegionId(r) === this.originalRegionId);
      if (region) {
        region.blocks.splice(this.originalIndex, 0, this.blockId);
      }
    }

    this.emit('block:move', {
      blockId: this.blockId,
      targetParentId: this.originalParentId,
      targetIndex: this.originalIndex,
      targetRegionId: this.originalRegionId,
      sourceParentId: this.targetParentId || null,
      sourceRegionId: this.targetRegionId || null,
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

  getTargetRegionId(): string | undefined {
    return this.targetRegionId;
  }

  getSourceParentId(): string | null {
    return this.originalParentId || null;
  }

  getSourceRegionId(): string | null {
    return this.originalRegionId || null;
  }

  getSourceIndex(): number {
    return this.originalIndex;
  }
}
