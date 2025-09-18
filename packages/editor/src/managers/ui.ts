import { createToaster } from '@ark-ui/vue/toast';
import type { EventBus } from '@craftile/event-bus';
import type { ConfigurationPanel, HeaderAction, ModalConfig, PropertyFieldConfig, SidebarPanel } from './../types/ui';

export interface UIState {
  activeSidebarPanel: string;
  sidebarPanels: SidebarPanel[];
  headerActions: HeaderAction[];
  configurationPanels: ConfigurationPanel[];
  modals: ModalConfig[];
  openModals: string[];
  propertyFields: PropertyFieldConfig[];

  selectedBlockId: string | null;
  layersPanel: {
    expandedBlocks: Set<string>;
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
      sidebarPanels: [],
      headerActions: [],
      configurationPanels: [],
      modals: [],
      openModals: [],
      propertyFields: [],

      selectedBlockId: null,
      layersPanel: {
        expandedBlocks: new Set<string>(),
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
    this.state.selectedBlockId = blockId;
    this.events.emit('ui:block:select', { blockId });
  }

  clearSelectedBlock(): void {
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

    const existingIndex = this.state.sidebarPanels.findIndex((panel) => panel.id === finalConfig.id);
    if (existingIndex >= 0) {
      this.state.sidebarPanels[existingIndex] = finalConfig;
    } else {
      this.state.sidebarPanels.push(finalConfig);
    }

    this.state.sidebarPanels.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  removeSidebarPanel(panelId: string): void {
    const index = this.state.sidebarPanels.findIndex((panel) => panel.id === panelId);
    if (index >= 0) {
      this.state.sidebarPanels.splice(index, 1);
    }
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

    const existingIndex = this.state.headerActions.findIndex((action) => action.id === finalConfig.id);

    if (existingIndex >= 0) {
      this.state.headerActions[existingIndex] = finalConfig;
    } else {
      this.state.headerActions.push(finalConfig);
    }

    this.state.headerActions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  removeHeaderAction(actionId: string): void {
    const index = this.state.headerActions.findIndex((action) => action.id === actionId);
    if (index >= 0) {
      this.state.headerActions.splice(index, 1);
    }
  }

  registerConfigurationPanel(config: ConfigurationPanel): void {
    const finalConfig = {
      ...config,
      id: config.id || this.generateId('config-panel'),
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
      icon: config.icon && typeof config.icon === 'object' ? markRaw(config.icon) : config.icon,
    };

    const existingIndex = this.state.configurationPanels.findIndex((panel) => panel.id === config.id);
    if (existingIndex >= 0) {
      this.state.configurationPanels[existingIndex] = finalConfig;
    } else {
      this.state.configurationPanels.push(finalConfig);
    }

    this.state.configurationPanels.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  removeConfigurationPanel(panelId: string): void {
    const index = this.state.configurationPanels.findIndex((panel) => panel.id === panelId);
    if (index >= 0) {
      this.state.configurationPanels.splice(index, 1);
    }
  }

  registerPropertyField(config: PropertyFieldConfig): void {
    const finalConfig = {
      ...config,
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
    };

    const existingIndex = this.state.propertyFields.findIndex((field) => field.type === config.type);
    if (existingIndex >= 0) {
      this.state.propertyFields[existingIndex] = finalConfig;
    } else {
      this.state.propertyFields.push(finalConfig);
    }
  }

  registerModal(config: ModalConfig): void {
    const finalConfig = {
      ...config,
      id: config.id || this.generateId('modal'),
      render: typeof config.render === 'object' ? markRaw(config.render) : config.render,
    };

    const existingIndex = this.state.modals.findIndex((modal) => modal.id === finalConfig.id);
    if (existingIndex >= 0) {
      this.state.modals[existingIndex] = finalConfig;
    } else {
      this.state.modals.push(finalConfig);
    }
  }

  unregisterModal(id: string): void {
    const index = this.state.modals.findIndex((modal) => modal.id === id);

    if (index >= 0) {
      this.state.modals.splice(index, 1);
    }

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
}
