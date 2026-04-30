---
'@craftile/types': patch
'@craftile/editor': patch
'@craftile/preview-client-html': patch
---

Fix block insert/move/re-enable landing in the wrong DOM slot when preceded by disabled siblings. Disabled blocks are excluded from the preview DOM but still occupy a slot in the data tree, so positioning by raw data-tree index produced an off-by-N error. The editor now resolves sibling refs (`afterId`/`beforeId`) from the full engine state, skipping disabled blocks, and ships them in `UpdatesEvent.changes.positions`. The preview client uses these refs to anchor inserts and moves, so DOM order matches data-tree intent regardless of disabled siblings.
