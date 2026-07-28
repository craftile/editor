import type { Block, BlockSchema, Page } from '@craftile/types';
import { generateId, getRegionId, resolveInsertTarget } from '../utils';
import type { Command, EngineEmitFn } from '../types';

export interface InsertBlockOptions {
  blockType: string;
  parentId?: string;
  regionId?: string;
  index?: number;
  properties?: Record<string, any>;
  blockSchema?: BlockSchema;
  emit: EngineEmitFn;
}

export class InsertBlockCommand implements Command {
  private page: Page;
  private blockType: string;
  private parentId?: string;
  private regionId?: string;
  private index?: number;
  private blockId: string;
  private properties: Record<string, any>;
  private blockSchema?: BlockSchema;
  private insertedBlock?: Block;
  private actualIndex?: number;
  private emit: EngineEmitFn;

  constructor(page: Page, options: InsertBlockOptions) {
    this.page = page;
    this.blockType = options.blockType;
    this.parentId = options.parentId;
    this.regionId = options.regionId;
    this.index = options.index;
    this.blockId = generateId();
    this.emit = options.emit;
    this.blockSchema = options.blockSchema;

    this.properties = this.buildProperties(options.blockSchema);
  }

  apply(): void {
    const target = resolveInsertTarget(this.page, this.parentId, this.regionId, this.index);

    const blockName = this.blockSchema?.meta?.name || this.blockType;

    this.insertedBlock = {
      type: this.blockType,
      id: this.blockId,
      name: blockName,
      properties: this.properties,
      children: [],
      parentId: undefined,
    };

    this.page.blocks[this.blockId] = this.insertedBlock;
    this.actualIndex = target.index;

    if (target.kind === 'parent') {
      this.insertedBlock.parentId = target.parent.id;
      target.parent.children.splice(target.index, 0, this.blockId);
    } else {
      const region = this.page.regions.find((r) => getRegionId(r) === target.regionId)!;
      region.blocks.splice(target.index, 0, this.blockId);
    }

    this.emit('block:insert', {
      blockId: this.blockId,
      block: this.insertedBlock,
      parentId: this.parentId,
      index: this.actualIndex,
      regionId: this.regionId || getRegionId(this.page.regions[0]),
    });
  }

  revert(): void {
    if (!this.insertedBlock) {
      return;
    }

    delete this.page.blocks[this.blockId];

    if (this.parentId) {
      const parent = this.page.blocks[this.parentId];
      if (parent && this.actualIndex !== undefined) {
        parent.children.splice(this.actualIndex, 1);
      }
    } else {
      const targetRegionId = this.regionId || getRegionId(this.page.regions[0]);
      const targetRegion = this.page.regions.find((r) => getRegionId(r) === targetRegionId);

      if (targetRegion && this.actualIndex !== undefined) {
        targetRegion.blocks.splice(this.actualIndex, 1);
      }
    }

    this.emit('block:remove', {
      blockId: this.blockId,
      block: this.insertedBlock,
      parentId: this.parentId,
    });
  }

  getBlockId(): string {
    return this.blockId;
  }

  getInsertedBlock(): Block | undefined {
    return this.insertedBlock;
  }

  private buildProperties(blockSchema?: BlockSchema): Record<string, any> {
    const properties: Record<string, any> = {};

    if (blockSchema?.properties) {
      for (const field of blockSchema.properties) {
        if (field.default !== undefined) {
          properties[field.id] = field.default;
        }
      }
    }

    return properties;
  }
}
