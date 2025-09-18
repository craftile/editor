import { createApp, h, provide, type App } from 'vue';
import { Engine } from '@craftile/core';
import { EventBus } from '@craftile/event-bus';
import type { Block, BlockSchema, Page } from '@craftile/types';

import Editor from './components/Editor.vue';
import { CRAFTILE_EDITOR_SYMBOL } from './constants';
import { UIManager } from './managers/ui';
import type { I18n, I18nConfig } from './types';
import { createI18n } from './composables/i18n';
import type { InsertBlockContext } from './composables/blocks-popover';
import { registerDefaultHeaderActions } from './defaults/header-actions';
import { registerDefaultKeyboardShortcuts } from './defaults/keyboard-shortcuts';
import { DevicesManager, type DevicesManagerOptions } from './managers/devices';
import { registerDefaultConfigurationPanels } from './defaults/configuration-panels';
import { PluginsManager } from './managers/plugins';
import type { CraftileEditorPlugin } from './types/plugin';
import { PreviewManager } from './managers/preview';
import { watchEngineUpdates } from './watch-engine-updates';
import { InspectorManager } from './managers/inspector';

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
  previewUpdateDelay?: number;
}

export class CraftileEditor {
  public readonly engine: Engine;
  public readonly ui: UIManager;
  public readonly i18n: I18n;
  public readonly events: EventBus;
  public readonly devices: DevicesManager;
  public readonly preview: PreviewManager;
  public readonly plugins: PluginsManager;
  public readonly inspector: InspectorManager;
  public readonly blockLabelFunction?: BlockLabelFunction;
  public readonly blockFilterFunction?: BlockFilterFunction;
  public readonly previewUpdateDelay?: number;

  private vueApp: App | null = null;

  constructor(options: CraftileEditorOptions = {}) {
    this.engine = new Engine({ blockSchemas: options.blockSchemas, page: options.initialPage });

    this.events = new EventBus();
    this.i18n = createI18n(options.i18n);
    this.devices = new DevicesManager(options.devices);
    this.preview = new PreviewManager();
    this.ui = new UIManager(this.events);
    this.plugins = new PluginsManager(this);
    this.inspector = new InspectorManager(this.events, this.preview, this.ui);

    this.blockLabelFunction = options.blockLabelFunction;
    this.blockFilterFunction = options.blockFilterFunction;
    this.previewUpdateDelay = options.previewUpdateDelay;

    options.plugins?.forEach((plugin) => this.plugins.register(plugin));

    this.setup();
  }

  /**
   * Shortcut method to get the current selected block
   */
  getActiveBlock(): Block | undefined {
    return this.ui.state.selectedBlockId ? this.engine.getBlockById(this.ui.state.selectedBlockId) : undefined;
  }

  getBlockProperty(blockId: string, propertyKey: string) {
    const block = this.engine.getBlockById(blockId);

    if (!block) {
      return null;
    }

    return block.properties[propertyKey];
  }

  setBlockProperty(blockId: string, propertyKey: string, propertyValue: any): void {
    return this.engine.setBlockProperty(blockId, propertyKey, propertyValue);
  }

  private setup() {
    registerDefaultHeaderActions(this.ui);
    registerDefaultKeyboardShortcuts(this.ui);
    registerDefaultConfigurationPanels(this.ui);

    this.vueApp = createApp({
      setup: () => {
        provide(CRAFTILE_EDITOR_SYMBOL, this);

        const stopWatching = this.setupEngineWatcher(this.previewUpdateDelay ?? 150);
        onBeforeUnmount(stopWatching);

        return () => h(Editor);
      },
    });

    this.plugins.setupPlugins(this.vueApp);
  }

  private setupEngineWatcher(debounceMs: number) {
    return watchEngineUpdates(this.engine, {
      debounceMs,
      onUpdates: (updates) => {
        // Send updates to preview iframe
        this.preview.sendMessage('craftile.editor.updates', updates);

        // Emit event for plugins
        this.events.emit('updates', updates);
      },
    });
  }

  mount(element: string | HTMLElement): void {
    this.vueApp!.mount(element);
  }
}
