import { createToaster } from '@ark-ui/vue/toast';
import type { EventBus } from '@craftile/event-bus';
import type { BlockStructure } from '@craftile/types';
import type {
  ConfigurationPanel,
  HeaderAction,
  KeyboardShortcut,
  ModalConfig,
  PropertyFieldConfig,
  SidebarPanel,
} from './../types/ui';

export interface UIState {
  activeSidebarPanel: string;
  sidebarPanels: Map<string, SidebarPanel>;
  headerActions: Map<string, HeaderAction>;
  configurationPanels: Map<string, ConfigurationPanel>;
  modals: Map<string, ModalConfig>;
  openModals: string[];
  keyboardShortcuts: Map<string, KeyboardShortcut>;
  propertyFields: Map<string, PropertyFieldConfig>;

  selectedBlockId: string | null;
  layersPanel: {
    expandedBlocks: Set<string>;
  };
  clipboard: {
    copiedBlock: BlockStructure | null;
  };
}

export class UIManager {
  private events: EventBus;
  public readonly state: UIState;
  public readonly toaster: ReturnType<typeof createToaster>;

  constructor(events: EventBus) {
    this.events = events;
    this.state = reactive({
      activeSidebarPanel: 'layers',
      sidebarPanels: new Map(),
      headerActions: new Map(),
      configurationPanels: new Map(),
      modals: new Map(),
      openModals: [],
      keyboardShortcuts: new Map(),
      propertyFields: new Map(),

      selectedBlockId: null,
      layersPanel: {
        expandedBlocks: new Set<string>(),
      },
      clipboard: {
        copiedBlock: null,
      },
    });

    this.toaster = createToaster({
      placement: 'bottom',
      overlap: true,
      gap: 16,
    });
  }

  private generateId(prefix: string): string {
    return prefix + '-' + (Date.now().toString(36) + Math.random().toString(36).substr(2));
  }

  setSelectedBlock(blockId: string | null): void {
    const previousBlockId = this.state.selectedBlockId;
    this.state.selectedBlockId = blockId;

    if (blockId !== null && blockId !== previousBlockId) {
      this.events.emit('ui:block:select', { blockId });
    }
  }

  clearSelectedBlock(): void {
    if (!this.state.selectedBlockId) {
      return;
    }

    this.state.selectedBlockId = null;
    this.events.emit('ui:block:clear-selection', { blockId: null });
  }

  toast(titleOrOptions: string | Parameters<typeof this.toaster.create>[0]) {
    if (typeof titleOrOptions === 'string') {
      this.toaster.create({ description: titleOrOptions, type: 'info' });
    } else {
      this.toaster.create(titleOrOptions);
    }
  }

  registerSidebarPanel(config: SidebarPanel): void {
    const finalConfig = {
      ...config,
      id: config.id || this.generateId('sidebar-panel'),
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
      icon: config.icon && typeof config.icon === 'object' ? markRaw(config.icon) : config.icon,
    };

    this.state.sidebarPanels.set(finalConfig.id, finalConfig);
  }

  removeSidebarPanel(panelId: string): void {
    this.state.sidebarPanels.delete(panelId);
  }

  registerHeaderAction(config: HeaderAction): void {
    if (!config.render && !config.button) {
      throw new Error('HeaderAction must have either a render or button configuration');
    }

    if (config.render && config.button) {
      throw new Error('HeaderAction cannot have both render and button configurations');
    }

    const finalConfig = {
      ...config,
      id: config.id || this.generateId('header-action'),
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
    };

    this.state.headerActions.set(finalConfig.id, finalConfig);
  }

  removeHeaderAction(actionId: string): void {
    this.state.headerActions.delete(actionId);
  }

  registerConfigurationPanel(config: ConfigurationPanel): void {
    const finalConfig = {
      ...config,
      id: config.id || this.generateId('config-panel'),
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
      icon: config.icon && typeof config.icon === 'object' ? markRaw(config.icon) : config.icon,
    };

    this.state.configurationPanels.set(finalConfig.id, finalConfig);
  }

  removeConfigurationPanel(panelId: string): void {
    this.state.configurationPanels.delete(panelId);
  }

  registerPropertyField(config: PropertyFieldConfig): void {
    const finalConfig = {
      ...config,
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
    };

    this.state.propertyFields.set(config.type, finalConfig);
  }

  removePropertyField(type: string): void {
    this.state.propertyFields.delete(type);
  }

  registerModal(config: ModalConfig): void {
    const finalConfig = {
      ...config,
      id: config.id || this.generateId('modal'),
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
    };

    this.state.modals.set(finalConfig.id, finalConfig);
  }

  unregisterModal(id: string): void {
    this.state.modals.delete(id);
    this.closeModal(id);
  }

  openModal(id: string): void {
    if (!this.state.openModals.includes(id)) {
      this.state.openModals.push(id);
      this.events.emit('ui:modal:open', { modalId: id });
    }
  }

  closeModal(id: string): void {
    const index = this.state.openModals.indexOf(id);
    if (index >= 0) {
      this.state.openModals.splice(index, 1);
      this.events.emit('ui:modal:close', { modalId: id });
    }
  }

  registerKeyboardShortcut(config: KeyboardShortcut): void {
    this.state.keyboardShortcuts.set(config.key, config);
  }

  removeKeyboardShortcut(key: string): void {
    this.state.keyboardShortcuts.delete(key);
  }

  copyBlock(block: BlockStructure): void {
    this.state.clipboard.copiedBlock = block;
    this.events.emit('ui:clipboard:copy', { block });
  }

  getCopiedBlock(): BlockStructure | null {
    return this.state.clipboard.copiedBlock;
  }

  clearClipboard(): void {
    this.state.clipboard.copiedBlock = null;
    this.events.emit('ui:clipboard:clear', {});
  }
}
