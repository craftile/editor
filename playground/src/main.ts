import { createCraftileEditor, type UiRenderFunctionContext } from '@craftile/editor';
import CommonPropertiesPlugin from '@craftile/plugin-common-properties';
import StaticBlocksRenderer from '@craftile/plugin-static-blocks-renderer';
import { blockSchemas } from './blockSchemas';
import { blockRenderers } from './blockRenderers';

const editor = createCraftileEditor({
  el: '#app',
  blockSchemas,
  plugins: [
    CommonPropertiesPlugin,
    StaticBlocksRenderer({ blockRenderers, scripts: ['https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'] }),
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
        children: ['welcome-text', 'grouped-demo-block', 'cta-button', 'content-section'],
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
      'grouped-demo-block': {
        id: 'grouped-demo-block',
        type: 'grouped-text',
        properties: {
          // Content group properties
          content:
            'This block demonstrates property grouping! 🎉\n\nClick on this block to see how properties are organized into collapsible groups in the properties panel.',
          placeholder: 'Enter your message here...',

          // Styling group properties
          fontSize: 'lg',
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
        name: 'header',
        blocks: ['header-container'],
      },
      {
        name: 'main',
        blocks: ['main-container'],
      },
      {
        name: 'footer',
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

editor.events.on('updates', console.log);
