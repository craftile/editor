import type { Block, Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export interface SetBlockPropertyOptions {
  blockId: string;
  propertyKey: string;
  propertyValue: any;
  emit: EngineEmitFn;
}

export class SetBlockPropertyCommand implements Command {
  private page: Page;
  private blockId: string;
  private propertyKey: string;
  private propertyValue: any;
  private originalValue: any;
  private block?: Block;
  private emit: EngineEmitFn;

  constructor(page: Page, options: SetBlockPropertyOptions) {
    this.page = page;
    this.blockId = options.blockId;
    this.propertyKey = options.propertyKey;
    this.propertyValue = options.propertyValue;
    this.emit = options.emit;
  }

  apply(): void {
    this.block = this.page.blocks[this.blockId];

    if (!this.block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    if (!this.block.properties) {
      this.block.properties = {};
    }

    this.originalValue = this.block.properties[this.propertyKey];
    this.block.properties[this.propertyKey] = this.propertyValue;

    this.emit('block:property:set', {
      blockId: this.blockId,
      key: this.propertyKey,
      value: this.propertyValue,
      oldValue: this.originalValue,
    });
  }

  revert(): void {
    if (!this.block || !this.block.properties) {
      return;
    }

    if (this.originalValue !== undefined) {
      this.block.properties[this.propertyKey] = this.originalValue;
    } else {
      delete this.block.properties[this.propertyKey];
    }

    this.emit('block:property:set', {
      blockId: this.blockId,
      key: this.propertyKey,
      value: this.originalValue,
      oldValue: this.propertyValue,
    });
  }

  getBlockId(): string {
    return this.blockId;
  }

  getPropertyKey(): string {
    return this.propertyKey;
  }

  getPropertyValue(): any {
    return this.propertyValue;
  }

  getOriginalValue(): any {
    return this.originalValue;
  }
}
