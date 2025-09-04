import type { HeaderAction, SidebarPanel } from './../types/ui';

export interface UIState {
  activeSidebarPanel: string;
  sidebarPanels: SidebarPanel[];

  headerActions: HeaderAction[];

  layersPanel: {
    expandedBlocks: Set<string>;
  };
}

export class UIManager {
  public readonly state: UIState;

  constructor() {
    this.state = reactive({
      activeSidebarPanel: 'layers',
      sidebarPanels: [],

      headerActions: [],

      layersPanel: {
        expandedBlocks: new Set<string>(),
      },
    });
  }

  private generateId(prefix: string): string {
    return prefix + '-' + (Date.now().toString(36) + Math.random().toString(36).substr(2));
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
}
