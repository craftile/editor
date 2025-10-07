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
  container: ({ props, editorAttributes, children }) => {
    const style = generateContainerStyle(props);

    return `<div class="block" ${editorAttributes} style="${style}">
          ${children}
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
};
