<script setup lang="ts">
interface Props {
  zoomScale?: number;
}

const props = withDefaults(defineProps<Props>(), {
  zoomScale: 1,
});

const { t } = useI18n();
const { engine, getBlockById } = useCraftileEngine();
const { isEnabled, selectedBlockRect, iframeRect } = useInspector();
const { selectedBlock, canMoveToPrevious, canMoveToNext, moveToPrevious, moveToNext, duplicate, toggle, remove } =
  useSelectedBlock();

const toolbarElement = ref<HTMLElement>();
const toolbarDimensions = ref({ width: 200, height: 42 }); // Default fallback values

const isVisible = computed(() => {
  return (
    isEnabled.value &&
    selectedBlockRect.value &&
    iframeRect.value &&
    !selectedBlock.value?.disabled &&
    !selectedBlock.value?.ghost
  );
});

const isStaticBlock = computed(() => {
  return selectedBlock.value?.static === true;
});

const selectedBlockInfo = computed(() => {
  if (!selectedBlock.value) {
    return { name: t('common.block'), icon: '' };
  }

  const block = getBlockById(selectedBlock.value.id);
  if (!block) {
    return { name: t('common.block'), icon: '' };
  }

  const schema = engine.getBlockSchema(block.type);
  return {
    name: schema?.meta?.name || block.type || t('common.block'),
    icon: schema?.meta?.icon || '',
  };
});

const blockName = computed(() => selectedBlockInfo.value.name);
const blockIcon = computed(() => selectedBlockInfo.value.icon);

const shouldShowLabel = computed(() => {
  if (!selectedBlockRect.value || !blockName.value) return false;

  // Estimate label width (rough calculation)
  // Icon (14px) + gap (6px) + text + padding (20px)
  const estimatedLabelWidth = 14 + 6 + blockName.value.length * 7 + 20;
  return selectedBlockRect.value.width >= estimatedLabelWidth;
});

const wrapperStyle = computed(() => {
  if (!selectedBlockRect.value || !iframeRect.value) return {};

  return {
    position: 'absolute' as const,
    left: `${selectedBlockRect.value.left}px`,
    top: `${selectedBlockRect.value.top}px`,
    width: `${selectedBlockRect.value.width}px`,
    height: `${selectedBlockRect.value.height}px`,
  };
});

// Watch for toolbar element changes to get actual dimensions
watch(
  [toolbarElement, isVisible],
  async () => {
    if (toolbarElement.value && isVisible.value) {
      await nextTick();
      if (toolbarElement.value) {
        const rect = toolbarElement.value.getBoundingClientRect();
        toolbarDimensions.value = { width: rect.width, height: rect.height };
      }
    }
  },
  { immediate: true }
);

const toolbarStyle = computed(() => {
  if (!selectedBlockRect.value || !iframeRect.value) return {};

  const blockRect = selectedBlockRect.value;
  const canvasRect = iframeRect.value;
  const { width: toolbarWidth, height: toolbarHeight } = toolbarDimensions.value;
  const margin = 2; // Small margin from block edges
  const zoomScale = props.zoomScale; // Explicit dependency on zoom scale

  // Scale the block dimensions to compare with unscaled toolbar
  const scaledBlockWidth = blockRect.width * zoomScale;

  const shouldPositionBelow = blockRect.top - canvasRect.top < toolbarHeight + margin;

  const top = shouldPositionBelow ? blockRect.height + margin : -((toolbarHeight + margin) / zoomScale);

  // Determine if toolbar should be positioned from left or right
  // If toolbar fits within the scaled block width, position left, otherwise right
  const shouldPositionLeft = scaledBlockWidth <= toolbarWidth;

  const style: any = {
    position: 'absolute' as const,
    top: `${top}px`,
  };

  if (shouldPositionLeft) {
    style.left = '0px';
  } else {
    style.right = '0px';
  }

  return style;
});
</script>

<template>
  <div v-if="isVisible" class="absolute inset-0 w-full h-full pointer-events-none z-10" :style="wrapperStyle">
    <!-- Selected block label -->
    <div
      v-if="shouldShowLabel"
      class="absolute -top-[18.5px] left-0 bg-blue-500/95 text-white px-1 py-0.5 font-semibold text-[0.6rem] flex items-center gap-0.5 pointer-events-none whitespace-nowrap shadow-lg rounded-t"
    >
      <span
        class="w-3 h-3 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:fill-current"
        v-html="blockIcon"
      />
      <span>{{ blockName }}</span>
    </div>

    <!-- Selection highlight box -->
    <div class="absolute inset-0 border border-blue-500 bg-blue-500/5" />

    <!-- Selection toolbar positioned within highlight box boundaries -->
    <div
      ref="toolbarElement"
      class="absolute flex gap-0.5 bg-gray-800 rounded p-0.5 shadow-lg shadow-black/25 ring-1 ring-white/10 z-10 pointer-events-auto"
      :style="toolbarStyle"
    >
      <!-- Move Up Button -->
      <PreviewToolbarButton
        v-if="!isStaticBlock"
        :disabled="!canMoveToPrevious"
        :title="t('block.moveToPrevious')"
        @click="moveToPrevious"
      >
        <icon-arrow-long-up-16-solid class="w-3.5 h-3.5" />
      </PreviewToolbarButton>

      <!-- Move Down Button -->
      <PreviewToolbarButton
        v-if="!isStaticBlock"
        :disabled="!canMoveToNext"
        :title="t('block.moveToNext')"
        @click="moveToNext"
      >
        <icon-arrow-long-down-16-solid />
      </PreviewToolbarButton>

      <!-- Duplicate Button -->
      <PreviewToolbarButton v-if="!isStaticBlock" :title="t('block.duplicate')" @click="duplicate">
        <icon-document-duplicate-16-solid />
      </PreviewToolbarButton>

      <!-- Disable Button -->
      <PreviewToolbarButton :title="t('block.disable')" @click="toggle">
        <icon-eye-slash-16-solid />
      </PreviewToolbarButton>

      <!-- Remove Button -->
      <PreviewToolbarButton v-if="!isStaticBlock" variant="danger" :title="t('block.remove')" @click="remove">
        <icon-trash-16-solid />
      </PreviewToolbarButton>
    </div>
  </div>
</template>
