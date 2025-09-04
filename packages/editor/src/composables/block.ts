/**
 * Vue composable for working with individual blocks
 *
 * @param blockId Block ID
 * @returns Reactive interface to a specific block
 */
export function useBlock(blockId: string) {
  const {
    engine,
    blocks,
    getBlockById,
    getChildrenBlocks,
    setBlockProperty,
    toggleBlock,
    removeBlock,
    duplicateBlock,
    moveBlock,
    regions,
  } = useCraftileEngine();

  const block = computed(() => getBlockById(blockId));
  const properties = computed(() => block.value?.properties || {});
  const type = computed(() => block.value?.type);
  const disabled = computed(() => block.value?.disabled);

  const schema = computed(() => {
    if (!block.value) return undefined;
    return engine.getBlockSchema(block.value.type);
  });

  const index = computed(() => {
    if (parent.value) {
      return parent.value.children?.indexOf(blockId) ?? -1;
    }

    for (const region of regions.value) {
      const idx = region.blocks.indexOf(blockId);
      if (idx !== -1) {
        return idx;
      }
    }
  });

  const parent = computed(() => {
    if (!block.value) return undefined;

    for (const region of regions.value) {
      if (region.blocks.includes(blockId)) {
        return undefined; // root-level block
      }
    }

    for (const potentialParent of Object.values(blocks.value)) {
      if (potentialParent.children?.includes(blockId)) {
        return potentialParent;
      }
    }

    return undefined;
  });

  const children = computed(() => getChildrenBlocks(blockId));

  const previousSibling = computed(() => {
    if (index.value === undefined || index.value <= 0) {
      return undefined;
    }

    if (parent.value) {
      const siblingId = parent.value.children[index.value - 1];
      return getBlockById(siblingId);
    }

    for (const region of regions.value) {
      if (region.blocks.includes(blockId)) {
        const siblingId = region.blocks[index.value - 1];
        return getBlockById(siblingId);
      }
    }

    return undefined;
  });

  const nextSibling = computed(() => {
    if (index.value === undefined || index.value < 0) {
      return undefined;
    }

    if (parent.value) {
      if (index.value >= parent.value.children.length - 1) {
        return undefined;
      }
      const siblingId = parent.value.children[index.value + 1];
      return getBlockById(siblingId);
    }

    for (const region of regions.value) {
      if (region.blocks.includes(blockId)) {
        if (index.value >= region.blocks.length - 1) {
          return undefined;
        }
        const siblingId = region.blocks[index.value + 1];
        return getBlockById(siblingId);
      }
    }

    return undefined;
  });

  const isRootLevel = computed(() => parent.value === undefined);
  const hasChildren = computed(() => children.value.length > 0);

  const canHaveChildren = computed(() => {
    const schemaAllowsChildren = schema.value?.accepts && schema.value.accepts.length > 0;
    return schemaAllowsChildren || hasChildren.value;
  });

  const setProperty = (key: string, value: any) => {
    setBlockProperty(blockId, key, value);
  };

  const toggle = (disabled?: boolean) => {
    toggleBlock(blockId, disabled);
  };

  const remove = () => {
    removeBlock(blockId);
  };

  const duplicate = () => {
    return duplicateBlock(blockId);
  };

  const moveChild = (childId: string, newIndex: number) => {
    moveBlock(childId, { targetParentId: blockId, targetIndex: newIndex });
  };

  return {
    block,
    properties,
    type,
    disabled,
    schema,
    index,

    // Relationships
    parent,
    children,
    isRootLevel,
    hasChildren,
    canHaveChildren,
    previousSibling,
    nextSibling,

    // Actions
    setProperty,
    toggle,
    remove,
    duplicate,
    moveChild,
  };
}
