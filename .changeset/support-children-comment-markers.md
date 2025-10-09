---
"@craftile/preview-client-html": minor
---

Support children comment markers for blocks with nested DOM structures. Block renderers can now use `<!--BEGIN children: {blockId}-->` and `<!--END children: {blockId}-->` comments to specify where children should be inserted, enabling blocks with complex internal wrapper hierarchies to properly position their children.