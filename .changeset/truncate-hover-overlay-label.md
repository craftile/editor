---
'@craftile/editor': patch
---

Keep the hover overlay label on a single line. Narrow blocks previously caused the label text to wrap because the absolutely-positioned label had no width or `white-space` constraint and shrank to the block's width. The label is now capped at the block's width and truncates with an ellipsis, while the block icon keeps its size via `shrink-0`.
