import type { Block, BlockSchema, Page, PresetChild } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';
import { generateId } from '../utils';
import type { BlocksManager } from '../blocks-manager';

export interface InsertBlockFromPresetOptions {
  blockType: string;
  presetIndex: number;
  parentId?: string;
  regionName?: string;
  index?: number;
  blocksManager: BlocksManager;
  emit: EngineEmitFn;
}

export class InsertBlockFromPresetCommand implements Command {
  private page: Page;
  private blockType: string;
  private presetIndex: number;
  private parentId?: string;
  private regionName?: string;
  private index?: number;
  private blockId: string;
  private properties: Record<string, any>;
  private insertedBlock?: Block;
  private actualIndex?: number;
  private blocksManager: BlocksManager;
  private emit: EngineEmitFn;
  private createdBlockIds: string[] = [];

  constructor(page: Page, options: InsertBlockFromPresetOptions) {
    this.page = page;
    this.blockType = options.blockType;
    this.presetIndex = options.presetIndex;
    this.parentId = options.parentId;
    this.regionName = options.regionName;
    this.index = options.index;
    this.blockId = generateId();
    this.blocksManager = options.blocksManager;
    this.emit = options.emit;

    const blockSchema = this.blocksManager.get(this.blockType);
    if (!blockSchema) {
      throw new Error(`Block type '${this.blockType}' not found`);
    }

    const preset = blockSchema.presets?.[this.presetIndex];
    if (!preset) {
      throw new Error(`Preset at index ${this.presetIndex} not found for block type '${this.blockType}'`);
    }

    this.properties = this.buildProperties(blockSchema, preset.properties);
  }

  apply(): void {
    const blockSchema = this.blocksManager.get(this.blockType);
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

    // Insert the root block in the appropriate location
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
      // Insert as top-level block
      const targetRegionName = this.regionName || this.page.regions[0].name;
      let targetRegion = this.page.regions.find((r) => r.name === targetRegionName);

      if (!targetRegion) {
        targetRegion = { name: targetRegionName, blocks: [] };
        this.page.regions.push(targetRegion);
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
      regionName: this.regionName || this.page.regions[0].name,
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
    } else {
      const targetRegionName = this.regionName || this.page.regions[0].name;
      const targetRegion = this.page.regions.find((r) => r.name === targetRegionName);

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

  private createChildrenFromPreset(presetChildren: PresetChild[], parentId: string): string[] {
    const childIds: string[] = [];

    for (const presetChild of presetChildren) {
      const childId = generateId();
      const childSchema = this.blocksManager.get(presetChild.type);

      if (!childSchema) {
        console.warn(`Block type '${presetChild.type}' not found, skipping child`);
        continue;
      }

      const childProperties = this.buildProperties(childSchema, presetChild.properties);

      const childBlock: Block = {
        type: presetChild.type,
        id: childId,
        name: presetChild.name || childSchema.meta?.name || presetChild.type, // Preserve custom name from preset
        semanticId: presetChild.id, // Preserve semantic ID from preset
        properties: childProperties,
        children: [],
        parentId,
        static: presetChild.static, // Preserve static flag
      };

      this.page.blocks[childId] = childBlock;
      this.createdBlockIds.push(childId);

      // Recursively create nested children
      if (presetChild.children && presetChild.children.length > 0) {
        childBlock.children = this.createChildrenFromPreset(presetChild.children, childId);
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
