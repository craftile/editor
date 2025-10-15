---
'@craftile/editor': patch
---

Fix reactivity issue when updating block properties. Use toRaw() to unwrap Vue proxies before passing property values to the engine, preventing potential structuredClone errors.
