import type { Block, BlockProperties, BlockSchema, BlockStructure, Page } from '@craftile/types';
import { generateId, getRegionId, resolveInsertTarget } from '../utils';
import type { Command, EngineEmitFn } from '../types';
import type { BlocksManager } from '../blocks-manager';

export interface InsertBlockFromPresetOptions {
  blockType: string;
  presetIndex?: number;
  presetData?: BlockStructure;
  parentId?: string;
  regionId?: string;
  index?: number;
  blocksManager: BlocksManager;
  emit: EngineEmitFn;
}

export class InsertBlockFromPresetCommand implements Command {
  private page: Page;
  private blockType: string;
  private presetIndex?: number;
  private presetData?: BlockStructure;
  private parentId?: string;
  private regionId?: string;
  private index?: number;
  private blockId: string;
  private properties: Record<string, any>;
  private insertedBlock?: Block;
  private actualIndex?: number;
  private resolvedRegionId?: string;
  private blocksManager: BlocksManager;
  private emit: EngineEmitFn;
  private createdBlockIds: string[] = [];

  constructor(page: Page, options: InsertBlockFromPresetOptions) {
    this.page = page;
    this.blockType = options.blockType;
    this.presetIndex = options.presetIndex;
    this.presetData = options.presetData;
    this.parentId = options.parentId;
    this.regionId = options.regionId;
    this.index = options.index;
    this.blockId = generateId();
    this.blocksManager = options.blocksManager;
    this.emit = options.emit;

    if (options.presetIndex === undefined && !options.presetData) {
      throw new Error('Either presetIndex or presetData must be provided');
    }

    const blockSchema = this.blocksManager.get(this.blockType);
    if (!blockSchema) {
      throw new Error(`Block type '${this.blockType}' not found`);
    }

    let properties: BlockProperties | undefined;

    if (options.presetData) {
      properties = options.presetData.properties;
    } else if (options.presetIndex !== undefined) {
      const preset = blockSchema.presets?.[options.presetIndex];
      if (!preset) {
        throw new Error(`Preset at index ${options.presetIndex} not found for block type '${this.blockType}'`);
      }

      properties = preset.properties;
    }

    this.properties = this.buildProperties(blockSchema, properties);
  }

  apply(): void {
    const target = resolveInsertTarget(this.page, this.parentId, this.regionId, this.index);
    this.resolvedRegionId = target.kind === 'region' ? target.regionId : undefined;

    const blockSchema = this.blocksManager.get(this.blockType);

    if (this.presetData) {
      this.insertedBlock = {
        ...structuredClone(this.presetData),
        type: this.blockType,
        id: this.blockId,
        name: this.presetData.name || blockSchema?.meta?.name || this.blockType,
        semanticId: this.presetData.semanticId || this.presetData.id,
        properties: this.properties,
        children: [],
        parentId: undefined,
      };

      this.page.blocks[this.blockId] = this.insertedBlock;
      this.createdBlockIds.push(this.blockId);

      if (this.presetData.children && this.presetData.children.length > 0) {
        this.insertedBlock.children = this.createChildrenFromPreset(this.presetData.children, this.blockId);
      }
    } else if (this.presetIndex !== undefined) {
      const preset = blockSchema?.presets?.[this.presetIndex];
      if (!preset) {
        throw new Error(`Preset at index ${this.presetIndex} not found`);
      }

      this.insertedBlock = {
        type: this.blockType,
        id: this.blockId,
        name: preset.name,
        properties: this.properties,
        children: [],
        parentId: undefined,
      };

      this.page.blocks[this.blockId] = this.insertedBlock;
      this.createdBlockIds.push(this.blockId);

      if (preset.children && preset.children.length > 0) {
        this.insertedBlock.children = this.createChildrenFromPreset(preset.children, this.blockId);
      }
    }

    if (!this.insertedBlock) {
      throw new Error('Failed to create block');
    }

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

    // Remove all created blocks
    for (const blockId of this.createdBlockIds) {
      delete this.page.blocks[blockId];
    }

    if (this.parentId) {
      const parent = this.page.blocks[this.parentId];
      if (parent && this.actualIndex !== undefined) {
        parent.children.splice(this.actualIndex, 1);
      }
    } else if (this.resolvedRegionId) {
      const targetRegion = this.page.regions.find((r) => getRegionId(r) === this.resolvedRegionId);

      if (targetRegion && this.actualIndex !== undefined) {
        targetRegion.blocks.splice(this.actualIndex, 1);
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

  private createChildrenFromPreset(structures: BlockStructure[], parentId: string): string[] {
    const childIds: string[] = [];

    for (const structure of structures) {
      const childId = generateId();
      const childSchema = this.blocksManager.get(structure.type);

      if (!childSchema) {
        console.warn(`Block type '${structure.type}' not found, skipping child`);
        continue;
      }

      const childProperties = this.buildProperties(childSchema, structure.properties);

      const childBlock: Block = {
        ...structuredClone(structure),
        type: structure.type,
        id: childId,
        name: structure.name || childSchema.meta?.name || structure.type,
        semanticId: structure.semanticId || structure.id,
        properties: childProperties,
        children: [],
        parentId,
      };

      this.page.blocks[childId] = childBlock;
      this.createdBlockIds.push(childId);

      // Recursively create nested children
      if (structure.children && structure.children.length > 0) {
        childBlock.children = this.createChildrenFromPreset(structure.children, childId);
      }

      childIds.push(childId);
    }

    return childIds;
  }

  private buildProperties(blockSchema?: BlockSchema, presetProperties?: Record<string, any>): Record<string, any> {
    const properties: Record<string, any> = {};

    // Start with schema defaults
    if (blockSchema?.properties) {
      for (const field of blockSchema.properties) {
        if (field.default !== undefined) {
          properties[field.id] = field.default;
        }
      }
    }

    // Merge preset properties (overrides defaults)
    if (presetProperties) {
      Object.assign(properties, presetProperties);
    }

    return properties;
  }
}
