import type { CraftileEditorPlugin } from '@craftile/editor';
import Text from './fields/Text.vue';
import Textarea from './fields/Textarea.vue';
import Boolean from './fields/Boolean.vue';
import Select from './fields/Select.vue';
import Radio from './fields/Radio.vue';
import './style.css';
import Range from './fields/Range.vue';
import Color from './fields/Color.vue';
import Number from './fields/Number.vue';

const CommonPropertiesPlugin: CraftileEditorPlugin = ({ editor }) => {
  const fields = {
    text: Text,
    textarea: Textarea,
    boolean: Boolean,
    select: Select,
    radio: Radio,
    range: Range,
    color: Color,
    number: Number,
  };

  for (const [type, render] of Object.entries(fields)) {
    editor.ui.registerPropertyField({ type, render });
  }
};

export default CommonPropertiesPlugin;

// Export individual field components
export { Text, Textarea, Boolean, Select, Radio, Range, Color, Number };
