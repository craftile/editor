---
'@craftile/types': minor
'@craftile/core': minor
---

Add an optional `rejects` list to block schemas. It uses the same glob patterns as `accepts` and removes matching child types from what `accepts` allows, including private blocks. It has no effect when `accepts` is absent. Insert, move, paste, drag-and-drop and the block picker all honor it through `canBeChild`.
