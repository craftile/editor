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
  private getPage: () => Page;
  private blockType: string;
  private parentId?: string;
  private regionId?: string;
  private index?: number;
  private blockId: string;
  private properties: Record<string, any>;
  private blockSchema?: BlockSchema;
  private insertedBlock?: Block;
  private actualIndex?: number;
  private resolvedRegionId?: string;
  private emit: EngineEmitFn;

  constructor(getPage: () => Page, options: InsertBlockOptions) {
    this.getPage = getPage;
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
    const page = this.getPage();
    const target = resolveInsertTarget(page, this.parentId, this.regionId, this.index);
    this.resolvedRegionId = target.kind === 'region' ? target.regionId : undefined;

    const blockName = this.blockSchema?.meta?.name || this.blockType;

    this.insertedBlock = {
      type: this.blockType,
      id: this.blockId,
      name: blockName,
      properties: this.properties,
      children: [],
      parentId: undefined,
    };

    page.blocks[this.blockId] = this.insertedBlock;
    this.actualIndex = target.index;

    if (target.kind === 'parent') {
      this.insertedBlock.parentId = target.parent.id;
      target.parent.children.splice(target.index, 0, this.blockId);
    } else {
      const region = page.regions.find((r) => getRegionId(r) === target.regionId)!;
      region.blocks.splice(target.index, 0, this.blockId);
    }

    this.emit('block:insert', {
      blockId: this.blockId,
      block: this.insertedBlock,
      parentId: this.parentId,
      index: this.actualIndex,
      regionId: this.regionId || getRegionId(page.regions[0]),
    });
  }

  revert(): void {
    if (!this.insertedBlock) {
      return;
    }

    const page = this.getPage();

    delete page.blocks[this.blockId];

    if (this.parentId) {
      const parent = page.blocks[this.parentId];
      const index = parent ? parent.children.indexOf(this.blockId) : -1;
      if (parent && index !== -1) {
        parent.children.splice(index, 1);
      }
    } else if (this.resolvedRegionId) {
      const targetRegion = page.regions.find((r) => getRegionId(r) === this.resolvedRegionId);
      const index = targetRegion ? targetRegion.blocks.indexOf(this.blockId) : -1;
      if (targetRegion && index !== -1) {
        targetRegion.blocks.splice(index, 1);
      }
    }

    this.emit('block:remove', {
      blockId: this.blockId,
      block: this.insertedBlock,
      parentId: this.parentId,
      regionId: this.resolvedRegionId,
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
