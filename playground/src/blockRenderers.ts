import type { BlockRenderer } from '@craftile/plugin-static-blocks-renderer';

function escapeHtml(text: string): string {
  const div = { innerHTML: '' } as any;
  div.textContent = text;
  return (
    div.innerHTML ||
    text.replace(/[&<>"']/g, (match: string) => {
      const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return escapeMap[match];
    })
  );
}

function generateContainerStyle(properties: Record<string, any>): string {
  const styles: string[] = [];

  styles.push('display: flex');

  if (properties.direction === 'horizontal') {
    styles.push('flex-direction: row');
  } else if (properties.direction === 'vertical') {
    styles.push('flex-direction: column');
  }

  if (properties.gap !== undefined && properties.gap !== null) {
    styles.push(`gap: ${properties.gap}px`);
  }

  if (properties.padding !== undefined && properties.padding !== null) {
    styles.push(`padding: ${properties.padding}px`);
  }

  if (properties.backgroundColor) {
    styles.push(`background-color: ${escapeHtml(properties.backgroundColor)}`);
  }

  // Handle other common properties
  const commonProps = ['margin', 'borderRadius', 'border', 'width', 'height'];
  for (const prop of commonProps) {
    if (properties[prop] !== undefined && properties[prop] !== null) {
      const cssValue = typeof properties[prop] === 'number' ? `${properties[prop]}px` : properties[prop];
      const cssProp = prop === 'borderRadius' ? 'border-radius' : prop;
      styles.push(`${cssProp}: ${escapeHtml(String(cssValue))}`);
    }
  }

  return styles.join('; ');
}

function generateBlockStyle(properties: Record<string, any>): string {
  const styleMap: Record<string, string> = {
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    color: 'color',
    backgroundColor: 'background-color',
    padding: 'padding',
    margin: 'margin',
    borderRadius: 'border-radius',
    border: 'border',
    textAlign: 'text-align',
    width: 'width',
    height: 'height',
    display: 'display',
    flexDirection: 'flex-direction',
    justifyContent: 'justify-content',
    alignItems: 'align-items',
    gap: 'gap',
  };

  const styles: string[] = [];

  for (const [prop, value] of Object.entries(properties)) {
    const cssProp = styleMap[prop];
    if (cssProp && value) {
      const cssValue = typeof value === 'number' && ['padding', 'margin', 'gap'].includes(prop) ? `${value}px` : value;
      styles.push(`${cssProp}: ${escapeHtml(String(cssValue))}`);
    }
  }

  return styles.join('; ');
}

export const blockRenderers: Record<string, BlockRenderer> = {
  heading: ({ props, editorAttributes }) => {
    const level = props.level || 'h2';
    const text = escapeHtml(props.text || 'Heading');
    const color = props.color || '#1f2937';
    const align = props.align || 'left';

    const style = `
      color: ${escapeHtml(color)};
      text-align: ${align};
      margin: 0;
    `;

    // The root tag changes based on the level property (h1, h2, h3, h4, h5, h6)
    return `<${level} class="block" ${editorAttributes} style="${style}">
      ${text}
    </${level}>`;
  },

  container: ({ props, editorAttributes, children, id }) => {
    const style = generateContainerStyle(props);

    return `<div class="block" ${editorAttributes} style="${style}">
          <!--BEGIN children: ${id}-->
          ${children}
          <!--END children: ${id}-->
        </div>`;
  },

  card: ({ props, editorAttributes, children, id }) => {
    const title = escapeHtml(props.title || 'Card Title');
    const backgroundColor = props.backgroundColor || '#ffffff';
    const borderColor = props.borderColor || '#e5e7eb';

    const style = `
      background-color: ${escapeHtml(backgroundColor)};
      border: 1px solid ${escapeHtml(borderColor)};
      border-radius: 8px;
      overflow: hidden;
    `;

    return `<div class="block" ${editorAttributes} style="${style}">
      <div style="padding: 16px; border-bottom: 1px solid ${escapeHtml(borderColor)}; font-weight: bold;">
        ${title}
      </div>
      <div style="padding: 16px;">
        <!--BEGIN children: ${id}-->
        ${children}
        <!--END children: ${id}-->
      </div>
      <div style="padding: 12px 16px; background-color: #f9fafb; border-top: 1px solid ${escapeHtml(borderColor)}; font-size: 14px; color: #6b7280;">
        Card Footer
      </div>
    </div>`;
  },

  text: ({ props, editorAttributes }) => {
    const style = generateBlockStyle(props);
    return `<div class="block" ${editorAttributes} style="${style}">
      ${escapeHtml(props.content || '')}
    </div>`;
  },

  button: ({ props, editorAttributes }) => {
    const style = generateBlockStyle(props);
    return `<button class="block" ${editorAttributes} style="${style}">
      ${escapeHtml(props.text || 'Button')}
    </button>`;
  },

  image: ({ props, editorAttributes }: any) => {
    const src = props.src || '';
    const alt = props.alt || '';
    const style = generateBlockStyle(props);
    return `<img class="block" ${editorAttributes}
      src="${escapeHtml(src)}"
      alt="${escapeHtml(alt)}"
      style="${style}" />`;
  },

  'grouped-text': ({ props, editorAttributes }: any) => {
    const style = generateBlockStyle(props);
    return `<div class="block ${props.customClass || ''}" ${editorAttributes}
      style="${style}"
      id="${props.id || ''}"
      ${props.isHighlighted ? 'data-highlighted="true"' : ''}>
      ${escapeHtml(props.content || props.placeholder || 'Text')}
    </div>`;
  },

  'responsive-hero': ({ props, editorAttributes }: any) => {
    // Helper to get responsive value or fallback to default
    const getResponsiveValue = (value: any) => {
      if (value && typeof value === 'object' && '_default' in value) {
        // For now in preview, just use the _default value
        // In a real implementation, you'd check viewport size and use appropriate breakpoint
        return value._default;
      }
      return value;
    };

    const fontSize = getResponsiveValue(props.fontSize) || '3xl';
    const padding = getResponsiveValue(props.padding) || 40;
    const textAlign = getResponsiveValue(props.textAlign) || 'center';
    const backgroundColor = props.backgroundColor || '#3b82f6';
    const title = props.title || 'Hero Title';

    const style = `
      background-color: ${escapeHtml(backgroundColor)};
      padding: ${padding}px;
      text-align: ${textAlign};
      color: white;
      font-size: var(--fs-${fontSize});
      font-weight: bold;
      border-radius: 8px;
    `;

    return `<div class="block" ${editorAttributes} style="${style}">
      ${escapeHtml(title)}
    </div>`;
  },

  accordion: ({ props, editorAttributes, children, id }) => {
    const backgroundColor = props.backgroundColor || '#ffffff';
    const borderColor = props.borderColor || '#e5e7eb';

    const style = `
      background-color: ${escapeHtml(backgroundColor)};
      border: 1px solid ${escapeHtml(borderColor)};
      border-radius: 8px;
      overflow: hidden;
    `;

    return `<div class="block" ${editorAttributes} style="${style}" data-allow-multiple="${props.allowMultiple || false}">
      <!--BEGIN children: ${id}-->
      ${children}
      <!--END children: ${id}-->
    </div>`;
  },

  'accordion-row': ({ props, editorAttributes, children, id }) => {
    const title = escapeHtml(props.title || 'Accordion Item');
    const isOpen = props.isOpen || false;

    const headerStyle = `
      padding: 16px;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    `;

    const contentStyle = `
      padding: ${isOpen ? '16px' : '0 16px'};
      max-height: ${isOpen ? 'none' : '0'};
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
      background-color: #ffffff;
    `;

    const iconStyle = `
      transform: rotate(${isOpen ? '180deg' : '0deg'});
      transition: transform 0.3s ease;
    `;

    return `<div class="block accordion-row" ${editorAttributes} data-is-open="${isOpen}">
      <div class="accordion-header" style="${headerStyle}" onclick="
        const row = this.parentElement;
        const content = row.querySelector('.accordion-content');
        const icon = this.querySelector('.accordion-icon');
        const isOpen = row.dataset.isOpen === 'true';

        // Get accordion element to check allowMultiple
        const accordion = row.parentElement.closest('[data-allow-multiple]');
        const allowMultiple = accordion ? accordion.dataset.allowMultiple === 'true' : false;

        // If not allowing multiple, close other rows
        if (!allowMultiple && !isOpen) {
          const otherRows = accordion.querySelectorAll('.accordion-row');
          otherRows.forEach(otherRow => {
            if (otherRow !== row && otherRow.dataset.isOpen === 'true') {
              const otherContent = otherRow.querySelector('.accordion-content');
              const otherIcon = otherRow.querySelector('.accordion-icon');
              otherRow.dataset.isOpen = 'false';
              otherContent.style.maxHeight = '0';
              otherContent.style.padding = '0 16px';
              otherIcon.style.transform = 'rotate(0deg)';
            }
          });
        }

        // Toggle current row
        row.dataset.isOpen = !isOpen;
        content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
        content.style.padding = isOpen ? '0 16px' : '16px';
        icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      ">
        <span>${title}</span>
        <svg class="accordion-icon" style="${iconStyle}" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="accordion-content" style="${contentStyle}">
        <!--BEGIN children: ${id}-->
        ${children}
        <!--END children: ${id}-->
      </div>
    </div>`;
  },
  'collection-list': ({ props, children, editorAttributes }) => {
    const gap = props.gap || 16;

    const style = `
      display: flex;
      flex-direction: column;
      gap: ${gap}px;
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 8px;
    `;

    return `<div class="block collection-list" ${editorAttributes} style="${style}">
      <!--BEGIN children: ${editorAttributes}-->
      ${children}
      <!--END children: ${editorAttributes}-->
    </div>`;
  },
  'collection-item': ({ props, editorAttributes }) => {
    // Ghost blocks should not render - but this is a fallback
    // The renderer plugin already handles ghost blocks by returning empty string
    return `<div ${editorAttributes} style="display: none;" data-ghost="true"></div>`;
  },
  'collection-card': ({ block, editorAttributes }) => {
    // In a real implementation, this would read data from ghost collection-item siblings
    // For demo purposes, we'll show a placeholder card
    const style = `
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    `;

    // Get parent block to access collection items
    // This is a simplified demo - in production you'd have proper data binding
    const title = 'Collection Card';
    const description = 'This card would display data from ghost collection-item blocks';
    const price = '$0.00';

    return `<div class="block collection-card" ${editorAttributes} style="${style}">
      <div style="display: flex; gap: 16px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${title}</h3>
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">${description}</p>
          <div style="font-size: 20px; font-weight: 700; color: #6366f1;">${price}</div>
        </div>
      </div>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 4px 12px; background: #ede9fe; color: #7c3aed; border-radius: 4px; font-size: 12px; font-weight: 500;">
          Repeated Block
        </span>
      </div>
    </div>`;
  },
};
