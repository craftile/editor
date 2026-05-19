---
'@craftile/editor': patch
'@craftile/preview-client': patch
'@craftile/preview-client-html': patch
---

Include block data in preview lifecycle events. Preview clients now cache editor block updates for selection events, remove lifecycle events include block payloads when available, and editor update payloads preserve removed block snapshots for preview consumers.
