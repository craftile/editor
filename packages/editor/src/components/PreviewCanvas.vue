<script setup lang="ts">
  const { currentDeviceData } = useDeviceMode();
  const { currentPreviewUrl, registerFrame } = usePreview();

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

  const onFrameLoad = (event: Event) => {
    registerFrame(event.target as HTMLIFrameElement);
  };
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
    </div>
  </div>
</template>
