---
'@craftile/editor': patch
---

Fix child reorders corrupting the preview iframe when the parent is rendered as multiple DOM instances (e.g., blocks with a `repeated: true` ancestor). When the moved block lives in a repeated context, source and target parent IDs are now included in `changes.updated` so preview clients skip the optimistic single-element DOM move and rely on the html-effects refresh to keep every rendered instance in sync. Non-repeated layouts continue to use the optimistic move and feel instant.
