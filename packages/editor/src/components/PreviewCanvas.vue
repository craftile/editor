<script setup lang="ts">
  const { currentDeviceData } = useDeviceMode();
  const { currentPreviewUrl, registerFrame, sendMessage } = usePreview();
  const { updateIframeRect } = useInspector();
  const { open: openBlocksPopover, getInsertionContext } = useBlocksPopover();

  const canvasContainer = ref<HTMLElement>();
  const previewWrapper = ref<HTMLElement>();

  const currentDeviceWidth = computed(() => currentDeviceData.value?.width);

  const getContainerWidth = () => {
    return previewWrapper.value?.getBoundingClientRect().width || 0;
  };

  const zoomScale = computed(() => {
    const availableWidth = getContainerWidth();

    if (availableWidth <= 0) {
      return 1;
    }

    if (!currentDeviceWidth.value || currentDeviceWidth.value === 0) {
      return 1;
    }

    // If device width fits, use 1:1 scale
    if (currentDeviceWidth.value <= availableWidth) {
      return 1;
    }

    // Calculate scale so the scaled canvas width exactly matches the available width
    const scale = availableWidth / currentDeviceWidth.value;
    return Math.min(scale, 1);
  });

  const canvasStyle = computed(() => {
    const scale = zoomScale.value;

    // For "fit" mode, use 100% width to fill container
    const width = currentDeviceWidth.value === 0
      ? '100%'
      : `${currentDeviceWidth.value}px`;

    // Disable transform for fit mode
    const transform = currentDeviceWidth.value === 0
      ? 'none'
      : `scale(${scale})`;

    return {
      width,
      height: `${100 / scale}%`,
      transform,
      transformOrigin: '0 0'
    };
  });

  const updateIframePosition = () => {
    if (canvasContainer.value) {
      const rect = canvasContainer.value.getBoundingClientRect();
      updateIframeRect(rect);
    }
  };

  const onFrameLoad = (event: Event) => {
    registerFrame(event.target as HTMLIFrameElement);
    updateIframePosition();
  };

  const handleOverlayButtonHover = (blockId: string) => {
    sendMessage('craftile.inspector.overlay-button-enter', { blockId })
  }

  const handleOverlayButtonLeave = (blockId: string) => {
    sendMessage('craftile.inspector.overlay-button-leave', { blockId })
  }


  const handleInsertBefore = (targetBlockId: string, event: MouseEvent) => {
    const context = getInsertionContext(targetBlockId, 'before');
    openBlocksPopover({
      anchor: event.target as HTMLElement,
      context
    });
  };

  const handleInsertAfter = (targetBlockId: string, event: MouseEvent) => {
    const context = getInsertionContext(targetBlockId, 'after');
    openBlocksPopover({
      anchor: event.target as HTMLElement,
      context
    });
  };

  onMounted(() => {
    window.addEventListener('scroll', updateIframePosition);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', updateIframePosition);
  });
</script>

<template>
  <div
    ref="previewWrapper"
    class="h-full w-full relative preview-wrapper overflow-hidden"
  >
    <div
      ref="canvasContainer"
      class="bg-white mx-auto rounded-xs relative transition-transform duration-300 ease-out"
      :style="canvasStyle"
    >
      <iframe
        ref="previewFrame"
        :src="currentPreviewUrl"
        class="w-full h-full border-0 preview-iframe"
        @load="onFrameLoad"
      />

      <HoveredBlockOverlay
        @button-enter="handleOverlayButtonHover"
        @button-leave="handleOverlayButtonLeave"
        @insert-before="handleInsertBefore"
        @insert-after="handleInsertAfter"
      />

      <SelectedBlockOverlay />
    </div>
  </div>
</template>
