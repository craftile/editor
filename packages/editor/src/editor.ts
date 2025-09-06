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
import { registerDefaultHeaderActions } from './defaults/header-actions';
import { DevicesManager, type DevicesManagerOptions } from './managers/devices';
import { registerDefaultConfigurationPanels } from './defaults/configuration-panels';
import { PluginsManager } from './managers/plugins';
import type { CraftileEditorPlugin } from './types/plugin';

export type BlockLabelFunction = (block: Block, schema: BlockSchema | undefined) => string;
export type BlockFilterFunction = (blockSchema: BlockSchema, context: InsertBlockContext) => boolean;

export interface CraftileEditorOptions {
  blockSchemas?: BlockSchema[];
  initialPage?: Page;
  devices?: DevicesManagerOptions;
  i18n?: I18nConfig;
  plugins?: CraftileEditorPlugin[];
  blockLabelFunction?: BlockLabelFunction;
  blockFilterFunction?: BlockFilterFunction;
}

export class CraftileEditor {
  public readonly engine: Engine;
  public readonly ui: UIManager;
  public readonly i18n: I18n;
  public readonly events: EventBus;
  public readonly devices: DevicesManager;
  public readonly blockLabelFunction?: BlockLabelFunction;
  public readonly blockFilterFunction?: BlockFilterFunction;
  public readonly plugins: PluginsManager;

  private vueApp: App | null = null;

  constructor(options: CraftileEditorOptions = {}) {
    this.engine = new Engine({ blockSchemas: options.blockSchemas, page: options.initialPage });

    this.events = new EventBus();
    this.i18n = createI18n(options.i18n);
    this.devices = new DevicesManager(options.devices);
    this.ui = new UIManager(this.events);
    this.plugins = new PluginsManager(this);

    this.blockLabelFunction = options.blockLabelFunction;
    this.blockFilterFunction = options.blockFilterFunction;

    options.plugins?.forEach((plugin) => this.plugins.register(plugin));

    this.setup();
  }

  private setup() {
    registerDefaultHeaderActions(this.ui);
    registerDefaultConfigurationPanels(this.ui);

    this.vueApp = createApp({
      setup: () => {
        provide(CRAFTILE_EDITOR_SYMBOL, this);
        return () => h(Editor);
      },
    });

    this.plugins.setupPlugins(this.vueApp);
  }

  mount(element: string | HTMLElement): void {
    this.vueApp!.mount(element);
  }
}
