<div align="center">

# Craftile Editor

**A modern, extensible block-based page editor for the web**

[![NPM Version](https://img.shields.io/npm/v/@craftile/editor)](https://www.npmjs.com/package/@craftile/editor)
[![License](https://img.shields.io/github/license/craftile/editor)](https://github.com/craftile/editor/blob/main/LICENSE)

[Demo](#demo) • [Documentation](#documentation) • [Examples](#examples)

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
  el: '#editor',
  blockSchemas: [
    {
      type: 'text',
      name: 'Text Block',
      properties: {
        content: { type: 'textarea', default: 'Hello World!' },
        fontSize: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
        color: { type: 'color', default: '#000000' },
      },
    },
    {
      type: 'button',
      name: 'Button',
      properties: {
        text: { type: 'text', default: 'Click me' },
        url: { type: 'text', default: '#' },
        style: { type: 'select', options: ['primary', 'secondary'], default: 'primary' },
        size: { type: 'select', options: ['small', 'medium', 'large'], default: 'medium' },
      },
    },
  ],
});
```

### With Plugins

```typescript
import { createCraftileEditor } from '@craftile/editor';
import CommonPropertiesPlugin from '@craftile/plugin-common-properties';
import StaticBlocksRenderer from '@craftile/plugin-static-blocks-renderer';

const editor = createCraftileEditor({
  el: '#editor',
  blockSchemas: [
    /* your block schemas */
  ],
  plugins: [
    CommonPropertiesPlugin,
    StaticBlocksRenderer({
      blockRenderers: {
        text: (block) => `<p style="color: ${block.properties.color}">${block.properties.content}</p>`,
        button: (block) => `<button class="${block.properties.style}">${block.properties.text}</button>`,
      },
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
