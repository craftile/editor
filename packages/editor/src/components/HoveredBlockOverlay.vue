<script setup lang="ts">
const emit = defineEmits<{
  insertBefore: [blockId: string, event: MouseEvent];
  insertAfter: [blockId: string, event: MouseEvent];
  buttonEnter: [blockId: string];
  buttonLeave: [blockId: string];
}>();

const { t } = useI18n();
const { engine, getBlockById } = useCraftileEngine();
const { isEnabled, iframeRect, hoveredBlockId, hoveredBlockRect, hoveredParentRect, parentFlexDirection } =
  useInspector();
const { selectedBlockId } = useSelectedBlock();

const isVisible = computed(() => {
  return isEnabled.value && hoveredBlockId.value && hoveredBlockId.value !== selectedBlockId.value;
});

const hoveredBlockInfo = computed(() => {
  if (!hoveredBlockId.value) {
    return { name: t('common.block'), icon: '' };
  }

  const block = getBlockById(hoveredBlockId.value);
  if (!block) {
    return { name: t('common.block'), icon: '' };
  }

  const schema = engine.getBlockSchema(block.type);
  return {
    name: schema?.meta?.name || block.type || t('common.block'),
    icon: schema?.meta?.icon || '',
  };
});

const blockName = computed(() => hoveredBlockInfo.value.name);
const blockIcon = computed(() => hoveredBlockInfo.value.icon);

const parentHighlightStyle = computed(() => {
  if (!hoveredParentRect.value || !iframeRect.value) {
    return {};
  }

  return {
    position: 'absolute' as const,
    left: `${hoveredParentRect.value.left}px`,
    top: `${hoveredParentRect.value.top}px`,
    width: `${hoveredParentRect.value.width}px`,
    height: `${hoveredParentRect.value.height}px`,
  };
});

const mainHighlightStyle = computed(() => {
  if (!hoveredBlockRect.value || !iframeRect.value) {
    return {};
  }

  return {
    position: 'absolute' as const,
    left: `${hoveredBlockRect.value.left}px`,
    top: `${hoveredBlockRect.value.top}px`,
    width: `${hoveredBlockRect.value.width}px`,
    height: `${hoveredBlockRect.value.height}px`,
  };
});
</script>

<template>
  <div v-if="isVisible" class="absolute top-0 left-0 w-full h-full pointer-events-none z-[1000]">
    <!-- Eldest parent highlight box -->
    <div
      v-if="hoveredParentRect"
      class="border border-dashed border-slate-400 bg-transparent pointer-events-none box-border absolute"
      :style="parentHighlightStyle"
    />

    <!-- Main highlight box with buttons -->
    <div
      class="border border-dashed border-blue-500 bg-transparent pointer-events-none box-border relative"
      :style="mainHighlightStyle"
    >
      <!-- Preview label -->
      <div
        class="bg-blue-500 text-white px-1 py-0.5 rounded-t font-medium text-[0.60rem] flex items-center gap-0.5 pointer-events-none absolute -left-[1px] -top-[19px]"
      >
        <span
          class="w-3 h-3 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current"
          v-html="blockIcon"
        />
        <span>{{ blockName }}</span>
      </div>

      <button
        class="w-4 h-4 bg-blue-500/90 border border-white/20 rounded-full flex items-center justify-center text-white cursor-pointer pointer-events-auto opacity-80 shadow-sm hover:opacity-100 hover:bg-blue-500 absolute"
        :class="{
          '-top-2 left-1/2 -translate-x-1/2': parentFlexDirection === 'column',
          '-left-2 top-1/2 -translate-y-1/2': parentFlexDirection === 'row',
        }"
        @mouseenter="emit('buttonEnter', hoveredBlockId!)"
        @mouseleave="emit('buttonLeave', hoveredBlockId!)"
        @click.stop="emit('insertBefore', hoveredBlockId!, $event)"
      >
        <icon-plus class="w-3 h-3 fill-current" />
      </button>

      <button
        class="w-4 h-4 bg-blue-500/90 border border-white/20 rounded-full flex items-center justify-center text-white cursor-pointer pointer-events-auto opacity-80 shadow-sm hover:opacity-100 hover:bg-blue-500 absolute"
        :class="{
          '-bottom-2 left-1/2 -translate-x-1/2': parentFlexDirection === 'column',
          '-right-2 top-1/2 -translate-y-1/2': parentFlexDirection === 'row',
        }"
        @mouseenter="emit('buttonEnter', hoveredBlockId!)"
        @mouseleave="emit('buttonLeave', hoveredBlockId!)"
        @click.stop="emit('insertAfter', hoveredBlockId!, $event)"
      >
        <icon-plus class="w-3 h-3 fill-current" />
      </button>
    </div>
  </div>
</template>
