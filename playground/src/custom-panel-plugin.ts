import type { CraftileEditorPlugin } from '@craftile/editor';
import { PropertyField } from '@craftile/editor/ui';
import { defineComponent, h, ref } from 'vue';

/**
 * Example plugin demonstrating how to use the PropertyField component.
 *
 * This shows how PropertyField can be used to render individual property fields
 * in custom panels, allowing plugins to create their own UI for editing block properties.
 */

const CustomPanel = defineComponent({
  name: 'CustomPanel',
  setup() {
    // Example: Create a standalone text property field
    const exampleField = {
      id: 'example-text',
      type: 'text',
      label: 'Example Text Field',
      placeholder: 'Type something...',
    };

    const exampleValue = ref('Hello from PropertyField!');

    return () =>
      h('div', { class: 'p-4' }, [
        h(
          'p',
          { class: 'text-sm text-gray-600 mb-4' },
          'This demonstrates the PropertyField component exported from @craftile/editor/ui'
        ),

        h(PropertyField, {
          field: exampleField,
          modelValue: exampleValue.value,
          'onUpdate:modelValue': (newValue: any) => {
            exampleValue.value = newValue;
            console.log('Value changed:', newValue);
          },
        }),
      ]);
  },
});

const CustomPanelPlugin: CraftileEditorPlugin = ({ editor }) => {
  editor.ui.registerSidebarPanel({
    id: 'custom-panel-example',
    title: 'PropertyField Example',
    order: 100,
    render: CustomPanel,
  });
};

export default CustomPanelPlugin;
