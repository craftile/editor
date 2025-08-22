import { EventBus } from '@craftile/event-bus';
import type { EngineConfig, EngineEvents, Page } from './types';
import type { Block, BlockSchema } from '@craftile/types';
import { BlocksManager } from './blocks-manager';

export class Engine extends EventBus<EngineEvents> {
  protected page!: Page;
  protected blocksManager: BlocksManager;

  constructor(config: EngineConfig = {}) {
    super();

    this.setPage(config.page ? config.page : { blocks: {}, regions: [{ name: 'main', blocks: [] }] });
    this.blocksManager = config.blocksManager || new BlocksManager();

    if (config.blockSchemas && config.blockSchemas.length > 0) {
      config.blockSchemas.forEach((schema) => {
        this.blocksManager.register(schema.type, schema);
      });
    }

    this.initializeParentChildRelationships();

    // Initialize regions if not present
    if (!this.page.regions || this.page.regions.length === 0) {
      this.page.regions = [
        {
          name: 'main',
          blocks: Object.values(this.page.blocks)
            .filter((block) => !block.parentId)
            .map((block) => block.id),
        },
      ];
    }
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

    this.page = structuredClone(newPage);

    if (!this.page.regions || this.page.regions.length === 0) {
      this.page.regions = [{ name: 'main', blocks: Object.keys(this.page.blocks) }];
    }

    // Initialize parent-child relationships for the new page
    this.initializeParentChildRelationships();

    // Clear history since we're switching to a completely new page
    // this.historyManager.clear();

    this.emit('page:set', {
      previousPage: beforePage,
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
   * Initialize parent-child relationships for blocks that have children but missing parentId
   * Handles deep nesting recursively
   */
  private initializeParentChildRelationships(): void {
    const processBlock = (block: Block): void => {
      if (block.children && block.children.length > 0) {
        block.children.forEach((childId: string) => {
          const childBlock = this.page.blocks[childId];
          if (childBlock) {
            if (!childBlock.parentId) {
              childBlock.parentId = block.id;
            }

            processBlock(childBlock);
          }
        });
      }
    };

    Object.values(this.page.blocks).forEach(processBlock);
  }
}
