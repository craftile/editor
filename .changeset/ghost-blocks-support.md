---
'@craftile/types': minor
'@craftile/core': minor
'@craftile/editor': minor
'@craftile/plugin-static-blocks-renderer': minor
---

Add support for ghost/data blocks - blocks that exist in the editor data structure but are not rendered in the live preview. Ghost blocks serve as data holders (e.g., collection items) and can be selected in the layers panel to edit their properties, but no overlay is displayed in the preview since they have no DOM representation.