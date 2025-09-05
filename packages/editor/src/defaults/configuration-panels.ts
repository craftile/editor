import type { UIManager } from '../managers/ui';
import PropertiesPanel from '../components/PropertiesPanel.vue';

export function registerDefaultConfigurationPanels(ui: UIManager) {
  ui.registerConfigurationPanel({
    id: 'properties',
    title: 'Properties',
    render: PropertiesPanel,
    order: -10,
  });
}
