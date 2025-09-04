<script setup lang="ts">
  import { VueDraggable, type SortableEvent } from 'vue-draggable-plus';

  const props = defineProps<{
    blockId: any;
    level: number;
    isDragging?: boolean;
  }>();

  const { t } = useI18n();
  const isActive = ref(false);
  const { block: blockData, children, hasChildren, canHaveChildren, nextSibling, toggle, remove, moveChild } = useBlock(props.blockId);
  const { isExpanded: isExpandedFn, toggleExpanded: toggleExpandedFn } = useLayersPanel();
  const { getBlockLabelReactive } = useBlockLabel();

  const isExpanded = computed(() => isExpandedFn(props.blockId));
  const isStatic = computed(() => blockData.value?.static === true);
  const blockDisplayName = getBlockLabelReactive(props.blockId);
  const canInsertNextSibling = computed(() => {
    return !nextSibling.value || nextSibling.value.static !== true;
  });

  function handleAddFirstChild() { }

  function onChildDragEnd(event: SortableEvent) {
    const { oldIndex, newIndex } = event;

    if (typeof newIndex === 'undefined' || oldIndex === newIndex) {
      return;
    }

    const movedChild = children.value[oldIndex as number];

    if (!movedChild) {
      return;
    }

    moveChild(movedChild.id, newIndex);
  }

  function onChildMove(event: any) {
    if (event.related && event.related.classList.contains('is-static')) {
      return false;
    }
  }
</script>

<template>
  <div
    v-if="blockData"
    :class="{ 'bg-gray-100': isActive, 'is-static': isStatic }"
  >
    <div
      :data-block-id="blockData.id"
      class="flex items-center h-8 text-sm hover:bg-gray-50 cursor-pointer rounded-md group transition-all duration-200"
      :class="{
        'text-gray-700': !blockData.disabled,
        'text-gray-400': blockData.disabled
      }"
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
        <icon-chevron-right
          class="w-3 h-3 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
        />
      </button>
      <div
        v-else
        class="w-4 h-full"
      />

      <!-- Block Icon (show lock on hover for static blocks) -->
      <div class="w-4 h-4 mr-1 flex items-center justify-center relative">
        <icon-squares-plus
          :class="{ 'group-hover:opacity-0': isStatic }"
          class="transition-opacity"
        />
        <icon-lock-closed
          v-if="isStatic"
          class="w-4 h-4 absolute opacity-0 group-hover:opacity-100 transition-opacity text-gray-400"
        />
      </div>

      <!-- Block Name -->
      <span class="flex-1">{{ blockDisplayName }}</span>

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
          <icon-eye-slash
            v-if="blockData.disabled"
            class="w-4 h-4"
          />
          <icon-eye
            v-else
            class="w-4 h-4"
          />
        </button>
      </div>
    </div>

    <div
      v-if="!hasChildren && isExpanded"
      class="ml-3 py-1"
    >
      <button
        @click="handleAddFirstChild"
        class="flex items-center gap-1.5 w-full p-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
      >
        <icon-plus class="w-3 h-3" />
        <span>{{ t('layers.addBlockToBlock') }}</span>
      </button>
    </div>

    <!-- Child Blocks -->
    <div
      v-if="hasChildren && isExpanded"
      class="ml-3 space-y-1"
    >
      <VueDraggable
        :model-value="blockData.children"
        :animation="200"
        ghost-class="ghost-block"
        chosen-class="chosen-block"
        drag-class="drag-block"
        filter=".is-static"
        @end="onChildDragEnd"
        @move="onChildMove"
      >
        <BlockItem
          v-for="child in children"
          :key="child.id"
          :block-id="child.id"
          :level="level + 1"
        />
      </VueDraggable>
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
