import type { BlockSchema } from '@craftile/types';

export const blockSchemas: BlockSchema[] = [
  {
    type: 'text',
    properties: [
      { id: 'content', type: 'text', label: 'Content', default: 'Enter text...' },
      {
        id: 'fontSize',
        type: 'select',
        label: 'Font Size',
        default: 'md',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ],
      },
      { id: 'color', type: 'color', label: 'Color', default: '#000000' },
    ],
    accepts: [],
    meta: {
      name: 'Text',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>',
      category: 'Content',
      description: 'Display text content with customizable styling',
    },
  },
  {
    type: 'button',
    properties: [
      { id: 'text', type: 'text', label: 'Button Text', default: 'Click me' },
      { id: 'url', type: 'text', label: 'URL', default: '#' },
      {
        id: 'style',
        type: 'select',
        label: 'Style',
        default: 'primary',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' },
        ],
      },
      {
        id: 'size',
        type: 'select',
        label: 'Size',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
    ],
    accepts: [],
    meta: {
      name: 'Button',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3H8zM6 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8z"/><path d="M8 11a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1z"/></svg>',
      category: 'Interactive',
      description: 'Clickable button with customizable text and styling',
    },
  },
  {
    type: 'image',
    properties: [
      { id: 'src', type: 'text', label: 'Image URL', default: 'https://placehold.co/300x200' },
      { id: 'alt', type: 'text', label: 'Alt Text', default: 'Image' },
      { id: 'width', type: 'number', label: 'Width', default: 300 },
      { id: 'height', type: 'number', label: 'Height', default: 200 },
    ],
    accepts: [],
    meta: {
      name: 'Image',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm16 2v8l-4-4-6 6-2-2-4 4V6h16z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>',
      category: 'Media',
      description: 'Display images with configurable dimensions',
    },
  },
  {
    type: 'container',
    properties: [
      {
        id: 'direction',
        type: 'select',
        label: 'Direction',
        default: 'vertical',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ],
      },
      { id: 'gap', type: 'number', label: 'Gap', default: 16 },
      { id: 'padding', type: 'number', label: 'Padding', default: 16 },
      { id: 'backgroundColor', type: 'color', label: 'Background', default: 'transparent' },
    ],
    accepts: ['*'], // Allow any child blocks
    meta: {
      name: 'Container',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6z"/><path d="M6 8h4v2H6V8zm6 0h6v2h-6V8zm-6 4h6v2H6v-2zm8 0h4v2h-4v-2z"/></svg>',
      category: 'Layout',
      description: 'Flexible container for organizing other blocks',
    },
  },
  {
    type: 'card',
    properties: [
      { id: 'title', type: 'text', label: 'Card Title', default: 'Card Title' },
      { id: 'padding', type: 'number', label: 'Padding', default: 20 },
      { id: 'backgroundColor', type: 'color', label: 'Background', default: '#ffffff' },
      { id: 'borderRadius', type: 'number', label: 'Border Radius', default: 8 },
    ],
    accepts: ['text', 'button'], // Only allow text and button blocks
    meta: {
      name: 'Card',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6z"/><rect x="6" y="8" width="12" height="2" rx="1"/><rect x="6" y="12" width="8" height="2" rx="1"/></svg>',
      category: 'Layout',
      description: 'Card container that only accepts text and button blocks',
    },
  },
  // Custom field demos
  {
    type: 'slider-demo',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Slider Demo' },
      {
        id: 'opacity',
        type: 'custom-slider',
        label: 'Opacity',
        default: 80,
        min: 0,
        max: 100,
        step: 5,
      },
      {
        id: 'scale',
        type: 'custom-slider',
        label: 'Scale',
        default: 1,
        min: 0.5,
        max: 2,
        step: 0.1,
      },
      { id: 'backgroundColor', type: 'color-picker', label: 'Background Color', default: '#f3f4f6' },
    ],
    accepts: [],
    meta: {
      name: 'Slider Demo',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>',
      category: 'Custom Fields',
      description: 'Demonstrates custom slider property fields',
    },
  },
  {
    type: 'toggle-demo',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Toggle Demo' },
      { id: 'isVisible', type: 'toggle', label: 'Visible', default: true },
      { id: 'isAnimated', type: 'toggle', label: 'Animated', default: false },
      { id: 'isHighlighted', type: 'toggle', label: 'Highlighted', default: false },
      {
        id: 'content',
        type: 'textarea',
        label: 'Content',
        default: 'This content visibility is controlled by the toggle above.',
      },
    ],
    accepts: [],
    meta: {
      name: 'Toggle Demo',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zM7 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>',
      category: 'Custom Fields',
      description: 'Demonstrates custom toggle property fields',
    },
  },
  {
    type: 'color-demo',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Color Demo' },
      { id: 'primaryColor', type: 'color-picker', label: 'Primary Color', default: '#3b82f6' },
      { id: 'accentColor', type: 'color-picker', label: 'Accent Color', default: '#10b981' },
      { id: 'textColor', type: 'color-picker', label: 'Text Color', default: '#1f2937' },
      { id: 'borderColor', type: 'color-picker', label: 'Border Color', default: '#e5e7eb' },
    ],
    accepts: [],
    meta: {
      name: 'Color Demo',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/><circle cx="6.5" cy="11.5" r="1.5"/><circle cx="9.5" cy="7.5" r="1.5"/><circle cx="14.5" cy="7.5" r="1.5"/><circle cx="17.5" cy="11.5" r="1.5"/></svg>',
      category: 'Custom Fields',
      description: 'Demonstrates custom color picker property fields',
    },
  },
  {
    type: 'spacing-demo',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Spacing Demo' },
      {
        id: 'padding',
        type: 'spacing',
        label: 'Padding',
        default: { top: 16, right: 20, bottom: 16, left: 20 },
      },
      {
        id: 'margin',
        type: 'spacing',
        label: 'Margin',
        default: { top: 8, right: 12, bottom: 8, left: 12 },
      },
      { id: 'backgroundColor', type: 'color-picker', label: 'Background Color', default: '#f9fafb' },
      { id: 'borderColor', type: 'color-picker', label: 'Border Color', default: '#d1d5db' },
    ],
    accepts: ['text'], // Allow text blocks inside
    meta: {
      name: 'Spacing Demo',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/><path d="M11 7h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/><path d="M7 11h2v2H7v-2zm8 0h2v2h-2v-2z"/></svg>',
      category: 'Custom Fields',
      description: 'Demonstrates custom spacing property fields with multiple inputs',
    },
  },
  {
    type: 'mixed-demo',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Mixed Field Demo' },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        default: 'This block uses both standard and custom property fields.',
      },
      {
        id: 'size',
        type: 'select',
        label: 'Size',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
        ],
      },
      { id: 'width', type: 'number', label: 'Width (px)', default: 300 },
      { id: 'isEnabled', type: 'toggle', label: 'Enabled', default: true },
      {
        id: 'intensity',
        type: 'custom-slider',
        label: 'Intensity',
        default: 50,
        min: 0,
        max: 100,
        step: 10,
      },
      { id: 'themeColor', type: 'color-picker', label: 'Theme Color', default: '#6366f1' },
      {
        id: 'spacing',
        type: 'spacing',
        label: 'Inner Spacing',
        default: { top: 12, right: 16, bottom: 12, left: 16 },
      },
    ],
    accepts: [],
    meta: {
      name: 'Mixed Demo',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      category: 'Custom Fields',
      description: 'Demonstrates mixing standard and custom property field types',
    },
  },
  // Property grouping demonstration
  {
    type: 'grouped-text',
    properties: [
      // Content group
      {
        id: 'content',
        type: 'textarea',
        label: 'Text Content',
        default: 'Enter your text here...',
        group: 'content',
      },
      {
        id: 'placeholder',
        type: 'text',
        label: 'Placeholder',
        default: 'Type here...',
        group: 'content',
      },

      // Styling group
      {
        id: 'fontSize',
        type: 'select',
        label: 'Font Size',
        default: 'md',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ],
        group: 'styling',
      },
      {
        id: 'color',
        type: 'color',
        label: 'Text Color',
        default: '#000000',
        group: 'styling',
      },
      {
        id: 'backgroundColor',
        type: 'color',
        label: 'Background Color',
        default: '#ffffff',
        group: 'styling',
      },

      // Layout group
      {
        id: 'padding',
        type: 'number',
        label: 'Padding',
        default: 12,
        group: 'layout',
      },
      {
        id: 'margin',
        type: 'number',
        label: 'Margin',
        default: 8,
        group: 'layout',
      },
      {
        id: 'borderRadius',
        type: 'number',
        label: 'Border Radius',
        default: 4,
        group: 'layout',
      },

      // Advanced group
      {
        id: 'customClass',
        type: 'text',
        label: 'CSS Class',
        default: '',
        group: 'advanced',
      },
      {
        id: 'isHighlighted',
        type: 'boolean',
        label: 'Highlighted',
        default: false,
        group: 'advanced',
      },

      // Ungrouped property (should appear in default group)
      {
        id: 'id',
        type: 'text',
        label: 'Element ID',
        default: '',
      },
    ],
    accepts: [],
    meta: {
      name: 'Grouped Text',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>',
      category: 'Testing',
      description: 'Text block with grouped properties to test the grouping feature',
    },
  },
];
