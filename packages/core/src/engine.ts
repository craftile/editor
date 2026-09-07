import { EventBus } from '@craftile/event-bus';
import type { Command, EngineConfig, EngineEvents } from './types';
import type { Block, BlockSchema, BlockStructure, Page } from '@craftile/types';
import { BlocksManager } from './blocks-manager';
import { HistoryManager } from './history-manager';
import { collectVanishedDescendants } from './utils';
import { BatchCommand } from './commands/batch';
import { InsertBlockCommand } from './commands/insert-block';
import { InsertBlockFromPresetCommand } from './commands/insert-block-from-preset';
import { RemoveBlockCommand } from './commands/remove-block';
import { MoveBlockCommand } from './commands/move-block';
import { ToggleBlockCommand } from './commands/toggle-block';
import { SetBlockPropertyCommand } from './commands/set-block-property';
import { DuplicateBlockCommand } from './commands/duplicate-block';
import { SetBlockNameCommand } from './commands/set-block-name';
import { ReplacePageCommand } from './commands/replace-page';
import { ReplaceRegionCommand } from './commands/replace-region';

export class Engine extends EventBus<EngineEvents> {
  protected page!: Page;
  protected blocksManager: BlocksManager;
  protected historyManager: HistoryManager;
  private activeBatch: Command[] | null = null;

  constructor(config: EngineConfig = {}) {
    super();

    this.blocksManager = config.blocksManager || new BlocksManager();
    this.historyManager = new HistoryManager();
    this.setPage(config.page ? config.page : { blocks: {}, regions: [{ id: 'main', name: 'main', blocks: [] }] });

    if (config.blockSchemas && config.blockSchemas.length > 0) {
      config.blockSchemas.forEach((schema) => {
        this.blocksManager.register(schema.type, schema);
      });
    }
  }

  /**
   * Insert a new block into the page
   *
   * @param blockType - The type of block to insert (must be registered)
   * @param options - Optional configuration for block insertion
   * @param options.parentId - ID of parent block (for nested blocks)
   * @param options.regionId - Target region id (defaults to 'main')
   * @param options.index - Position to insert at (defaults to end)
   * @returns The ID of the newly inserted block
   * @throws {Error} When block type is not registered or parent-child relationship is invalid
   * @emits block:insert - When the block is successfully inserted
   */
  insertBlock(
    blockType: string,
    options?: {
      parentId?: string;
      regionId?: string;
      index?: number;
    }
  ): string {
    const blockSchema = this.blocksManager.get(blockType);
    if (!blockSchema) {
      throw new Error(`Block type '${blockType}' is not registered`);
    }

    if (options?.parentId) {
      const parentBlock = this.page.blocks[options.parentId];
      if (!parentBlock) {
        throw new Error(`Parent block not found: ${options.parentId}`);
      }

      if (!this.blocksManager.canBeChild(blockType, parentBlock.type)) {
        throw new Error(`Block type '${blockType}' cannot be a child of '${parentBlock.type}'`);
      }
    }

    const command = new InsertBlockCommand(this.getLivePage, {
      blockType,
      parentId: options?.parentId,
      regionId: options?.regionId,
      index: options?.index,
      blockSchema,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);

    return command.getBlockId();
  }

  /**
   * Insert a new block from a preset into the page
   *
   * @param blockType - The type of block to insert (must be registered)
   * @param presetIndex - Index of the preset in the block schema's presets array
   * @param options - Optional configuration for block insertion
   * @param options.parentId - ID of parent block (for nested blocks)
   * @param options.regionId - Target region id (defaults to 'main')
   * @param options.index - Position to insert at (defaults to end)
   * @returns The ID of the newly inserted block
   * @throws {Error} When block type is not registered, preset not found, or parent-child relationship is invalid
   * @emits block:insert - When the block is successfully inserted
   */
  insertBlockFromPreset(
    blockType: string,
    presetIndex: number,
    options?: {
      parentId?: string;
      regionId?: string;
      index?: number;
    }
  ): string {
    const blockSchema = this.blocksManager.get(blockType);
    if (!blockSchema) {
      throw new Error(`Block type '${blockType}' is not registered`);
    }

    if (!blockSchema.presets || !blockSchema.presets[presetIndex]) {
      throw new Error(`Preset at index ${presetIndex} not found for block type '${blockType}'`);
    }

    if (options?.parentId) {
      const parentBlock = this.page.blocks[options.parentId];
      if (!parentBlock) {
        throw new Error(`Parent block not found: ${options.parentId}`);
      }

      if (!this.blocksManager.canBeChild(blockType, parentBlock.type)) {
        throw new Error(`Block type '${blockType}' cannot be a child of '${parentBlock.type}'`);
      }
    }

    const command = new InsertBlockFromPresetCommand(this.getLivePage, {
      blockType,
      presetIndex,
      parentId: options?.parentId,
      regionId: options?.regionId,
      index: options?.index,
      blocksManager: this.blocksManager,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);

    return command.getBlockId();
  }

  /**
   * Remove a block from the page
   *
   * @param blockId - ID of the block to remove
   * @throws {Error} When block is not found
   * @emits block:remove - When the block is successfully removed
   */
  removeBlock(blockId: string): void {
    const command = new RemoveBlockCommand(this.getLivePage, {
      blockId,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);
  }

  /**
   * Move a block to a new location (reorder within parent or move to different parent/region)
   *
   * @param blockId - ID of the block to remove
   * @param options - Optional configuration for block move operation
   * @param options.targetParentId - ID of target parent block
   * @param options.targetIndex - position in the target parent block children
   * @param options.targetRegionId - target region id
   */
  moveBlock(
    blockId: string,
    options?: {
      targetParentId?: string;
      targetIndex?: number;
      targetRegionId?: string;
    }
  ): void {
    const block = this.page.blocks[blockId];

    if (options?.targetParentId) {
      const targetParent = this.page.blocks[options.targetParentId];
      if (!targetParent) {
        throw new Error(`Target parent block not found: ${options.targetParentId}`);
      }

      if (!this.blocksManager.canBeChild(block.type, targetParent.type)) {
        throw new Error(`Block type '${block.type}' cannot be a child of '${targetParent.type}'`);
      }
    }

    const command = new MoveBlockCommand(this.getLivePage, {
      blockId,
      targetParentId: options?.targetParentId,
      targetIndex: options?.targetIndex,
      targetRegionId: options?.targetRegionId,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);
  }

  /**
   * Toggle a block's disabled state (enable/disable)
   */
  toggleBlock(blockId: string, disabled?: boolean): void {
    const command = new ToggleBlockCommand(this.getLivePage, {
      blockId,
      disabled,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);
  }

  /**
   * Set a property value for a block
   *
   * @param blockId - ID of the target block
   * @param propertyKey - The property key to set
   * @param propertyValue - The new value for the property
   * @throws {Error} When block is not found
   * @emits block:property:set - When the property is successfully set
   */
  setBlockProperty(blockId: string, propertyKey: string, propertyValue: any): void {
    const command = new SetBlockPropertyCommand(this.getLivePage, {
      blockId,
      propertyKey,
      propertyValue,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);
  }

  /**
   * Set the display name for a block
   *
   * @param blockId - ID of the target block
   * @param name - The new display name for the block
   * @throws {Error} When block is not found
   * @emits block:update - When the name is successfully set
   */
  setBlockName(blockId: string, name: string): void {
    const command = new SetBlockNameCommand(this.getLivePage, {
      blockId,
      name,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);
  }

  /**
   * Duplicate a block (creates a copy placed right after the original)
   */
  duplicateBlock(blockId: string): string {
    const command = new DuplicateBlockCommand(this.getLivePage, {
      blockId,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);

    return command.getDuplicatedBlockId();
  }

  getBlockById(blockId: string): Block | undefined {
    return this.page.blocks[blockId];
  }

  /**
   * Export a block and its children as a nested structure
   * Useful for copying blocks or creating presets from existing blocks
   */
  exportBlockAsNestedStructure(blockId: string): BlockStructure {
    const block = this.page.blocks[blockId];
    if (!block) {
      throw new Error(`Block not found: ${blockId}`);
    }

    const { parentId: _parentId, children: _children, ...rest } = structuredClone(block);
    const structure: BlockStructure = {
      ...rest,
      children: [],
    };

    if (block.children && block.children.length > 0) {
      structure.children = block.children.map((childId) => this.exportBlockAsNestedStructure(childId));
    }

    return structure;
  }

  /**
   * Paste a block from a nested structure
   *
   * @param structure - The block structure to paste
   * @param options - Optional configuration for block insertion
   * @param options.parentId - ID of parent block (for nested blocks)
   * @param options.regionId - Target region id (defaults to 'main')
   * @param options.index - Position to insert at (defaults to end)
   * @returns The ID of the newly inserted block
   * @throws {Error} When block type is not registered or parent-child relationship is invalid
   * @emits block:insert - When the block is successfully inserted
   */
  pasteBlock(
    structure: BlockStructure,
    options?: {
      parentId?: string;
      regionId?: string;
      index?: number;
    }
  ): string {
    const blockSchema = this.blocksManager.get(structure.type);
    if (!blockSchema) {
      throw new Error(`Block type '${structure.type}' is not registered`);
    }

    if (options?.parentId) {
      const parentBlock = this.page.blocks[options.parentId];
      if (!parentBlock) {
        throw new Error(`Parent block not found: ${options.parentId}`);
      }

      if (!this.blocksManager.canBeChild(structure.type, parentBlock.type)) {
        throw new Error(`Block type '${structure.type}' cannot be a child of '${parentBlock.type}'`);
      }
    }

    const command = new InsertBlockFromPresetCommand(this.getLivePage, {
      blockType: structure.type,
      presetData: structure,
      parentId: options?.parentId,
      regionId: options?.regionId,
      index: options?.index,
      blocksManager: this.blocksManager,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);

    return command.getBlockId();
  }

  /**
   * Get current page state
   */
  getPage(): Page {
    return structuredClone(this.page);
  }

  /**
   * Set a new page (replaces current page and clears history)
   *
   * @param newPage - The new page object to set
   * @throws {Error} When the page structure is invalid
   * @emits page:set - When the page is successfully set
   */
  setPage(newPage: Page): void {
    const beforePage = structuredClone(this.page);

    this.page = this.normalizePage(newPage);

    // Clear history since we're switching to a completely new page
    // maybe we should keep a separate history per page
    this.historyManager.clear();

    this.emit('page:set', {
      previousPage: beforePage,
      newPage: structuredClone(this.page),
    });
  }

  /**
   * Replace the current page as a single undoable operation.
   */
  replacePage(newPage: Page): void {
    if (this.activeBatch) {
      throw new Error('replacePage cannot be called inside batch');
    }

    const command = new ReplacePageCommand(
      this.page,
      this.normalizePage(newPage),
      this.replacePageState.bind(this),
      this.emit.bind(this)
    );

    this.applyCommand(command);
  }

  /**
   * Replace an existing region's root blocks as a single undoable operation.
   */
  replaceRegion(regionId: string, structures: BlockStructure[]): void {
    if (this.activeBatch) {
      throw new Error('replaceRegion cannot be called inside batch');
    }

    const command = new ReplaceRegionCommand(this.getLivePage, {
      regionId,
      structures,
      blocksManager: this.blocksManager,
      emit: this.emit.bind(this),
    });

    this.applyCommand(command);
  }

  /**
   * Merge externally resolved blocks into the live page.
   *
   * Each given block replaces the existing one with the same id wholesale (no deep merge).
   * Blocks are used as given: the caller supplies `parentId` and `children`, no parent
   * back-fill or validation runs. When a patched block drops ids from its previous `children`,
   * those blocks vanish with their whole subtree unless they are present in the patch.
   * Regions are untouched. The page is mutated in place and history is neither cleared nor
   * extended, so this operation is not undoable.
   *
   * @param blocks - Blocks keyed by id
   * @throws {Error} When called inside a batch
   * @emits blocks:patch - When at least one block was given
   */
  patchBlocks(blocks: Record<string, Block>): void {
    if (this.activeBatch) {
      throw new Error('patchBlocks cannot be called inside batch');
    }

    if (Object.keys(blocks).length === 0) {
      return;
    }

    const previousPage = structuredClone(this.page);
    const removed = [...collectVanishedDescendants(this.page.blocks, blocks)];

    for (const blockId of removed) {
      delete this.page.blocks[blockId];
    }

    for (const [blockId, block] of Object.entries(blocks)) {
      this.page.blocks[blockId] = structuredClone(block);
    }

    this.emit('blocks:patch', {
      blocks,
      removed,
      previousPage,
      newPage: structuredClone(this.page),
    });
  }

  /**
   * Get the blocks manager for this engine instance
   */
  getBlocksManager(): BlocksManager {
    return this.blocksManager;
  }

  /**
   * Get block schemas
   */
  getBlockSchemas(): Record<string, BlockSchema> {
    return this.blocksManager.getAll();
  }

  /**
   * Get a specific block schema by type
   *
   * @param type - The block type to get the schema for
   * @returns The block schema or undefined if not found
   */
  getBlockSchema(type: string): BlockSchema | undefined {
    return this.blocksManager.get(type);
  }

  /**
   * Undo the last operation
   */
  undo(): boolean {
    const command = this.historyManager.undo();

    if (command !== null) {
      this.emit('undo', { command });
    }

    return command !== null;
  }

  /**
   * Redo the last undone operation
   */
  redo(): boolean {
    const command = this.historyManager.redo();

    if (command !== null) {
      this.emit('redo', { command });
    }

    return command !== null;
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.historyManager.canUndo();
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.historyManager.canRedo();
  }

  /**
   * Group multiple operations into a single undo/redo history entry.
   */
  batch<T>(callback: () => T): T {
    const isOuterBatch = this.activeBatch === null;

    if (isOuterBatch) {
      this.activeBatch = [];
    }

    const batch = this.activeBatch!;
    const startIndex = batch.length;

    try {
      const result = callback();

      if (isOuterBatch && batch.length > 0) {
        this.historyManager.addCommand(new BatchCommand(batch.slice()));
      }

      return result;
    } catch (error) {
      this.rollbackCommands(batch.slice(startIndex));
      batch.splice(startIndex);
      throw error;
    } finally {
      if (isOuterBatch) {
        this.activeBatch = null;
      }
    }
  }

  private normalizePage(page: Page): Page {
    const normalizedPage = structuredClone(page);

    if (normalizedPage.regions.length === 0) {
      normalizedPage.regions = [{ id: 'main', name: 'main', blocks: Object.keys(normalizedPage.blocks) }];
    }

    this.initializeParentChildRelationshipsForPage(normalizedPage);

    return normalizedPage;
  }

  private initializeParentChildRelationshipsForPage(page: Page): void {
    const processBlock = (block: Block): void => {
      if (block.children && block.children.length > 0) {
        block.children.forEach((childId: string) => {
          const childBlock = page.blocks[childId];
          if (childBlock) {
            if (!childBlock.parentId) {
              childBlock.parentId = block.id;
            }

            processBlock(childBlock);
          }
        });
      }
    };

    Object.values(page.blocks).forEach(processBlock);
  }

  private replacePageState(page: Page): void {
    this.page = page;
  }

  private getLivePage = (): Page => {
    return this.page;
  };

  private applyCommand(command: Command): void {
    command.apply();
    this.recordCommand(command);
  }

  private recordCommand(command: Command): void {
    if (this.activeBatch) {
      this.activeBatch.push(command);
      return;
    }

    this.historyManager.addCommand(command);
  }

  private rollbackCommands(commands: Command[]): void {
    for (let i = commands.length - 1; i >= 0; i--) {
      commands[i].revert();
    }
  }
}
