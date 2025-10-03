<script setup lang="ts">
import { Menu } from '@ark-ui/vue';

interface Props {
  isOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOverlay: false,
});

const { t } = useI18n();
const { engine, moveBlock, duplicateBlock, toggleBlock, removeBlock } = useCraftileEngine();
const { selectedBlock, clearSelection } = useSelectedBlock();

const blockDisplayName = computed(() => {
  if (!selectedBlock.value) {
    return '';
  }
  const schema = engine.getBlockSchema(selectedBlock.value.type);
  return schema?.meta?.name || selectedBlock.value.type;
});

const blockPositionInfo = computed(() => {
  if (!selectedBlock.value) {
    return null;
  }

  const page = engine.getPage();
  const block = selectedBlock.value;

  for (const region of page.regions) {
    const blockIndex = region.blocks.indexOf(block.id);
    if (blockIndex !== -1) {
      return {
        parentType: 'region',
        parentId: region.name,
        currentIndex: blockIndex,
        siblingCount: region.blocks.length,
      };
    }
  }

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

const canMoveToPrevious = computed(() => {
  if (!selectedBlock.value || selectedBlock.value?.static) {
    return false;
  }

  return blockPositionInfo.value && blockPositionInfo.value.currentIndex > 0;
});

const canMoveToNext = computed(() => {
  if (!selectedBlock.value || selectedBlock.value?.static) {
    return false;
  }

  return blockPositionInfo.value && blockPositionInfo.value.currentIndex < blockPositionInfo.value.siblingCount - 1;
});

function handleDuplicateBlock() {
  duplicateBlock(selectedBlock.value!.id);
}

function handleMoveToNext() {
  if (!selectedBlock.value || !blockPositionInfo.value) {
    return;
  }

  const newIndex = blockPositionInfo.value.currentIndex + 1;

  if (blockPositionInfo.value.parentType === 'region') {
    moveBlock(selectedBlock.value.id, {
      targetRegionName: blockPositionInfo.value.parentId,
      targetIndex: newIndex,
    });
  } else if (blockPositionInfo.value.parentType === 'block') {
    moveBlock(selectedBlock.value.id, {
      targetParentId: blockPositionInfo.value.parentId,
      targetIndex: newIndex,
    });
  }
}

function handleMoveToPrevious() {
  if (!selectedBlock.value || !blockPositionInfo.value) {
    return;
  }

  const newIndex = blockPositionInfo.value.currentIndex - 1;

  if (blockPositionInfo.value.parentType === 'region') {
    moveBlock(selectedBlock.value.id, {
      targetRegionName: blockPositionInfo.value.parentId,
      targetIndex: newIndex,
    });
  } else if (blockPositionInfo.value.parentType === 'block') {
    moveBlock(selectedBlock.value.id, {
      targetParentId: blockPositionInfo.value.parentId,
      targetIndex: newIndex,
    });
  }
}

function handleToggleBlock() {
  if (!selectedBlock.value) {
    return;
  }

  toggleBlock(selectedBlock.value.id);
}

function handleRemoveBlock() {
  if (!selectedBlock.value || selectedBlock.value.static) {
    return;
  }

  removeBlock(selectedBlock.value.id);
  clearSelection();
}
</script>

<template>
  <div v-if="selectedBlock" class="border-b border-gray-200 bg-white px-3 py-2 flex-none">
    <div class="flex items-center gap-2">
      <!-- Back Button (not visible on 2xl screens) -->
      <button
        v-if="props.isOverlay"
        @click="clearSelection"
        class="flex-none flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
        :aria-label="t('common.close')"
      >
        <icon-chevron-left class="w-4 h-4 text-gray-600" />
      </button>

      <!-- Block Name -->
      <h3 class="flex-1 text-sm font-medium text-gray-900 truncate capitalize">
        {{ blockDisplayName }}
      </h3>

      <!-- Actions Menu -->
      <Menu.Root>
        <Menu.Trigger class="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors">
          <icon-ellipsis-vertical class="w-4 h-4 text-gray-600" />
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content
            class="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50 focus:outline-none"
          >
            <!-- Duplicate -->
            <Menu.Item
              value="duplicate"
              :disabled="selectedBlock.static"
              @select="handleDuplicateBlock"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
            >
              <icon-document-duplicate class="w-4 h-4" />
              {{ t('block.duplicate') }}
            </Menu.Item>

            <!-- Move to Previous -->
            <Menu.Item
              value="move-next"
              :disabled="!canMoveToPrevious"
              @select="handleMoveToPrevious"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
            >
              <icon-arrow-long-left class="w-4 h-4" />
              {{ t('block.moveToPrevious') }}
            </Menu.Item>

            <!-- Move to Next -->
            <Menu.Item
              value="move-next"
              :disabled="!canMoveToNext"
              @select="handleMoveToNext"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
            >
              <icon-arrow-long-right class="w-4 h-4" />
              {{ t('block.moveToNext') }}
            </Menu.Item>

            <!-- Enable/Disable -->
            <Menu.Item
              value="toggle"
              @select="handleToggleBlock"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <icon-eye v-if="selectedBlock.disabled" class="w-4 h-4" />
              <icon-eye-slash v-else class="w-4 h-4" />
              {{ selectedBlock.disabled ? t('block.enable') : t('block.disable') }}
            </Menu.Item>

            <!-- Remove -->
            <Menu.Item
              value="remove"
              :disabled="selectedBlock.static"
              @select="handleRemoveBlock"
              class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
            >
              <icon-trash class="w-4 h-4" />
              {{ t('block.remove') }}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </div>
  </div>
</template>
