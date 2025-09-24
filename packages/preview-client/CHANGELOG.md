# @craftile/preview-client

## 0.1.1

### Patch Changes

- [`6bd1a87`](https://github.com/craftile/editor/commit/6bd1a87e50486464b177901ef7324380c750c4de) Thanks [@eldomagan](https://github.com/eldomagan)! - Move preview ready signal from window load to DOMContentLoaded event

  This ensures the preview client signals readiness earlier in the page lifecycle, improving initialization timing and reliability of the preview system.
