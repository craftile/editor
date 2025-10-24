---
"@craftile/preview-client-html": minor
---

Add CSS and JS effects injection with deduplication and execution tracking. CSS styles/links and JS scripts are injected only once, preventing duplicates. Script execution is tracked and a 'scripts.execution.complete' event is emitted with success/failure stats when all scripts finish loading.