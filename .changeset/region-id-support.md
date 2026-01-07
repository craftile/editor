---
"@craftile/types": minor
"@craftile/core": major
"@craftile/editor": patch
"@craftile/preview-client-html": patch
"@craftile/plugin-static-blocks-renderer": patch
---

feat: add region id support with name as display label

This release adds support for optional `id` field on regions, allowing regions to have a unique identifier separate from their display name.

## Breaking Changes

- **@craftile/core**: Renamed `regionName` to `regionId` in all engine events (`block:insert`, `block:move`, `block:duplicate`, `block:remove`)
- **@craftile/core**: Engine methods now use `regionId` parameter instead of `regionName`
- **@craftile/types**: `EngineEvents` interfaces now use `regionId` and `sourceRegionId` fields

## New Features

- **@craftile/types**: Added optional `id` field to `Region` interface
- **@craftile/core**: Added `getRegionId()` helper function that returns `region.id || region.name`
- Regions now support both `id` (unique identifier) and `name` (display label)
- Automatic fallback to `name` when `id` is not provided for backward compatibility

## Migration Guide

If you have custom code using the engine API:

```typescript
// Before
engine.insertBlock(block, { regionName: 'main' });

// After
engine.insertBlock(block, { regionId: 'main' });
```

If you're listening to engine events:

```typescript
// Before
engine.on('block:insert', ({ regionName }) => {
  console.log(regionName);
});

// After
engine.on('block:insert', ({ regionId }) => {
  console.log(regionId);
});
```

If you're defining regions in your page data:

```typescript
// Before (still works)
regions: [
  { name: 'main', blocks: [] }
]

// After (recommended)
regions: [
  { id: 'main', name: 'Main Content', blocks: [] }
]
```