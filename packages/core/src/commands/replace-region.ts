import type { Block, BlockSchema, BlockStructure, Page } from '@craftile/types';
import type { BlocksManager } from '../blocks-manager';
import type { Command, EngineEmitFn } from '../types';
import { generateId, getRegionId } from '../utils';

export interface ReplaceRegionOptions {
  regionId: string;
  structures: BlockStructure[];
  blocksManager: BlocksManager;
  emit: EngineEmitFn;
}

export class ReplaceRegionCommand implements Command {
  private getPage: () => Page;
  private regionId: string;
  private regionIndex: number;
  private previousRegion: Page['regions'][number];
  private newRegion: Page['regions'][number];
  private removedBlocks: Record<string, Block>;
  private newBlocks: Record<string, Block>;
  private emit: EngineEmitFn;
  private blocksManager: BlocksManager;

  constructor(getPage: () => Page, options: ReplaceRegionOptions) {
    this.getPage = getPage;
    this.regionId = options.regionId;
    this.blocksManager = options.blocksManager;
    this.emit = options.emit;

    const page = this.getPage();

    this.regionIndex = page.regions.findIndex((region) => getRegionId(region) === this.regionId);
    if (this.regionIndex === -1) {
      throw new Error(`Region not found: ${this.regionId}`);
    }

    this.previousRegion = structuredClone(page.regions[this.regionIndex]);
    this.removedBlocks = this.collectBlocksForRoots(page, this.previousRegion.blocks);

    this.newBlocks = {};
    const newRootIds = options.structures.map((structure) =>
      this.createBlockFromStructure(structure, undefined, this.newBlocks)
    );
    this.newRegion = {
      ...this.previousRegion,
      blocks: newRootIds,
    };
  }

  apply(): void {
    this.replaceRegion(this.previousRegion, this.newRegion, this.removedBlocks, this.newBlocks);
  }

  revert(): void {
    this.replaceRegion(this.newRegion, this.previousRegion, this.newBlocks, this.removedBlocks);
  }

  private createBlockFromStructure(
    structure: BlockStructure,
    parentId: string | undefined,
    target: Record<string, Block>
  ): string {
    const blockSchema = this.blocksManager.get(structure.type);
    if (!blockSchema) {
      throw new Error(`Block type '${structure.type}' is not registered`);
    }

    const blockId = generateId();
    const block: Block = {
      ...structuredClone(structure),
      type: structure.type,
      id: blockId,
      name: structure.name || blockSchema.meta?.name || structure.type,
      semanticId: structure.semanticId || structure.id,
      properties: this.buildProperties(blockSchema, structure.properties),
      children: [],
      parentId,
    };

    target[blockId] = block;
    block.children = (structure.children ?? []).map((child) => this.createBlockFromStructure(child, blockId, target));

    return blockId;
  }

  private buildProperties(blockSchema: BlockSchema, properties?: Record<string, any>): Record<string, any> {
    const builtProperties: Record<string, any> = {};

    for (const field of blockSchema.properties ?? []) {
      if (field.default !== undefined) {
        builtProperties[field.id] = field.default;
      }
    }

    if (properties) {
      Object.assign(builtProperties, properties);
    }

    return builtProperties;
  }

  private collectBlocksForRoots(page: Page, rootBlockIds: string[]): Record<string, Block> {
    const blocks: Record<string, Block> = {};

    const collectBlock = (blockId: string) => {
      const block = page.blocks[blockId];
      if (!block || blocks[blockId]) {
        return;
      }

      blocks[blockId] = block;
      block.children.forEach(collectBlock);
    };

    rootBlockIds.forEach(collectBlock);

    return blocks;
  }

  private replaceRegion(
    previousRegion: Page['regions'][number],
    newRegion: Page['regions'][number],
    removedBlocks: Record<string, Block>,
    newBlocks: Record<string, Block>
  ): void {
    const page = this.getPage();

    Object.keys(removedBlocks).forEach((blockId) => {
      delete page.blocks[blockId];
    });

    Object.entries(newBlocks).forEach(([blockId, block]) => {
      page.blocks[blockId] = block;
    });

    page.regions[this.regionIndex] = newRegion;

    this.emit('region:replace', {
      regionId: this.regionId,
      previousRegion: structuredClone(previousRegion),
      newRegion: structuredClone(newRegion),
      removedBlocks: structuredClone(removedBlocks),
      newBlocks: structuredClone(newBlocks),
    });
  }
}
