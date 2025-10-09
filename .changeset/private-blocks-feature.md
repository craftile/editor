---
'@craftile/types': minor
'@craftile/core': minor
---

Add support for private blocks that can only be children if explicitly listed

This is useful for blocks that should only be used in specific contexts, such as:
- `accordion-row` blocks that should only be children of `accordion` blocks
- Tab panels that should only be children of tab containers
- List items that should only be children of list containers

Example:
```typescript
{
  type: 'accordion',
  accepts: ['accordion-row'], // Explicitly accepts accordion-row
}

{
  type: 'accordion-row',
  private: true, // Can only be child of blocks that explicitly list 'accordion-row'
  accepts: ['*'], // But can accept any children itself
}
```
