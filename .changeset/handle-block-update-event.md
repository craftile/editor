---
'@craftile/editor': patch
---

Add support for block:update event in watch-engine-updates

Handle the block:update event to properly track and propagate block metadata changes (like block name updates) to the preview for re-rendering.
