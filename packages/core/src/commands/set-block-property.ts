import type { Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export interface SetBlockPropertyOptions {
  blockId: string;
  propertyKey: string;
  propertyValue: any;
  emit: EngineEmitFn;
}

export class SetBlockPropertyCommand implements Command {
  private getPage: () => Page;
  private blockId: string;
  private propertyKey: string;
  private propertyValue: any;
  private originalValue: any;
  private emit: EngineEmitFn;

  constructor(getPage: () => Page, options: SetBlockPropertyOptions) {
    this.getPage = getPage;
    this.blockId = options.blockId;
    this.propertyKey = options.propertyKey;
    this.propertyValue = options.propertyValue;
    this.emit = options.emit;
  }

  apply(): void {
    const block = this.getPage().blocks[this.blockId];

    if (!block) {
      throw new Error(`Block not found: ${this.blockId}`);
    }

    if (!block.properties) {
      block.properties = {};
    }

    this.originalValue = block.properties[this.propertyKey];
    block.properties[this.propertyKey] = this.propertyValue;

    this.emit('block:property:set', {
      blockId: this.blockId,
      key: this.propertyKey,
      value: this.propertyValue,
      oldValue: this.originalValue,
    });
  }

  revert(): void {
    const block = this.getPage().blocks[this.blockId];

    if (!block || !block.properties) {
      return;
    }

    if (this.originalValue !== undefined) {
      block.properties[this.propertyKey] = this.originalValue;
    } else {
      delete block.properties[this.propertyKey];
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
