<script setup lang="ts">
import { canInsertDynamicChildAt, getRegionId } from '@craftile/core';
import { Menu } from '@ark-ui/vue';

interface Props {
  blockId: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
const { engine, moveBlock, duplicateBlock, toggleBlock, removeBlock, blocks, regions } = useCraftileEngine();
const { open: openBlocksPopover, getInsertionContext } = useBlocksPopover();
const { block: blockData, parent, index: blockIndex } = useBlock(props.blockId);
const { toaster } = useUI();
const { copyBlock, canPasteAfter, pasteBlockAfter, hasCopiedBlock, copyBlockAsJSON } = useClipboard();

const isStatic = computed(() => blockData.value?.static === true);
const isRootBlock = computed(() => !blockData.value?.parentId);

// Get block position info
const blockPositionInfo = computed(() => {
  if (!blockData.value) {
    return null;
  }

  const page = engine.getPage();
  const block = blockData.value;

  // Check if block is in a region
  for (const region of page.regions) {
    const blockIndex = region.blocks.indexOf(block.id);
    if (blockIndex !== -1) {
      return {
        parentType: 'region',
        parentId: getRegionId(region),
        currentIndex: blockIndex,
        siblingCount: region.blocks.length,
      };
    }
  }

  // Check if block has a parent block
  if (block.parentId) {
    const parentBlock = page.blocks[block.parentId];
    if (parentBlock) {
      const blockIndex = parentBlock.children.indexOf(block.id);
      if (blockIndex !== -1) {
        return {
          parentType: 'block',
          parentId: block.parentId,
          currentIndex: blockIndex,
          siblingCount: parentBlock.children.length,
        };
      }
    }
  }

  return null;
});

const siblingsList = computed(() => {
  return parent.value?.children ?? regions.value.find((r) => r.blocks.includes(props.blockId))?.blocks;
});

const canMoveToPrevious = computed(() => {
  if (!blockData.value || isStatic.value || !blockPositionInfo.value) {
    return false;
  }
  if (blockPositionInfo.value.currentIndex <= 0) {
    return false;
  }
  if (!siblingsList.value) {
    return true;
  }
  const prospective = siblingsList.value.filter((id) => id !== props.blockId);
  return canInsertDynamicChildAt(prospective, blocks.value, blockPositionInfo.value.currentIndex - 1);
});

const canMoveToNext = computed(() => {
  if (!blockData.value || isStatic.value || !blockPositionInfo.value) {
    return false;
  }
  if (blockPositionInfo.value.currentIndex >= blockPositionInfo.value.siblingCount - 1) {
    return false;
  }
  if (!siblingsList.value) {
    return true;
  }
  const prospective = siblingsList.value.filter((id) => id !== props.blockId);
  return canInsertDynamicChildAt(prospective, blocks.value, blockPositionInfo.value.currentIndex + 1);
});

const canInsertBefore = computed(() => {
  if (blockIndex.value === undefined || blockIndex.value < 0 || !siblingsList.value) {
    return true;
  }
  return canInsertDynamicChildAt(siblingsList.value, blocks.value, blockIndex.value);
});

const canInsertAfter = computed(() => {
  if (blockIndex.value === undefined || blockIndex.value < 0 || !siblingsList.value) {
    return true;
  }
  return canInsertDynamicChildAt(siblingsList.value, blocks.value, blockIndex.value + 1);
});

const contextTriggerRef = ref<any>(null);

function handleDuplicateBlock() {
  duplicateBlock(props.blockId);
}

function handleToggleBlock() {
  toggleBlock(props.blockId);
}

function tryMove(fn: () => void) {
  try {
    fn();
  } catch (error) {
    toaster.create({
      title: error instanceof Error ? error.message : String(error),
      type: 'error',
    });
  }
}

function handleMoveToPrevious() {
  if (!blockData.value || !blockPositionInfo.value) {
    return;
  }

  const newIndex = blockPositionInfo.value.currentIndex - 1;

  tryMove(() => {
    if (blockPositionInfo.value!.parentType === 'region') {
      moveBlock(props.blockId, {
        targetRegionId: blockPositionInfo.value!.parentId,
        targetIndex: newIndex,
      });
    } else if (blockPositionInfo.value!.parentType === 'block') {
      moveBlock(props.blockId, {
        targetParentId: blockPositionInfo.value!.parentId,
        targetIndex: newIndex,
      });
    }
  });
}

function handleMoveToNext() {
  if (!blockData.value || !blockPositionInfo.value) {
    return;
  }

  const newIndex = blockPositionInfo.value.currentIndex + 1;

  tryMove(() => {
    if (blockPositionInfo.value!.parentType === 'region') {
      moveBlock(props.blockId, {
        targetRegionId: blockPositionInfo.value!.parentId,
        targetIndex: newIndex,
      });
    } else if (blockPositionInfo.value!.parentType === 'block') {
      moveBlock(props.blockId, {
        targetParentId: blockPositionInfo.value!.parentId,
        targetIndex: newIndex,
      });
    }
  });
}

function handleInsertBefore() {
  if (!contextTriggerRef.value?.$el) {
    return;
  }

  const context = getInsertionContext(props.blockId, 'before');
  openBlocksPopover({
    anchor: contextTriggerRef.value.$el,
    context,
  });
}

function handleInsertAfter() {
  if (!contextTriggerRef.value?.$el) {
    return;
  }

  const context = getInsertionContext(props.blockId, 'after');
  openBlocksPopover({
    anchor: contextTriggerRef.value.$el,
    context,
  });
}

function handleRemoveBlock() {
  if (!blockData.value || isStatic.value) {
    return;
  }

  removeBlock(props.blockId);
}

const insertBeforeLabel = computed(() =>
  isRootBlock.value ? t('block.insertBlockBefore') : t('block.insertSiblingBefore')
);

const insertAfterLabel = computed(() =>
  isRootBlock.value ? t('block.insertBlockAfter') : t('block.insertSiblingAfter')
);

function handleCopyBlock() {
  copyBlock(props.blockId);
}

const isPasteEnabled = computed(() => hasCopiedBlock.value && canPasteAfter(props.blockId));

function handlePasteAfter() {
  pasteBlockAfter(props.blockId);
}

function handleCopyAsJSON() {
  copyBlockAsJSON(props.blockId);
}
</script>

<template>
  <Menu.Root v-if="blockData">
    <Menu.ContextTrigger ref="contextTriggerRef" as-child>
      <slot />
    </Menu.ContextTrigger>
    <Menu.Positioner>
      <Menu.Content
        class="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[180px] focus:outline-none z-50"
      >
        <!-- Copy -->
        <Menu.Item
          value="copy"
          @select="handleCopyBlock"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <icon-clipboard-document class="w-4 h-4" />
          {{ t('block.copy') }}
        </Menu.Item>

        <!-- Paste After -->
        <Menu.Item
          value="paste-after"
          :disabled="!isPasteEnabled"
          @select="handlePasteAfter"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        >
          <icon-clipboard class="w-4 h-4" />
          {{ t('block.pasteAfter') }}
        </Menu.Item>

        <!-- Duplicate -->
        <Menu.Item
          value="duplicate"
          :disabled="isStatic"
          @select="handleDuplicateBlock"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        >
          <icon-document-duplicate class="w-4 h-4" />
          {{ t('block.duplicate') }}
        </Menu.Item>

        <!-- Enable/Disable -->
        <Menu.Item
          value="toggle"
          @select="handleToggleBlock"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <icon-eye v-if="blockData.disabled" class="w-4 h-4" />
          <icon-eye-slash v-else class="w-4 h-4" />
          {{ blockData.disabled ? t('block.enable') : t('block.disable') }}
        </Menu.Item>

        <Menu.Separator class="my-1 h-px bg-gray-200" />

        <!-- Move to Previous -->
        <Menu.Item
          value="move-previous"
          :disabled="!canMoveToPrevious"
          @select="handleMoveToPrevious"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        >
          <icon-arrow-long-up class="w-4 h-4" />
          {{ t('block.moveToPrevious') }}
        </Menu.Item>

        <!-- Move to Next -->
        <Menu.Item
          value="move-next"
          :disabled="!canMoveToNext"
          @select="handleMoveToNext"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        >
          <icon-arrow-long-down class="w-4 h-4" />
          {{ t('block.moveToNext') }}
        </Menu.Item>

        <Menu.Separator class="my-1 h-px bg-gray-200" />

        <!-- Insert Before -->
        <Menu.Item
          value="insert-before"
          :disabled="!canInsertBefore"
          @select="handleInsertBefore"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        >
          <icon-arrow-up-on-square class="w-4 h-4" />
          {{ insertBeforeLabel }}
        </Menu.Item>

        <!-- Insert After -->
        <Menu.Item
          value="insert-after"
          :disabled="!canInsertAfter"
          @select="handleInsertAfter"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        >
          <icon-arrow-down-on-square class="w-4 h-4" />
          {{ insertAfterLabel }}
        </Menu.Item>

        <Menu.Separator class="my-1 h-px bg-gray-200" />

        <!-- Copy as JSON -->
        <Menu.Item
          value="copy-as-json"
          @select="handleCopyAsJSON"
          class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <icon-code-bracket class="w-4 h-4" />
          {{ t('block.copyAsJson') }}
        </Menu.Item>

        <!-- Remove -->
        <Menu.Item
          value="remove"
          :disabled="isStatic"
          @select="handleRemoveBlock"
          class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
        >
          <icon-trash class="w-4 h-4" />
          {{ t('block.remove') }}
        </Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
</template>
