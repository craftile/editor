---
'@craftile/editor': patch
---

Clear selection and hover overlay state when preview page changes. When a new preview page loads (via loadFromHtml or URL change), both the selected block and hovered block states are now cleared to prevent stale overlays and references to blocks that no longer exist in the new preview.
