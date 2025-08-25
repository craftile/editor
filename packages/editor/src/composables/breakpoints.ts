import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue';

const DEFAULT_BREAKPOINTS = {
  small: 640,
  medium: 768,
  large: 1024,
  extraLarge: 1280,
  extraExtraLarge: 1536,
} as const;

interface UseBreakpointsReturn {
  width: Ref<number>;

  isSmall: ComputedRef<boolean>;
  isMedium: ComputedRef<boolean>;
  isLarge: ComputedRef<boolean>;
  isExtraLarge: ComputedRef<boolean>;
  isExtraExtraLarge: ComputedRef<boolean>;
}

export function useBreakpoints(): UseBreakpointsReturn {
  const windowWidth = ref(0);

  const updateWidth = (): void => {
    windowWidth.value = window.innerWidth;
  };

  const isSmall = computed((): boolean => {
    return windowWidth.value >= DEFAULT_BREAKPOINTS.small;
  });

  const isMedium = computed((): boolean => {
    return windowWidth.value >= DEFAULT_BREAKPOINTS.medium;
  });

  const isLarge = computed((): boolean => {
    return windowWidth.value >= DEFAULT_BREAKPOINTS.large;
  });

  const isExtraLarge = computed((): boolean => {
    return windowWidth.value >= DEFAULT_BREAKPOINTS.extraLarge;
  });

  const isExtraExtraLarge = computed((): boolean => {
    return windowWidth.value >= DEFAULT_BREAKPOINTS.extraExtraLarge;
  });

  onMounted((): void => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
  });

  onUnmounted((): void => {
    window.removeEventListener('resize', updateWidth);
  });

  return {
    width: windowWidth,

    isSmall,
    isMedium,
    isLarge,
    isExtraLarge,
    isExtraExtraLarge,
  };
}
