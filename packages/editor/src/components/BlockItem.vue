<script setup lang="ts">
import { VueDraggable, type SortableEvent } from 'vue-draggable-plus';
import type { InsertBlockContext } from '../composables/blocks-popover';

const props = defineProps<{
  blockId: any;
  level: number;
  isDragging?: boolean;
}>();

const { t } = useI18n();
const isActive = ref(false);
const {
  block: blockData,
  children,
  hasChildren,
  canHaveChildren,
  nextSibling,
  toggle,
  remove,
  moveChild,
} = useBlock(props.blockId);
const { isExpanded: isExpandedFn, toggleExpanded: toggleExpandedFn } = useLayersPanel();
const { getBlockLabelReactive, getBlockSchemaNameReactive } = useBlockLabel();
const { selectedBlockId, selectBlock } = useSelectedBlock();
const { open: openBlocksPopover } = useBlocksPopover();
const { engine, moveBlock, blocks } = useCraftileEngine();

const isSelected = computed(() => selectedBlockId.value === props.blockId);
const isExpanded = computed(() => isExpandedFn(props.blockId));
const isStatic = computed(() => blockData.value?.static === true);

const blockSchemaName = getBlockSchemaNameReactive(props.blockId);
const blockLabel = getBlockLabelReactive(props.blockId);

const canInsertNextSibling = computed(() => {
  return !nextSibling.value || nextSibling.value.static !== true;
});

function handleAddFirstChild(event: Event) {
  const button = event.target as HTMLElement;

  const context: InsertBlockContext = {
    parentId: props.blockId,
    index: 0,
  };

  openBlocksPopover({
    anchor: button,
    context,
  });
}

function canAcceptChild(event: any): boolean {
  // Prevent dropping on static blocks
  if (event.related && event.related.classList.contains('is-static')) {
    return false;
  }

  // Sometimes, the event is the direct drag event, not the vue-draggable-plus custom event
  // so elements like dragged, to, target may not be available
  // the element is still being dragged, so we allow
  if (!event.drag || !event.target || !event.to) {
    return true;
  }

  const draggedBlockId = event.dragged.getAttribute?.('data-block-id');

  if (!draggedBlockId) {
    return false;
  }

  const draggedBlock = blocks.value[draggedBlockId];
  if (!draggedBlock) {
    return false;
  }

  const targetParentId = event.to?.parentElement?.closest?.('[data-block-id]')?.getAttribute?.('data-block-id');

  if (!targetParentId) {
    return false;
  }

  const targetParentBlock = blocks.value[targetParentId];
  if (!targetParentBlock) {
    return false;
  }

  // Check if the block type can be a child of the target parent type
  return engine.getBlocksManager().canBeChild(draggedBlock.type, targetParentBlock.type);
}

function onChildDragEnd(event: SortableEvent) {
  const { oldIndex, newIndex, from, to } = event;

  if (typeof newIndex === 'undefined') {
    return;
  }

  // Get the moved block ID from the dragged item
  const movedBlockId = event.item?.getAttribute?.('data-block-id');
  if (!movedBlockId) {
    return;
  }

  const isSameContainer = from === to;

  if (isSameContainer && oldIndex === newIndex) {
    return;
  }

  if (isSameContainer) {
    moveChild(movedBlockId, newIndex);
    return;
  }

  // For cross-container moves, get the target parent block ID
  // The 'to' element is the VueDraggable container, so we need to look at its parent
  const targetParentElement = to?.parentElement?.closest?.('[data-block-id]');
  const targetParentId = targetParentElement?.getAttribute?.('data-block-id');

  if (targetParentId) {
    moveBlock(movedBlockId, {
      targetParentId,
      targetIndex: newIndex,
    });
  }
}

function onChildMove(event: any) {
  return canAcceptChild(event);
}
</script>

<template>
  <div v-if="blockData" :class="{ 'bg-gray-100': isActive, 'is-static': isStatic }" :data-block-id="blockData.id">
    <div
      :data-block-id="blockData.id"
      :data-selected="isSelected ? 'true' : undefined"
      class="flex items-center h-8 text-sm hover:bg-gray-50 data-selected:bg-accent/10 data-selected:border data-selected:border-accent/20 data-selected:hover:bg-accent/10 cursor-pointer rounded-md group transition-all duration-200"
      :class="{
        'text-gray-700': !blockData.disabled,
        'text-gray-400': blockData.disabled,
      }"
      @click="selectBlock(blockData.id)"
    >
      <!-- Block Drag Handle -->
      <!-- <div
        class="block-drag-handle mr-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        :class="{ 'opacity-100': isDragging }"
      >
        <svg
          class="w-3 h-3 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div> -->

      <!-- Expand/Collapse for blocks that can have children -->
      <button
        v-if="canHaveChildren"
        @click.stop="() => toggleExpandedFn(props.blockId)"
        class="h-full mr-0.5 px-1 flex items-center justify-center hover:bg-gray-200 rounded cursor-pointer"
      >
        <icon-chevron-right class="w-3 h-3 transition-transform duration-200" :class="{ 'rotate-90': isExpanded }" />
      </button>
      <div v-else class="w-4 h-full" />

      <!-- Block Icon (show lock on hover for static blocks) -->
      <div class="w-4 h-4 mr-1 flex items-center justify-center relative">
        <icon-squares-plus :class="{ 'group-hover:opacity-0': isStatic }" class="transition-opacity" />
        <icon-lock-closed
          v-if="isStatic"
          class="w-4 h-4 absolute opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
        />
      </div>

      <!-- Block Name -->
      <div class="flex-1 flex items-center gap-1 min-w-0">
        <span class="shrink-0">{{ blockSchemaName }}</span>
        <span v-if="blockLabel" class="italic text-gray-500 truncate text-xs">- {{ blockLabel }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-0.5">
        <!-- Remove button - only show on hover when not disabled and not static -->
        <button
          v-show="!blockData.disabled && !isStatic"
          @click.stop="remove"
          class="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          :title="t('block.remove')"
        >
          <icon-trash class="w-4 h-4" />
        </button>

        <!-- Eye button - always visible when disabled, only on hover when enabled -->
        <button
          @click.stop="() => toggle()"
          class="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
          :class="{ 'opacity-100': blockData.disabled, 'opacity-0 group-hover:opacity-100': !blockData.disabled }"
          :title="blockData.disabled ? t('block.show') : t('block.hide')"
        >
          <icon-eye-slash v-if="blockData.disabled" class="w-4 h-4" />
          <icon-eye v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Child Blocks - Always show when expanded and can have children to allow drops into empty containers -->
    <div v-if="canHaveChildren && isExpanded" class="ml-3 space-y-1">
      <VueDraggable
        :model-value="blockData.children"
        :animation="200"
        :group="{ name: 'blocks', pull: true, put: canAcceptChild }"
        ghost-class="ghost-block"
        chosen-class="chosen-block"
        drag-class="drag-block"
        filter=".is-static"
        @end="onChildDragEnd"
        @move="onChildMove"
      >
        <BlockItem v-for="child in children" :key="child.id" :block-id="child.id" :level="level + 1" />
      </VueDraggable>

      <!-- Show add button when empty -->
      <div v-if="!hasChildren" class="py-1">
        <button
          @click="handleAddFirstChild($event)"
          class="flex items-center gap-1.5 w-full p-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
        >
          <icon-plus class="w-3 h-3" />
          <span>{{ t('layers.addBlockToBlock') }}</span>
        </button>
      </div>
    </div>

    <AddBlockBtn
      :key="`add-block-${blockData.id}`"
      :block-id="blockData.id"
      v-if="canInsertNextSibling"
      @mouseenter="isActive = true"
      @mouseleave="isActive = false"
    />
  </div>
</template>
