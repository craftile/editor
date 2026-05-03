---
'@craftile/editor': patch
---

Keep inspection mode state in sync after preview navigation. Preview readiness now distinguishes one-time setup from each loaded preview document, allowing disabled inspection mode to be replayed when a link navigation creates a fresh preview document.
