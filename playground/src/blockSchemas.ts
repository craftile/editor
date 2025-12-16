import type { BlockSchema } from '@craftile/types';

export const blockSchemas: BlockSchema[] = [
  {
    type: 'heading',
    properties: [
      { id: 'text', type: 'text', label: 'Heading Text', default: 'Heading' },
      {
        id: 'level',
        type: 'select',
        label: 'Heading Level',
        info: 'Choose the semantic heading level (H1-H6) for better SEO and accessibility',
        default: 'h2',
        variant: 'segment',
        options: [
          { value: 'h1', label: 'H1' },
          { value: 'h2', label: 'H2' },
          { value: 'h3', label: 'H3' },
          { value: 'h4', label: 'H4' },
          { value: 'h5', label: 'H5' },
          { value: 'h6', label: 'H6' },
        ],
      },
      { id: 'color', type: 'color', label: 'Color', default: '#1f2937' },
      {
        id: 'align',
        type: 'select',
        label: 'Alignment',
        default: 'left',
        variant: 'segment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
    ],
    accepts: [],
    meta: {
      name: 'Heading',
      icon: '<svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor"><path d="M6 4v7h5V4h2v16h-2v-7H6v7H4V4h2zm13 14h-3v-1.5l1-.63V9.13l-1-.63V7h3v1.5l-1 .63v6.74l1 .63V18z"/></svg>',
      category: 'Content',
      description: 'Heading block that demonstrates root tag changes (H1-H6)',
      previewImageUrl: 'https://placehold.co/400x240/ffffff/1f2937?text=Heading',
    },
  },
  {
    type: 'text',
    properties: [
      { id: 'content', type: 'text', label: 'Content', default: 'Enter text...' },
      { id: 'booleanField', type: 'boolean', label: 'Boolean field', default: true, variant: 'switch' },
      {
        id: 'fontSize',
        type: 'radio',
        label: 'Font Size',
        default: 'md',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
        ],
      },
      { id: 'rangeField', type: 'range', label: 'Range field', default: 50 },

      { id: 'color', type: 'color', label: 'Color', default: '#000000' },
    ],
    accepts: [],
    meta: {
      name: 'Text',
      icon: '<svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>',
      category: 'Content',
      description: 'Display text content with customizable styling',
      previewImageUrl: 'https://placehold.co/400x240/ffffff/1f2937?text=Text+Block',
    },
  },
  {
    type: 'button',
    properties: [
      { id: 'text', type: 'text', label: 'Button Text', default: 'Click me' },
      { id: 'url', type: 'text', label: 'URL', info: 'Enter the destination URL or use # for placeholder', default: '#' },
      {
        id: 'style',
        type: 'select',
        label: 'Style',
        info: 'Select the visual style of the button',
        default: 'primary',
        variant: 'segment',
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
      icon: '<svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor"><path d="M8 5a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3H8zM6 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8z"/><path d="M8 11a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1z"/></svg>',
      category: 'Interactive',
      description: 'Clickable button with customizable text and styling',
      previewImageUrl: 'https://placehold.co/400x240/3b82f6/ffffff?text=Button',
    },
  },
  {
    type: 'link-card',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Link Card Title' },
      { id: 'description', type: 'text', label: 'Description', default: 'Click to visit this link' },
      { id: 'url', type: 'text', label: 'URL', default: 'https://example.com' },
      { id: 'backgroundColor', type: 'color', label: 'Background', default: '#f9fafb' },
    ],
    accepts: [],
    meta: {
      name: 'Link Card',
      icon: '<svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor"><path d="M13.544 10.456a4.368 4.368 0 00-6.176 0l-3.089 3.088a4.367 4.367 0 106.177 6.177L12 18.177a1 1 0 11-1.414 1.414l-1.544 1.544a6.368 6.368 0 01-9.005-9.005l3.089-3.088a6.367 6.367 0 019.005 0 1 1 0 01-1.415 1.414h.001z"/><path d="M10.456 13.544a4.368 4.368 0 006.176 0l3.089-3.088a4.367 4.367 0 10-6.177-6.177L12 5.823a1 1 0 111.414-1.414l1.544-1.544a6.368 6.368 0 019.005 9.005l-3.089 3.088a6.367 6.367 0 01-9.005 0 1 1 0 011.415-1.414h-.001z"/></svg>',
      category: 'Interactive',
      description: 'Clickable card with link - demonstrates click prevention (first click selects, second click navigates)',
      previewImageUrl: 'https://placehold.co/400x240/6366f1/ffffff?text=Link+Card',
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
      icon: '<svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm16 2v8l-4-4-6 6-2-2-4 4V6h16z"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>',
      category: 'Media',
      description: 'Display images with configurable dimensions',
      previewImageUrl: 'https://placehold.co/400x240/10b981/ffffff?text=Image',
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
        group: 'layout',
      },
      { id: 'gap', type: 'number', label: 'Gap', default: 16, group: 'layout' },
      { id: 'padding', type: 'number', label: 'Padding', default: 16 },
      { id: 'backgroundColor', type: 'color', label: 'Background', default: 'transparent' },
    ],
    accepts: ['*'], // Allow any child blocks
    presets: [
      {
        name: 'Empty Container',
        description: 'A blank container ready for your content',
        previewImageUrl: 'https://placehold.co/400x240/f3f4f6/9ca3af?text=Empty+Container',
      },
      {
        name: 'Heading and Text',
        description: 'Container with a heading and description',
        properties: {
          gap: 12,
          padding: 20,
        },
        previewImageUrl: 'https://placehold.co/400x240/f3f4f6/1f2937?text=Heading+%26+Text',
        children: [
          {
            type: 'text',
            id: 'heading',
            properties: {
              content: '<h2>Section Title</h2>',
              fontSize: 'xl',
            },
          },
          {
            type: 'text',
            id: 'description',
            properties: {
              content: '<p>Add your description here...</p>',
              fontSize: 'md',
            },
          },
        ],
      },
      {
        name: 'Two Column Layout',
        description: 'Horizontal container with two columns',
        properties: {
          direction: 'horizontal',
          gap: 24,
          padding: 20,
        },
        previewImageUrl: 'https://placehold.co/400x240/f3f4f6/3b82f6?text=Two+Columns',
        children: [
          {
            type: 'container',
            id: 'column-1',
            properties: {
              direction: 'vertical',
              gap: 12,
              padding: 16,
              backgroundColor: '#f9fafb',
            },
            children: [
              {
                type: 'text',
                properties: {
                  content: '<h3>Column 1</h3>',
                  fontSize: 'lg',
                },
              },
              {
                type: 'text',
                properties: {
                  content: '<p>Content for first column</p>',
                },
              },
            ],
          },
          {
            type: 'container',
            id: 'column-2',
            properties: {
              direction: 'vertical',
              gap: 12,
              padding: 16,
              backgroundColor: '#f9fafb',
            },
            children: [
              {
                type: 'text',
                properties: {
                  content: '<h3>Column 2</h3>',
                  fontSize: 'lg',
                },
              },
              {
                type: 'text',
                properties: {
                  content: '<p>Content for second column</p>',
                },
              },
            ],
          },
        ],
      },
      {
        name: 'Footer with Static Links',
        description: 'Footer container with static copyright and social links',
        properties: {
          direction: 'vertical',
          gap: 16,
          padding: 24,
          backgroundColor: '#1f2937',
        },
        previewImageUrl: 'https://placehold.co/400x240/1f2937/ffffff?text=Footer',
        children: [
          {
            type: 'text',
            id: 'copyright',
            name: 'Copyright Notice',
            static: true, // Cannot be moved or removed
            properties: {
              content: '<p style="text-align: center;">© 2024 Company Name. All rights reserved.</p>',
              fontSize: 'sm',
              color: '#9ca3af',
            },
          },
          {
            type: 'container',
            id: 'social-links',
            name: 'Social Links',
            properties: {
              direction: 'horizontal',
              gap: 12,
              padding: 0,
              backgroundColor: 'transparent',
            },
            children: [
              {
                type: 'button',
                id: 'twitter-link',
                name: 'Twitter',
                static: true, // Cannot be moved or removed
                properties: {
                  text: 'Twitter',
                  url: 'https://twitter.com',
                  style: 'secondary',
                  size: 'small',
                },
              },
              {
                type: 'button',
                id: 'github-link',
                name: 'GitHub',
                static: true, // Cannot be moved or removed
                properties: {
                  text: 'GitHub',
                  url: 'https://github.com',
                  style: 'secondary',
                  size: 'small',
                },
              },
            ],
          },
        ],
      },
    ],
    meta: {
      name: 'Container',
      icon: '<svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6z"/><path d="M6 8h4v2H6V8zm6 0h6v2h-6V8zm-6 4h6v2H6v-2zm8 0h4v2h-4v-2z"/></svg>',
      category: 'Layout',
      description: 'Flexible container for organizing other blocks',
    },
  },
  {
    type: 'card',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Card Title' },
      { id: 'backgroundColor', type: 'color', label: 'Background', default: '#ffffff' },
      { id: 'borderColor', type: 'color', label: 'Border Color', default: '#e5e7eb' },
    ],
    accepts: ['*'],
    meta: {
      name: 'Card',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v3H4V6zm0 5h16v7H4v-7z"/></svg>',
      category: 'Layout',
      description: 'Card with header, body, and footer - demonstrates nested children comment markers',
      previewImageUrl: 'https://placehold.co/400x240/ffffff/1f2937?text=Card',
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
  {
    type: 'conditional-card',
    properties: [
      { id: 'title', type: 'text', label: 'Card Title', default: 'My Card' },
      {
        id: 'showImage',
        type: 'boolean',
        label: 'Show Image',
        info: 'Toggle to show/hide image fields below',
        default: false,
        variant: 'switch',
      },
      {
        id: 'imageUrl',
        type: 'text',
        label: 'Image URL',
        default: 'https://placehold.co/400x200',
        // Only show when showImage is true
        visibleIf: {
          field: 'showImage',
          operator: 'truthy',
        },
      },
      {
        id: 'imageAlt',
        type: 'text',
        label: 'Image Alt Text',
        default: 'Card image',
        // Only show when showImage is true
        visibleIf: {
          field: 'showImage',
          operator: 'truthy',
        },
      },
      {
        id: 'layout',
        type: 'select',
        label: 'Layout',
        default: 'simple',
        variant: 'segment',
        options: [
          { value: 'simple', label: 'Simple' },
          { value: 'grid', label: 'Grid' },
          { value: 'featured', label: 'Featured' },
        ],
      },
      {
        id: 'columns',
        type: 'number',
        label: 'Columns',
        default: 3,
        // Only show when layout is 'grid'
        visibleIf: {
          field: 'layout',
          operator: 'equals',
          value: 'grid',
        },
      },
      {
        id: 'enableLink',
        type: 'boolean',
        label: 'Enable Link',
        default: false,
        variant: 'switch',
      },
      {
        id: 'linkUrl',
        type: 'text',
        label: 'Link URL',
        default: '#',
        // Only show when enableLink is true
        visibleIf: {
          field: 'enableLink',
          operator: 'truthy',
        },
      },
      {
        id: 'linkTarget',
        type: 'select',
        label: 'Link Target',
        default: '_self',
        options: [
          { value: '_self', label: 'Same Window' },
          { value: '_blank', label: 'New Window' },
        ],
        // Only show when enableLink is true
        visibleIf: {
          field: 'enableLink',
          operator: 'truthy',
        },
      },
      {
        id: 'highlightColor',
        type: 'color',
        label: 'Highlight Color',
        default: '#3b82f6',
        // Show when layout is 'featured' OR showImage is true
        visibleIf: {
          or: [
            { field: 'layout', operator: 'equals', value: 'featured' },
            { field: 'showImage', operator: 'truthy' },
          ],
        },
      },
      {
        id: 'advancedOptions',
        type: 'boolean',
        label: 'Show Advanced Options',
        default: false,
        variant: 'switch',
      },
      {
        id: 'borderRadius',
        type: 'number',
        label: 'Border Radius (px)',
        default: 8,
        // Only show when advancedOptions is true AND layout is not 'simple'
        visibleIf: {
          and: [
            { field: 'advancedOptions', operator: 'truthy' },
            { field: 'layout', operator: 'not_equals', value: 'simple' },
          ],
        },
      },
      {
        id: 'shadowIntensity',
        type: 'select',
        label: 'Shadow Intensity',
        default: 'medium',
        options: [
          { value: 'none', label: 'None' },
          { value: 'light', label: 'Light' },
          { value: 'medium', label: 'Medium' },
          { value: 'strong', label: 'Strong' },
        ],
        // Only show when advancedOptions is true
        visibleIf: {
          field: 'advancedOptions',
          operator: 'truthy',
        },
      },
    ],
    accepts: [],
    meta: {
      name: 'Conditional Card',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14z"/><path d="M7 10h4v4H7z"/><path d="M14 7h3v2h-3zm0 4h3v2h-3zm0 4h3v2h-3z"/></svg>',
      category: 'Testing',
      description: 'Card block demonstrating conditional field visibility based on property values',
      previewImageUrl: 'https://placehold.co/400x240/8b5cf6/ffffff?text=Conditional+Card',
    },
  },
  // Responsive properties demo
  {
    type: 'responsive-hero',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Responsive Hero' },
      {
        id: 'fontSize',
        type: 'select',
        label: 'Font Size',
        info: 'Set different font sizes for each device breakpoint',
        responsive: true, // Enable responsive mode
        default: '3xl',
        options: [
          { value: 'xl', label: 'XL' },
          { value: '2xl', label: '2XL' },
          { value: '3xl', label: '3XL' },
          { value: '4xl', label: '4XL' },
          { value: '5xl', label: '5XL' },
        ],
      },
      {
        id: 'padding',
        type: 'number',
        label: 'Padding (px)',
        info: 'Adjust padding for each device size independently',
        responsive: true, // Enable responsive mode
        default: 40,
        min: 0,
        max: 100,
      },
      {
        id: 'textAlign',
        type: 'select',
        label: 'Text Alignment',
        responsive: true, // Enable responsive mode
        default: 'center',
        variant: 'segment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
      },
      { id: 'backgroundColor', type: 'color', label: 'Background', default: '#3b82f6' },
      {
        id: 'subtitle',
        type: 'text',
        label: 'Subtitle',
        default: 'This field is visible when font size is 4xl or 5xl',
        info: 'Only visible when fontSize is 4xl or 5xl (check current viewport)',
        // This field will only appear when fontSize is 4xl or 5xl for the current device
        visibleIf: {
          field: 'fontSize',
          operator: 'in',
          value: ['4xl', '5xl'],
        },
      },
    ],
    accepts: [],
    meta: {
      name: 'Responsive Hero',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>',
      category: 'Testing',
      description: 'Hero block demonstrating responsive properties with device-specific values and viewport-aware conditional visibility',
      previewImageUrl: 'https://placehold.co/400x240/3b82f6/ffffff?text=Responsive+Hero',
    },
  },
  // Private blocks demo - Accordion
  {
    type: 'accordion',
    properties: [
      { id: 'backgroundColor', type: 'color', label: 'Background', default: '#ffffff' },
      { id: 'borderColor', type: 'color', label: 'Border Color', default: '#e5e7eb' },
      { id: 'allowMultiple', type: 'boolean', label: 'Allow Multiple Open', default: false },
    ],
    accepts: ['accordion-row'],
    presets: [
      {
        name: 'Repeated Rows Accordion',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 10h10v2H7zm0-3h10v2H7zm0 6h10v2H7z"/></svg>',
        category: 'Interactive',
        description: 'Accordion with repeated rows (demonstrates repeated block icon)',
        previewImageUrl: 'https://placehold.co/400x240/ffffff/1f2937?text=Accordion',
        children: [
          {
            type: 'accordion-row',
            id: 'row-1',
            repeated: true,
            properties: {
              title: 'Repeated Row 1',
              isOpen: true,
            },
            children: [
              {
                type: 'text',
                id: 'text-1',
                properties: {
                  content: '<p>This row is marked as repeated. Notice the loop icon in the layers panel.</p>',
                },
              },
            ],
          },
          {
            type: 'accordion-row',
            id: 'row-2',
            repeated: true,
            properties: {
              title: 'Repeated Row 2',
              isOpen: false,
            },
            children: [
              {
                type: 'text',
                id: 'text-2',
                properties: {
                  content: '<p>This is another repeated row with loop icon.</p>',
                },
              },
            ],
          },
          {
            type: 'accordion-row',
            id: 'row-3',
            repeated: true,
            properties: {
              title: 'Repeated Row 3',
              isOpen: false,
            },
            children: [
              {
                type: 'text',
                id: 'text-3',
                properties: {
                  content: '<p>All accordion rows in this example are marked as repeated.</p>',
                },
              },
            ],
          },
        ],
      },
      {
        name: 'Basic Accordion',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 10h10v2H7zm0-3h10v2H7zm0 6h10v2H7z"/></svg>',
        category: 'Interactive',
        description: 'Accordion with three items',
        previewImageUrl: 'https://placehold.co/400x240/ffffff/1f2937?text=Accordion',
        children: [
          {
            type: 'accordion-row',
            properties: {
              title: 'Section 1',
              isOpen: true,
            },
            children: [
              {
                type: 'text',
                properties: {
                  content: '<p>Content for the first section. This is expanded by default.</p>',
                },
              },
            ],
          },
          {
            type: 'accordion-row',
            properties: {
              title: 'Section 2',
              isOpen: false,
            },
            children: [
              {
                type: 'text',
                properties: {
                  content: '<p>Content for the second section.</p>',
                },
              },
            ],
          },
          {
            type: 'accordion-row',
            properties: {
              title: 'Section 3',
              isOpen: false,
            },
            children: [
              {
                type: 'text',
                properties: {
                  content: '<p>Content for the third section.</p>',
                },
              },
            ],
          },
        ],
      },
    ],
    meta: {
      name: 'Accordion',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 10h10v2H7zm0-3h10v2H7zm0 6h10v2H7z"/></svg>',
      category: 'Interactive',
      description: 'Expandable accordion - demonstrates private blocks (accordion-row can only be used here)',
      previewImageUrl: 'https://placehold.co/400x240/ffffff/1f2937?text=Accordion',
    },
  },
  {
    type: 'accordion-row',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Accordion Item' },
      { id: 'isOpen', type: 'boolean', label: 'Open by Default', default: false },
    ],
    accepts: ['*'],
    private: true, // Private: can only be child of accordion
    meta: {
      name: 'Accordion Row',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4z"/></svg>',
      category: 'Interactive',
      description: 'Accordion row (private - only for use in accordion)',
    },
  },
  {
    type: 'collection-list',
    properties: [
      { id: 'gap', type: 'number', label: 'Gap', default: 16 },
    ],
    accepts: ['collection-item', 'collection-card'],
    presets: [
      {
        name: 'Product Collection',
        description: 'Collection list with ghost data items and a repeated card',
        properties: { gap: 20 },
        children: [
          {
            type: 'collection-item',
            ghost: true,
            properties: {
              title: 'Product 1',
              description: 'Description for product 1',
              price: '$29.99',
              image: 'https://placehold.co/300x200/6366f1/white?text=Product+1',
            },
          },
          {
            type: 'collection-item',
            ghost: true,
            properties: {
              title: 'Product 2',
              description: 'Description for product 2',
              price: '$39.99',
              image: 'https://placehold.co/300x200/8b5cf6/white?text=Product+2',
            },
          },
          {
            type: 'collection-item',
            ghost: true,
            properties: {
              title: 'Product 3',
              description: 'Description for product 3',
              price: '$49.99',
              image: 'https://placehold.co/300x200/ec4899/white?text=Product+3',
            },
          },
          {
            type: 'collection-card',
            repeated: true,
            properties: {},
          },
        ],
      },
    ],
    meta: {
      name: 'Collection List',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>',
      category: 'Collections',
      description: 'Collection list - demonstrates ghost blocks as data holders',
    },
  },
  {
    type: 'collection-item',
    properties: [
      { id: 'title', type: 'text', label: 'Title', default: 'Item Title' },
      { id: 'description', type: 'text', label: 'Description', default: 'Item description' },
      { id: 'price', type: 'text', label: 'Price', default: '$0.00' },
      { id: 'image', type: 'text', label: 'Image URL', default: 'https://placehold.co/300x200' },
    ],
    accepts: [],
    private: true,
    meta: {
      name: 'Collection Item',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>',
      category: 'Collections',
      description: 'Collection item (ghost block - holds data, not rendered)',
    },
  },
  {
    type: 'collection-card',
    properties: [],
    accepts: [],
    private: true,
    meta: {
      name: 'Collection Card',
      icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>',
      category: 'Collections',
      description: 'Collection card (repeated block that displays collection item data)',
    },
  },
];
