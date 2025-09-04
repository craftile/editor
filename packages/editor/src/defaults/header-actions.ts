import BackButton from '../components/header/BackButton.vue';
import RedoButton from '../components/header/RedoButton.vue';
import Title from '../components/header/Title.vue';
import UndoButton from '../components/header/UndoButton.vue';
import type { UIManager } from '../managers/ui';

export function registerDefaultHeaderActions(ui: UIManager) {
  ui.registerHeaderAction({
    id: 'back-button',
    slot: 'left',
    render: BackButton,
    order: -20,
  });

  ui.registerHeaderAction({
    id: 'title',
    slot: 'left',
    render: Title,
    order: -10,
  });

  ui.registerHeaderAction({
    id: 'undo',
    slot: 'right',
    render: UndoButton,
    order: -20,
  });

  ui.registerHeaderAction({
    id: 'redo',
    slot: 'right',
    render: RedoButton,
    order: -10,
  });
}
