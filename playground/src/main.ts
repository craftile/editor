import { createCraftileEditor, type UiRenderFunctionContext } from '@craftile/editor';
import CommonPropertiesPlugin from '@craftile/plugin-common-properties';
import StaticBlocksRenderer from '@craftile/plugin-static-blocks-renderer';
import type { BlockStructure } from '@craftile/types';
import CustomPanelPlugin from './custom-panel-plugin';
import { blockSchemas } from './blockSchemas';
import { blockRenderers } from './blockRenderers';

const editor = createCraftileEditor({
  el: '#app',
  blockSchemas,
  devices: {
    presets: [
      { id: 'mobile', label: 'Mobile', width: 375, icon: 'mobile' },
      { id: 'tablet', label: 'Tablet', width: 768, icon: 'tablet' },
      { id: 'desktop', label: 'Desktop', width: 1024, icon: 'desktop' },
    ],
  },
  plugins: [
    CommonPropertiesPlugin,
    StaticBlocksRenderer({ blockRenderers, scripts: ['https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'] }),
    CustomPanelPlugin,
  ],
  // Custom block label function to show block label from properties
  blockLabelFunction: (block) => {
    // For text blocks, show the content as label
    if (block.type === 'text' && block.properties?.content) {
      const content = String(block.properties.content);
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    }

    // For buttons, show the button text as label
    if (block.type === 'button' && block.properties?.text) {
      return String(block.properties.text);
    }

    // For images, show the alt text as label
    if (block.type === 'image' && block.properties?.alt) {
      return String(block.properties.alt);
    }

    // Return empty string to show only schema name
    return '';
  },
  initialPage: {
    blocks: {
      // Header region blocks
      'header-container': {
        id: 'header-container',
        type: 'container',
        properties: {
          direction: 'horizontal',
          gap: 32,
          padding: 16,
          backgroundColor: '#ffffff',
        },
        children: ['site-title', 'nav-home', 'nav-about', 'nav-contact'],
      },
      'site-title': {
        id: 'site-title',
        type: 'text',
        properties: {
          content: 'Craftile Editor',
          fontSize: 'xl',
          color: '#1f2937',
        },
        children: [],
      },
      'nav-home': {
        id: 'nav-home',
        type: 'button',
        properties: {
          text: 'Home',
          url: '#home',
          style: 'secondary',
          size: 'medium',
        },
        children: [],
      },
      'nav-about': {
        id: 'nav-about',
        type: 'button',
        properties: {
          text: 'About',
          url: '#about',
          style: 'secondary',
          size: 'medium',
        },
        children: [],
      },
      'nav-contact': {
        id: 'nav-contact',
        type: 'button',
        properties: {
          text: 'Contact',
          url: '#contact',
          style: 'secondary',
          size: 'medium',
        },
        children: [],
      },

      // Main region blocks
      'main-container': {
        id: 'main-container',
        type: 'container',
        properties: {
          direction: 'vertical',
          gap: 24,
          padding: 40,
          backgroundColor: '#f8f9fa',
        },
        children: ['welcome-text', 'responsive-hero-demo', 'grouped-demo-block', 'cta-button', 'content-section'],
      },
      'welcome-text': {
        id: 'welcome-text',
        type: 'text',
        properties: {
          content: 'Welcome to Craftile Editor!',
          fontSize: 'lg',
          color: '#1f2937',
          booleanField: true,
          rangeField: 50,
        },
        children: [],
      },
      'responsive-hero-demo': {
        id: 'responsive-hero-demo',
        type: 'responsive-hero',
        properties: {
          title: 'Responsive Design Demo',
          fontSize: {
            _default: '3xl',
            tablet: '2xl',
            mobile: 'xl',
          },
          padding: {
            _default: 40,
            tablet: 30,
            mobile: 20,
          },
          borderRadius: {
            _default: 8,
            tablet: 12,
            mobile: 16,
          },
          textAlign: 'center',
          backgroundColor: '#3b82f6',
        },
        children: [],
      },
      'grouped-demo-block': {
        id: 'grouped-demo-block',
        type: 'grouped-text',
        properties: {
          // Content group properties
          content:
            'This block demonstrates property grouping! 🎉\n\nClick on this block to see how properties are organized into collapsible groups in the properties panel.',
          placeholder: 'Enter your message here...',

          // Styling group properties
          fontSize: {
            _default: 'lg',
            tablet: 'md',
            mobile: 'sm',
          },
          color: '#1f2937',
          backgroundColor: '#e0f2fe',

          // Layout group properties
          padding: 20,
          margin: 12,
          borderRadius: 8,

          // Advanced group properties
          customClass: 'demo-block',
          isHighlighted: true,

          // Ungrouped property (will appear in default "Properties" group)
          id: 'grouped-properties-demo',
        },
        children: [],
      },
      'cta-button': {
        id: 'cta-button',
        type: 'button',
        properties: {
          text: 'Get Started',
          url: 'https://example.com',
          style: 'primary',
          size: 'large',
        },
        children: [],
      },
      'content-section': {
        id: 'content-section',
        type: 'container',
        properties: {
          direction: 'horizontal',
          gap: 24,
          padding: 20,
          backgroundColor: '#ffffff',
        },
        children: ['description-text', 'feature-image'],
      },
      'description-text': {
        id: 'description-text',
        type: 'text',
        properties: {
          content:
            'Build amazing pages with our intuitive block-based editor. Drag, drop, and customize blocks to create beautiful layouts.',
          fontSize: 'md',
          color: '#6b7280',
        },
        children: [],
      },
      'feature-image': {
        id: 'feature-image',
        type: 'image',
        properties: {
          src: 'https://placehold.co/300x200/4f46e5/ffffff?text=Editor+Preview',
          alt: 'Editor preview',
          width: 300,
          height: 200,
        },
        children: [],
      },

      // Footer region blocks
      'footer-container': {
        id: 'footer-container',
        type: 'container',
        properties: {
          direction: 'horizontal',
          gap: 24,
          padding: 20,
          backgroundColor: '#1f2937',
        },
        children: ['copyright-text', 'social-twitter', 'social-github', 'social-linkedin'],
      },
      'copyright-text': {
        id: 'copyright-text',
        type: 'text',
        properties: {
          content: '© 2024 Craftile Editor. All rights reserved.',
          fontSize: 'sm',
          color: '#9ca3af',
        },
        children: [],
        static: true, // This block cannot be moved or removed
      },
      'social-twitter': {
        id: 'social-twitter',
        type: 'button',
        properties: {
          text: 'Twitter',
          url: 'https://twitter.com',
          style: 'secondary',
          size: 'small',
        },
        children: [],
        static: true,
      },
      'social-github': {
        id: 'social-github',
        type: 'button',
        properties: {
          text: 'GitHub',
          url: 'https://github.com',
          style: 'secondary',
          size: 'small',
        },
        children: [],
      },
      'social-linkedin': {
        id: 'social-linkedin',
        type: 'button',
        properties: {
          text: 'LinkedIn',
          url: 'https://linkedin.com',
          style: 'secondary',
          size: 'small',
        },
        children: [],
      },
    },
    regions: [
      {
        id: 'header',
        name: 'Header Section',
        blocks: ['header-container'],
      },
      {
        id: 'main',
        name: 'Main Content',
        blocks: ['main-container'],
      },
      {
        id: 'footer',
        name: 'Footer Section',
        blocks: ['footer-container'],
      },
    ],
  },
});

editor.engine.on('block:property:set', console.log);
editor.ui.registerSidebarPanel({
  title: 'Render Panel',
  render: ({ editor }: UiRenderFunctionContext) => {
    const div = document.createElement('div');
    div.style.height = '100%';
    div.style.padding = '16px';

    const title = document.createElement('h3');
    title.textContent = 'Framework-Agnostic Panel';
    title.style.fontSize = '18px';
    title.style.fontWeight = '500';
    title.style.marginBottom = '16px';

    const description = document.createElement('p');
    description.textContent = 'This panel is created using a pure render function without Vue.';
    description.style.color = '#6b7280';
    description.style.marginBottom = '16px';

    const button = document.createElement('button');
    button.textContent = 'Click Me';
    button.style.backgroundColor = '#3b82f6';
    button.style.color = 'white';
    button.style.padding = '8px 16px';
    button.style.borderRadius = '4px';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.onmouseover = () => (button.style.backgroundColor = '#2563eb');
    button.onmouseout = () => (button.style.backgroundColor = '#3b82f6');
    button.onclick = () => {
      // alert('Render function button clicked!');
      editor.ui.toast('Render function button clicked!');
    };

    div.appendChild(title);
    div.appendChild(description);
    div.appendChild(button);

    return div;
  },

  icon: () => {
    const icon = document.createElement('span');
    icon.textContent = '⚡';
    icon.style.fontSize = '16px';
    return icon;
  },

  order: 20,
});

// Register another sidebar panel
editor.ui.registerSidebarPanel({
  title: 'Info Panel',
  render: ({ editor }: UiRenderFunctionContext) => {
    const div = document.createElement('div');
    div.style.height = '100%';
    div.style.padding = '16px';
    div.style.backgroundColor = '#f9fafb';

    const title = document.createElement('h3');
    title.textContent = 'Page Information';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    title.style.marginBottom = '16px';
    title.style.color = '#111827';

    const info = document.createElement('div');
    info.style.display = 'flex';
    info.style.flexDirection = 'column';
    info.style.gap = '12px';

    const createInfoItem = (label: string, value: string) => {
      const item = document.createElement('div');
      item.style.padding = '12px';
      item.style.backgroundColor = 'white';
      item.style.borderRadius = '6px';
      item.style.border = '1px solid #e5e7eb';

      const labelEl = document.createElement('div');
      labelEl.textContent = label;
      labelEl.style.fontSize = '12px';
      labelEl.style.color = '#6b7280';
      labelEl.style.marginBottom = '4px';

      const valueEl = document.createElement('div');
      valueEl.textContent = value;
      valueEl.style.fontSize = '14px';
      valueEl.style.fontWeight = '500';
      valueEl.style.color = '#111827';

      item.appendChild(labelEl);
      item.appendChild(valueEl);
      return item;
    };

    const page = editor.engine.getPage();
    const blockCount = Object.keys(page.blocks).length;
    const regionCount = page.regions.length;

    info.appendChild(createInfoItem('Total Blocks', blockCount.toString()));
    info.appendChild(createInfoItem('Regions', regionCount.toString()));

    div.appendChild(title);
    div.appendChild(info);

    return div;
  },

  icon: () => {
    const icon = document.createElement('span');
    icon.textContent = 'ℹ️';
    icon.style.fontSize = '16px';
    return icon;
  },

  order: 30,
});

// Example of header action button with loading state
editor.ui.registerHeaderAction({
  id: 'save-button-demo',
  slot: 'right',
  button: {
    text: 'Save',
    variant: 'primary',
    onClick: async (_event, { editor, toggleLoading }) => {
      toggleLoading(); // Show loading spinner
      try {
        // Simulate async operation (e.g., saving to server)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const page = editor.engine.getPage();
        console.log('Page saved:', page);
        editor.ui.toast({ description: 'Page saved successfully!', type: 'success' });
      } catch (error) {
        editor.ui.toast({ description: 'Failed to save page', type: 'error' });
      } finally {
        toggleLoading(); // Hide loading spinner
      }
    },
  },
  order: 100,
});

const complexDemoPage: Array<{ regionId: string; structures: BlockStructure[] }> = [
  {
    regionId: 'header',
    structures: [
      {
        type: 'container',
        name: 'Demo Header',
        properties: {
          direction: 'horizontal',
          gap: 24,
          padding: 20,
          backgroundColor: '#ffffff',
        },
        children: [
          {
            type: 'heading',
            name: 'Brand',
            properties: {
              text: 'Craftile Studio',
              level: 'h2',
              color: '#111827',
              align: 'left',
            },
            children: [],
          },
          {
            type: 'button',
            name: 'Docs nav',
            properties: {
              text: 'Docs',
              url: '#docs',
              style: 'secondary',
              size: 'small',
            },
            children: [],
          },
          {
            type: 'button',
            name: 'Templates nav',
            properties: {
              text: 'Templates',
              url: '#templates',
              style: 'secondary',
              size: 'small',
            },
            children: [],
          },
          {
            type: 'button',
            name: 'Launch nav',
            properties: {
              text: 'Launch',
              url: '#launch',
              style: 'primary',
              size: 'small',
            },
            children: [],
          },
        ],
      },
    ],
  },
  {
    regionId: 'main',
    structures: [
      {
        type: 'container',
        name: 'Complex Demo Page',
        properties: {
          direction: 'vertical',
          gap: 28,
          padding: 40,
          backgroundColor: '#f3f4f6',
        },
        children: [
          {
            type: 'responsive-hero',
            name: 'Hero',
            properties: {
              title: 'Build complete pages from composable blocks',
              fontSize: {
                _default: '3xl',
                tablet: '2xl',
                mobile: 'xl',
              },
              padding: {
                _default: 56,
                tablet: 40,
                mobile: 28,
              },
              borderRadius: {
                _default: 16,
                tablet: 14,
                mobile: 12,
              },
              textAlign: 'center',
              backgroundColor: '#2563eb',
            },
            children: [],
          },
          {
            type: 'grouped-text',
            name: 'Intro Copy',
            properties: {
              content:
                'This page was inserted as nested block structures inside one history batch. Undo once to restore the previous playground page.',
              placeholder: 'Describe the page...',
              fontSize: {
                _default: 'lg',
                tablet: 'md',
                mobile: 'sm',
              },
              color: '#111827',
              backgroundColor: '#e0f2fe',
              padding: 24,
              margin: 0,
              borderRadius: 12,
              customClass: 'batch-demo-intro',
              isHighlighted: true,
              id: 'batch-demo-intro',
            },
            children: [],
          },
          {
            type: 'container',
            name: 'Feature Cards',
            properties: {
              direction: 'horizontal',
              gap: 20,
              padding: 0,
              backgroundColor: 'transparent',
            },
            children: [
              {
                type: 'link-card',
                name: 'Preview Feature',
                properties: {
                  title: 'Live preview updates',
                  description: 'Preview changes are emitted from the same command stream used by the editor.',
                  url: '#preview',
                  backgroundColor: '#ffffff',
                },
                children: [],
              },
              {
                type: 'link-card',
                name: 'History Feature',
                properties: {
                  title: 'Single-step rollback',
                  description: 'Multiple inserts and removals can be grouped into one undoable history entry.',
                  url: '#history',
                  backgroundColor: '#ffffff',
                },
                children: [],
              },
              {
                type: 'link-card',
                name: 'Schema Feature',
                properties: {
                  title: 'Schema driven blocks',
                  description: 'Every block in this demo is created from the playground schema registry.',
                  url: '#schemas',
                  backgroundColor: '#ffffff',
                },
                children: [],
              },
            ],
          },
          {
            type: 'container',
            name: 'Content Split',
            properties: {
              direction: 'horizontal',
              gap: 24,
              padding: 24,
              backgroundColor: '#ffffff',
            },
            children: [
              {
                type: 'container',
                name: 'Content Column',
                properties: {
                  direction: 'vertical',
                  gap: 12,
                  padding: 0,
                  backgroundColor: 'transparent',
                },
                children: [
                  {
                    type: 'heading',
                    name: 'Workflow Heading',
                    properties: {
                      text: 'A richer content workflow',
                      level: 'h3',
                      color: '#111827',
                      align: 'left',
                    },
                    children: [],
                  },
                  {
                    type: 'text',
                    name: 'Workflow Body',
                    properties: {
                      content:
                        'Use this example to verify that replacing a whole page through batched operations still behaves like one editor action.',
                      fontSize: 'md',
                      color: '#4b5563',
                      booleanField: true,
                      rangeField: 64,
                    },
                    children: [],
                  },
                  {
                    type: 'button',
                    name: 'Primary CTA',
                    properties: {
                      text: 'Explore the batch',
                      url: '#batch',
                      style: 'primary',
                      size: 'large',
                    },
                    children: [],
                  },
                ],
              },
              {
                type: 'image',
                name: 'Preview Image',
                properties: {
                  src: 'https://placehold.co/420x260/2563eb/ffffff?text=Complex+Demo',
                  alt: 'Complex page preview',
                  width: 420,
                  height: 260,
                },
                children: [],
              },
            ],
          },
          {
            type: 'accordion',
            name: 'Demo FAQ',
            properties: {
              backgroundColor: '#ffffff',
              borderColor: '#d1d5db',
              allowMultiple: false,
            },
            children: [
              {
                type: 'accordion-row',
                name: 'Undo Row',
                properties: {
                  title: 'How do I test the batch?',
                  isOpen: true,
                },
                children: [
                  {
                    type: 'text',
                    name: 'Undo Answer',
                    properties: {
                      content: 'Click Undo once after loading this page. The previous root blocks should return.',
                      fontSize: 'md',
                      color: '#4b5563',
                    },
                    children: [],
                  },
                ],
              },
              {
                type: 'accordion-row',
                name: 'Redo Row',
                properties: {
                  title: 'What should Redo do?',
                  isOpen: false,
                },
                children: [
                  {
                    type: 'text',
                    name: 'Redo Answer',
                    properties: {
                      content: 'Redo should reapply this full complex page as a single history entry.',
                      fontSize: 'md',
                      color: '#4b5563',
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
          {
            type: 'collection-list',
            name: 'Collection Demo',
            properties: {
              gap: 16,
            },
            children: [
              {
                type: 'collection-item',
                name: 'Starter Item',
                properties: {
                  title: 'Starter',
                  description: 'Ghost data item for the collection demo',
                  price: '$29',
                  image: 'https://placehold.co/300x200',
                },
                children: [],
              },
              {
                type: 'collection-item',
                name: 'Growth Item',
                properties: {
                  title: 'Growth',
                  description: 'Another ghost data item for repeated rendering',
                  price: '$79',
                  image: 'https://placehold.co/300x200',
                },
                children: [],
              },
              {
                type: 'collection-card',
                name: 'Collection Card',
                properties: {},
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    regionId: 'footer',
    structures: [
      {
        type: 'container',
        name: 'Demo Footer',
        properties: {
          direction: 'horizontal',
          gap: 20,
          padding: 24,
          backgroundColor: '#111827',
        },
        children: [
          {
            type: 'text',
            name: 'Footer Copyright',
            properties: {
              content: 'Craftile Studio demo page',
              fontSize: 'sm',
              color: '#d1d5db',
            },
            children: [],
          },
          {
            type: 'button',
            name: 'Status Link',
            properties: {
              text: 'Status',
              url: '#status',
              style: 'secondary',
              size: 'small',
            },
            children: [],
          },
          {
            type: 'button',
            name: 'Contact Link',
            properties: {
              text: 'Contact',
              url: '#contact',
              style: 'secondary',
              size: 'small',
            },
            children: [],
          },
        ],
      },
    ],
  },
];

function replaceCurrentPageRootsWithDemo(): void {
  const currentPage = editor.engine.getPage();
  const rootBlockIds = currentPage.regions.flatMap((region) => [...region.blocks]);

  editor.engine.batch(() => {
    rootBlockIds.forEach((blockId) => {
      if (editor.engine.getBlockById(blockId)) {
        editor.engine.removeBlock(blockId);
      }
    });

    complexDemoPage.forEach(({ regionId, structures }) => {
      structures.forEach((structure) => {
        editor.engine.pasteBlock(structure, { regionId });
      });
    });
  });
}

editor.ui.registerHeaderAction({
  id: 'batch-history-demo',
  slot: 'right',
  button: {
    text: 'Load demo page',
    variant: 'secondary',
    onClick: (_event, { editor }) => {
      replaceCurrentPageRootsWithDemo();

      editor.ui.toast({
        description: 'Loaded complex demo page. Press Undo once to restore the previous page.',
        type: 'success',
      });
    },
  },
  order: 90,
});

editor.engine.on('block:property:set', console.log);
