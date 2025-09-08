import type { CraftileEditorPlugin } from '@craftile/editor';
import Text from './fields/Text.vue';

const CommonPropertiesPlugin: CraftileEditorPlugin = ({ editor }) => {
  editor.ui.registerPropertyField({
    type: 'text',
    render: Text,
  });
};

export default CommonPropertiesPlugin;
