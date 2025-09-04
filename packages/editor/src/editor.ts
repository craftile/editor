import type { Block, BlockSchema, Page } from '@craftile/types';
import { Engine } from '@craftile/core';
import { createApp, h, provide, type App } from 'vue';
import Editor from './components/Editor.vue';
import { CRAFTILE_EDITOR_SYMBOL } from './constants';
import { UIManager } from './managers/ui';
import type { I18n, I18nConfig } from './types';
import { createI18n } from './composables/i18n';
import { EventBus } from '@craftile/event-bus';
import type { InsertBlockContext } from './composables/blocks-popover';

export type BlockLabelFunction = (block: Block, schema: BlockSchema | undefined) => string;
export type BlockFilterFunction = (blockSchema: BlockSchema, context: InsertBlockContext) => boolean;

export interface CraftileEditorOptions {
  blockSchemas?: BlockSchema[];
  initialPage?: Page;
  i18n?: I18nConfig;
  blockLabelFunction?: BlockLabelFunction;
  blockFilterFunction?: BlockFilterFunction;
}

export class CraftileEditor {
  public readonly engine: Engine;
  public readonly ui: UIManager;
  public readonly i18n: I18n;
  public readonly events: EventBus;
  public readonly blockLabelFunction?: BlockLabelFunction;
  public readonly blockFilterFunction?: BlockFilterFunction;

  private vueApp: App | null = null;

  constructor(options: CraftileEditorOptions = {}) {
    this.engine = new Engine({ blockSchemas: options.blockSchemas, page: options.initialPage });

    this.ui = new UIManager();
    this.i18n = createI18n(options.i18n);
    this.events = new EventBus();

    this.blockLabelFunction = options.blockLabelFunction;
    this.blockFilterFunction = options.blockFilterFunction;

    this.setup();
  }

  private setup() {
    this.vueApp = createApp({
      setup: () => {
        provide(CRAFTILE_EDITOR_SYMBOL, this);
        return () => h(Editor);
      },
    });
  }

  mount(element: string | HTMLElement): void {
    this.vueApp!.mount(element);
  }
}
