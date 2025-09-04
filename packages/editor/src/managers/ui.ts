import type { SidebarPanel } from './../types/ui';

export interface UIState {
  activeSidebarPanel: string;
  sidebarPanels: SidebarPanel[];

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
      layersPanel: {
        expandedBlocks: new Set<string>(),
      },
    });
  }

  private generateId(prefix: string): string {
    return prefix + '-' + (Date.now().toString(36) + Math.random().toString(36).substr(2));
  }

  addSidebarPanel(config: SidebarPanel): void {
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
}
