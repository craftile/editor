<script setup lang="ts">
import { getRegionId } from '@craftile/core';
import { Menu } from '@ark-ui/vue';

interface Props {
  isOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isOverlay: false,
});

const { t } = useI18n();
const { engine, moveBlock, duplicateBlock, toggleBlock, removeBlock, setBlockName } = useCraftileEngine();
const { selectedBlock, clearSelection } = useSelectedBlock();

const blockDisplayName = computed(() => {
  if (!selectedBlock.value) {
    return '';
  }

  if (selectedBlock.value.name) {
    return selectedBlock.value.name;
  }

  const schema = engine.getBlockSchema(selectedBlock.value.type);
  return schema?.meta?.name || selectedBlock.value.type;
});

const isEditingName = ref(false);
const editingName = ref('');
const nameInputRef = ref<HTMLInputElement | null>(null);

function startEditingName() {
  if (!selectedBlock.value) return;
  editingName.value = blockDisplayName.value;
  isEditingName.value = true;
  nextTick(() => {
    nameInputRef.value?.focus();
    nameInputRef.value?.select();
  });
}

function saveBlockName() {
  if (!selectedBlock.value || !editingName.value.trim()) {
    cancelEditingName();
    return;
  }

  const newName = editingName.value.trim();
  if (newName !== blockDisplayName.value) {
    setBlockName(selectedBlock.value.id, newName);
  }

  isEditingName.value = false;
}

function cancelEditingName() {
  isEditingName.value = false;
  editingName.value = '';
}

function handleNameKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveBlockName();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelEditingName();
  }
}

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
        parentId: getRegionId(region),
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
      targetRegionId: blockPositionInfo.value.parentId,
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
      targetRegionId: blockPositionInfo.value.parentId,
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

      <!-- Block Name (editable) -->
      <div class="flex-1 min-w-0">
        <input
          v-if="isEditingName"
          ref="nameInputRef"
          v-model="editingName"
          type="text"
          @blur="saveBlockName"
          @keydown="handleNameKeydown"
          class="w-full text-sm font-medium text-gray-900 px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          v-else
          @click="startEditingName"
          class="w-full text-left text-sm font-medium text-gray-900 truncate capitalize px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          {{ blockDisplayName }}
        </button>
      </div>

      <!-- Actions Menu -->
      <Menu.Root :positioning="{ strategy: 'fixed', placement: 'bottom-end' }">
        <Menu.Trigger class="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors">
          <icon-ellipsis-vertical class="w-4 h-4 text-gray-600" />
        </Menu.Trigger>
        <Menu.Positioner class="!z-10">
          <Menu.Content
            class="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] focus:outline-none"
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
