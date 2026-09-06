<div align="center">

# Craftile Editor

**A modern, extensible block-based page editor for the web**

[![NPM Version](https://img.shields.io/npm/v/@craftile/editor)](https://www.npmjs.com/package/@craftile/editor)
[![License](https://img.shields.io/github/license/craftile/editor)](https://github.com/craftile/editor/blob/main/LICENSE)

</div>

## ✨ Features

- 🧱 **Block-based editing** - Compose pages from reusable, configurable blocks
- ⚡ **Real-time preview** - See changes instantly with live preview iframe
- 🔌 **Plugin system** - Extend with custom blocks and UI components
- 📦 **Framework agnostic** - JSON output works with any frontend framework

## 🚀 Quick Start

### Installation

```bash
npm install @craftile/editor
```

### Basic Usage

```typescript
import { createCraftileEditor } from '@craftile/editor';

const editor = createCraftileEditor({
  el: '#app',
  blockSchemas: [
    {
      type: 'text',
      properties: [
        { id: 'content', type: 'text', label: 'Content', default: 'Enter text...' },
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
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3H8zM6 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8z"/><path d="M8 11a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1z"/></svg>',
        category: 'Interactive',
        description: 'Clickable button with customizable text and styling',
      },
    },
  ],
});
```

A block schema's `accepts` lists the child types it allows, using exact names or glob patterns such as `*`, `@theme/*` or `visual-*`. The optional `rejects` list uses the same patterns and removes matches from `accepts`. For example, `accepts: ['*'], rejects: ['button']` allows every block except buttons. A schema without `accepts` allows no children, whatever `rejects` contains.

### With Plugins

```typescript
import { createCraftileEditor } from '@craftile/editor';
import CommonPropertiesPlugin from '@craftile/plugin-common-properties';
import StaticBlocksRenderer from '@craftile/plugin-static-blocks-renderer';

const editor = createCraftileEditor({
  el: '#app',
  blockSchemas: [
    /** your block schemas */
  ],
  plugins: [
    CommonPropertiesPlugin,
    StaticBlocksRenderer({
      blockRenderers: {
        text: ({ props, editorAttributes }) => {
          return `<div class="block" ${editorAttributes} style="color: ${props.color}">
            ${props.content || ''}
          </div>`;
        },
        button: ({ props, editorAttributes }) => {
          return `<button class="block ${props.style}" ${editorAttributes}>
            ${props.text || 'Button'}
          </button>`;
        },
      },
      scripts: ['https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'],
    }),
  ],
  initialPage: {
    blocks: {
      'welcome-text': {
        id: 'welcome-text',
        type: 'text',
        properties: {
          content: 'Welcome to Craftile Editor!',
          fontSize: 'lg',
          color: '#1f2937',
        },
        children: [],
      },
    },
    regions: [
      {
        name: 'main',
        blocks: ['welcome-text'],
      },
    ],
  },
});
```

## 🔌 Official Plugins

- **@craftile/plugin-common-properties** - Common property field types (text, color, range, etc.)
- **@craftile/plugin-static-blocks-renderer** - static html blocks renderer

## 📁 Directory Structure

```
craftile-editor/
├── packages/                      # Core packages
│   ├── core/                     # Framework-agnostic editor engine
│   ├── editor/                   # Vue.js-based editor UI
│   ├── types/                    # Shared TypeScript definitions
│   ├── event-bus/                # Generic event bus utility
│   ├── messenger/                # Window.postMessage wrapper
│   ├── preview-client/           # Browser client for preview iframe
│   └── preview-client-html/      # HTML preview client for static rendering
├── plugins/                      # Official plugins
│   ├── common-properties/        # Common property field types
│   └── static-blocks-renderer/   # Static HTML block rendering
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT © [Craftile Team](https://github.com/craftile)

---

<div align="center">

Made with ❤️ by the Craftile community

</div>
