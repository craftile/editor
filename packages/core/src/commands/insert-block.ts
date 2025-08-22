import type { Block, BlockSchema } from '@craftile/types';
import type { Command, EngineEmitFn, Page } from '../types';
import { generateId } from '../utils';

export interface InsertBlockOptions {
  blockType: string;
  parentId?: string;
  regionName?: string;
  index?: number;
  properties?: Record<string, any>;
  blockSchema?: BlockSchema;
  emit: EngineEmitFn;
}

export class InsertBlockCommand implements Command {
  private page: Page;
  private blockType: string;
  private parentId?: string;
  private regionName?: string;
  private index?: number;
  private blockId: string;
  private properties: Record<string, any>;
  private insertedBlock?: Block;
  private actualIndex?: number;
  private emit: EngineEmitFn;

  constructor(page: Page, options: InsertBlockOptions) {
    this.page = page;
    this.blockType = options.blockType;
    this.parentId = options.parentId;
    this.regionName = options.regionName;
    this.index = options.index;
    this.blockId = generateId();
    this.emit = options.emit;

    this.properties = this.buildProperties(options.blockSchema);
  }

  apply(): void {
    this.insertedBlock = {
      type: this.blockType,
      id: this.blockId,
      properties: this.properties,
      children: [],
      parentId: undefined, // Will be set if inserting as child
    };

    this.page.blocks[this.blockId] = this.insertedBlock;

    if (this.parentId) {
      const parent = this.page.blocks[this.parentId];

      if (!parent) {
        throw new Error(`Parent block not found: ${this.parentId}`);
      }

      this.insertedBlock.parentId = parent.id;

      if (this.index !== undefined && this.index >= 0 && this.index <= parent.children.length) {
        parent.children.splice(this.index, 0, this.blockId);
        this.actualIndex = this.index;
      } else {
        parent.children.push(this.blockId);
        this.actualIndex = parent.children.length - 1;
      }
    } else {
      // Insert as top-level block (to the specified region)
      const targetRegionName = this.regionName || this.page.regions![0].name;
      let targetRegion = this.page.regions!.find((r) => r.name === targetRegionName);

      if (!targetRegion) {
        targetRegion = { name: targetRegionName, blocks: [] };
        this.page.regions!.push(targetRegion);
      }

      if (this.index !== undefined && this.index >= 0 && this.index <= targetRegion.blocks.length) {
        targetRegion.blocks.splice(this.index, 0, this.blockId);
        this.actualIndex = this.index;
      } else {
        targetRegion.blocks.push(this.blockId);
        this.actualIndex = targetRegion.blocks.length - 1;
      }
    }

    this.emit('block:insert', {
      blockId: this.blockId,
      block: this.insertedBlock,
      parentId: this.parentId,
      index: this.actualIndex,
      regionName: this.regionName || this.page.regions![0].name,
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
      const targetRegionName = this.regionName || this.page.regions![0].name;
      const targetRegion = this.page.regions?.find((r) => r.name === targetRegionName);

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
