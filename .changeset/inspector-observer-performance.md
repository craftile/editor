---
'@craftile/preview-client': patch
---

Improve inspector performance by properly managing observers lifecycle. ResizeObserver and MutationObserver are now disconnected when inspector is disabled and reconnected when re-enabled.