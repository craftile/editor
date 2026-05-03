<script setup lang="ts">
import { ColorPicker, parseColor, type Color } from '@ark-ui/vue/color-picker';
import type { PropertyField } from '@craftile/types';
import { ref, watch } from 'vue';

interface Props {
  field: PropertyField;
}

defineProps<Props>();

const recentColors = ref<Color[]>([]);
const maxRecentColors = 8;

const value = defineModel({
  get: (val: string) => {
    try {
      return parseColor(val || '#000000');
    } catch {
      return parseColor('#000000');
    }
  },
  set: (color: Color) => color.toString('hexa'),
});

const formatAlpha = (color?: Color) => {
  const alpha = color?.getChannelValue('alpha') ?? 1;
  return Number(alpha.toFixed(2)).toString();
};

const alphaInput = ref(formatAlpha(value.value));
const alphaInputFocused = ref(false);

watch(value, (color) => {
  if (!alphaInputFocused.value) {
    alphaInput.value = formatAlpha(color);
  }
});

const updateAlpha = (newValue: string): boolean => {
  const parsedAlpha = Number.parseFloat(newValue.replace(',', '.'));
  if (Number.isNaN(parsedAlpha)) {
    return false;
  }

  const alpha = Math.min(1, Math.max(0, parsedAlpha));
  value.value = (value.value ?? parseColor('#000000')).withChannelValue('alpha', alpha) as Color;
  return true;
};

const handleAlphaInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  alphaInput.value = input.value;
  updateAlpha(input.value);
};

const handleAlphaBlur = () => {
  alphaInputFocused.value = false;
  if (!updateAlpha(alphaInput.value)) {
    alphaInput.value = formatAlpha(value.value);
    return;
  }

  alphaInput.value = formatAlpha(value.value);
};

const handleValueChange = (details: { value: Color }) => {
  const existingIndex = recentColors.value.findIndex((color) => color.toHexInt() === details.value.toHexInt());
  if (existingIndex !== -1) {
    recentColors.value.splice(existingIndex, 1);
  }

  recentColors.value.unshift(details.value);

  if (recentColors.value.length > maxRecentColors) {
    recentColors.value = recentColors.value.slice(0, maxRecentColors);
  }
};
</script>

<template>
  <ColorPicker.Root v-model="value" format="rgba" class="flex flex-col gap-1.5" @value-change-end="handleValueChange">
    <ColorPicker.Label class="block text-sm font-medium text-gray-700 mb-1">
      {{ field.label }}
    </ColorPicker.Label>

    <ColorPicker.Control class="flex gap-2">
      <ColorPicker.Trigger
        class="appearance-none rounded cursor-pointer inline-flex items-center justify-center outline-none h-10 min-w-10 gap-2 border border-gray-300"
      >
        <ColorPicker.TransparencyGrid class="rounded" />
        <ColorPicker.ValueSwatch class="h-7 w-7 rounded shadow" />
      </ColorPicker.Trigger>

      <div class="flex">
        <ColorPicker.ChannelInput
          channel="hex"
          class="appearance-none rounded-l bg-none outline-0 relative w-full border border-r-0 px-3 h-10 min-w-10 focus:ring focus:ring-accent"
        />

        <input
          :value="alphaInput"
          type="number"
          inputmode="decimal"
          step="0.01"
          min="0"
          max="1"
          class="appearance-none rounded-r bg-none outline-0 flex-none w-14 border border-gray-300 px-2 h-10 text-xs font-medium text-gray-600 text-center focus:ring focus:ring-accent"
          @focus="alphaInputFocused = true"
          @input="handleAlphaInput"
          @blur="handleAlphaBlur"
        />
      </div>
    </ColorPicker.Control>

    <Teleport to=".__craftile">
      <ColorPicker.Positioner class="w-60 !z-20 pl-1">
        <ColorPicker.Content
          class="flex flex-col p-4 gap-3 rounded bg-white border shadow-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out data-[state=closed]:hidden"
        >
          <ColorPicker.Area class="rounded overflow-hidden h-36 touch-none forced-color-adjust-none">
            <ColorPicker.AreaBackground class="h-full rounded" />
            <ColorPicker.AreaThumb class="rounded-full w-2.5 h-2.5 outline-none border-2 border-white" />
          </ColorPicker.Area>

          <div class="flex gap-2">
            <ColorPicker.EyeDropperTrigger
              class="appearance-none rounded cursor-pointer inline-flex outline-none relative select-none items-center justify-center border h-8 min-w-8"
            >
              <icon-eye-dropper class="w-4 h-4" />
            </ColorPicker.EyeDropperTrigger>

            <div class="flex flex-col gap-2 w-full">
              <ColorPicker.ChannelSlider channel="hue" class="rounded w-full">
                <ColorPicker.ChannelSliderTrack class="h-2.5 rounded" />
                <ColorPicker.ChannelSliderThumb
                  class="h-2.5 w-2.5 cursor-pointer rounded-full outline-none border-2 border-white -translate-x-1/2 -translate-y-1/2"
                />
              </ColorPicker.ChannelSlider>
              <ColorPicker.ChannelSlider channel="alpha" class="rounded w-full">
                <ColorPicker.TransparencyGrid />
                <ColorPicker.ChannelSliderTrack class="h-2.5 rounded" />
                <ColorPicker.ChannelSliderThumb
                  class="h-2.5 w-2.5 cursor-pointer rounded-full outline-none border-2 border-white -translate-x-1/2 -translate-y-1/2"
                />
              </ColorPicker.ChannelSlider>
            </div>
          </div>

          <ColorPicker.View format="rgba" class="flex gap-3">
            <ColorPicker.ChannelInput
              channel="hex"
              class="flex-1 border px-3 h-8 w-0 rounded outline-0 focus:ring focus:ring-accent"
            />
            <ColorPicker.ChannelInput
              channel="alpha"
              class="flex-none border px-3 h-8 rounded outline-0 focus:ring-2 focus:ring-accent"
            />
          </ColorPicker.View>

          <div v-if="recentColors.length > 0" class="mt-3">
            <div class="text-xs font-medium text-gray-600 mb-2">Recent Colors</div>
            <ColorPicker.SwatchGroup class="grid grid-cols-8 gap-1">
              <ColorPicker.SwatchTrigger
                v-for="color in recentColors"
                :key="color.toHexInt()"
                :value="color"
                class="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
              >
                <ColorPicker.Swatch :value="color" class="w-full h-full rounded" />
              </ColorPicker.SwatchTrigger>
            </ColorPicker.SwatchGroup>
          </div>
        </ColorPicker.Content>
      </ColorPicker.Positioner>
    </Teleport>

    <ColorPicker.HiddenInput />
  </ColorPicker.Root>
</template>
