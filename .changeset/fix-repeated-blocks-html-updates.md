---
'@craftile/editor': patch
'@craftile/plugin-static-blocks-renderer': patch
'@craftile/preview-client-html': patch
---

Fix repeated blocks not updating in preview when edited. All instances of a repeated block now update correctly when the block or its descendants are modified.
