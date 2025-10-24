---
"@craftile/preview-client": patch
---

Fix position update timing when block DOM elements are replaced. Use requestAnimationFrame to defer position measurement until after browser layout is complete.