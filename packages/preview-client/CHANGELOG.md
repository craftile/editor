# @craftile/preview-client

## 0.1.3

## 0.1.2

### Patch Changes

- [`0a482b9`](https://github.com/craftile/editor/commit/0a482b9e3af559ead260d9d82d8752ed34eb8e25) Thanks [@eldomagan](https://github.com/eldomagan)! - send page data message in load event instead of DOMContentLoaded

## 0.1.1

### Patch Changes

- [`6bd1a87`](https://github.com/craftile/editor/commit/6bd1a87e50486464b177901ef7324380c750c4de) Thanks [@eldomagan](https://github.com/eldomagan)! - Move preview ready signal from window load to DOMContentLoaded event

  This ensures the preview client signals readiness earlier in the page lifecycle, improving initialization timing and reliability of the preview system.
