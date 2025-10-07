---
'@craftile/types': minor
'@craftile/editor': minor
---

Add conditional property field visibility with visibleIf rules

**Example usage:**

```typescript
{
  id: 'linkUrl',
  type: 'text',
  label: 'Link URL',
  visibleIf: {
    field: 'enableLink',
    operator: 'truthy'
  }
}

// Complex example with logical groups
{
  id: 'borderRadius',
  type: 'number',
  label: 'Border Radius',
  visibleIf: {
    and: [
      { field: 'advancedOptions', operator: 'truthy' },
      { field: 'layout', operator: 'not_equals', value: 'simple' }
    ]
  }
}
```