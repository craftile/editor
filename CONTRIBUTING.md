# Contributing to Craftile Editor

Thanks for your interest in contributing to Craftile Editor 💖, you're awesome!

There are many ways you can contribute to open source, and we value all of them. Here are some guidelines to help you prepare your contribution.

## Setup the Project

Follow these steps to get up and running with Craftile Editor development:

1. Fork the repository (click the <kbd>Fork</kbd> button at the top right of [this page](https://github.com/craftile/editor))

2. Clone your fork locally

```sh
git clone https://github.com/<your_github_username>/editor.git
cd editor
```

3. Install all dependencies and packages by running `pnpm install`. This will install dependencies and configure git hooks.

> If you encounter any issues during setup, please reach out to the Craftile team by opening an issue.

## Development

We've established tooling and systems to streamline our development process. Craftile Editor uses a monorepo architecture with the following structure:

### Directory Structure

| Package | Description |
| ------- | ----------- |
| [core](packages/core) | Framework-agnostic block editor engine |
| [editor](packages/editor) | Vue.js-based editor UI components |
| [types](packages/types) | Shared TypeScript type definitions |
| [event-bus](packages/event-bus) | Generic event bus utility |
| [messenger](packages/messenger) | Type-safe window.postMessage wrapper |
| [preview-client](packages/preview-client) | Browser client for preview iframe functionality |
| [preview-client-html](packages/preview-client-html) | HTML preview client for static block rendering |
| [plugin-common-properties](plugins/common-properties) | Common block property fields |
| [plugin-static-blocks-renderer](plugins/static-blocks-renderer) | Static HTML block rendering plugin |

### Tooling

- [PNPM](https://pnpm.io/) for package and dependency management
- [Vite](https://vitejs.dev/) for fast development and building
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Vue 3](https://vuejs.org/) for the editor UI
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Prettier](https://prettier.io/) for code formatting
- [Husky](https://typicode.github.io/husky/) for git hooks
- [Changesets](https://github.com/changesets/changesets) for version management and changelog generation

### Commands

**`pnpm install`**: sets up the entire project, creates symlinks between dependencies for cross-package development.

**`pnpm build`**: builds all packages and plugins.

**`pnpm build:packages`**: builds core packages only.

**`pnpm build:plugins`**: builds plugins only.

**`pnpm typecheck`**: runs TypeScript type checking across all packages.

**`pnpm format`**: formats code using Prettier.

**`pnpm format:check`**: verifies code formatting compliance.

**`pnpm test`**: runs tests for all packages (when available).

**`pnpm release`**: builds and publishes updated packages.

## Found a bug?

Please follow the issue template and provide a clear reproduction path with a code example. The most effective way to report a bug is by creating a minimal reproduction using a GitHub repo, CodeSandbox, or StackBlitz.

You can use our [playground](playground/) to help reproduce and demonstrate issues.

## Have an API proposal?

Please provide thoughtful comments and sample API code. Proposals that don't align with our roadmap or lack detailed explanations will be closed.

## Submitting a Pull Request?

Pull requests require approval from two or more collaborators to be merged; if the PR author is a collaborator, that counts as one approval.

### Commit Convention

Before creating a Pull Request, please ensure your commits follow the commit conventions used in this repository.

We ask that you follow the convention `category(scope or module): message` in your commit messages using one of these categories:

- `feat / feature`: introduces completely new code or features
- `fix`: changes that fix a bug (reference an issue when applicable)
- `refactor`: code-related changes that are neither fixes nor features
- `docs`: documentation changes (README, usage docs, etc.)
- `build`: build-related changes, dependency updates, or new dependencies
- `test`: test-related changes (adding or modifying tests)
- `ci`: continuous integration configuration changes (GitHub Actions, etc.)
- `chore`: repository changes that don't fit other categories

For detailed specifications, visit https://www.conventionalcommits.org/ or check the [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

### Pull Request Steps

1. Fork the craftile/editor repository and clone your fork

2. Create a new branch from the `main` branch following the convention `[type/scope]`. Examples: `fix/keyboard-shortcuts` or `docs/readme-update`. The `type` should be a conventional commit type, and `scope` is a brief description of the work area.

3. Make and commit your changes following the [commit convention](#commit-convention). Use `pnpm dev` to test changes in the playground and run `pnpm typecheck` to ensure no TypeScript errors.

4. Run `pnpm changeset` to create a detailed description of your changes for changelog generation. [Learn more about Changesets](https://github.com/changesets/changesets/tree/master/packages/cli).

5. When including code snippets in changesets, use proper syntax highlighting:

```typescript
// Example
const editor = createCraftileEditor({
  el: '#app',
  blockSchemas: [...]
})
```

> For minor changes like CI config or formatting, run `pnpm changeset add --empty` to create an empty changeset file.

### Testing

When possible, all bug fixes and new features should include tests. We're actively expanding our test coverage.

## Want to write about Craftile?

We'd love that! Please reach out to the core team by opening an issue or discussion. We're happy to support your efforts.

## Want to build a plugin?

Craftile Editor is designed for extensibility through plugins. You can contribute by:

- Creating new property field types
- Building block renderers for different frameworks
- Adding UI components and panels
- Integrating with external services

Explore existing plugins in the `plugins/` directory for inspiration.

## License

By contributing code to the craftile/editor GitHub repository, you agree to license your contribution under the MIT license.