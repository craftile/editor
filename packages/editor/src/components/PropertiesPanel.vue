<script setup lang="ts">
  import { Accordion } from '@ark-ui/vue';

  const { t } = useI18n();
  const { selectedBlock } = useSelectedBlock();
  const { engine, setBlockProperty } = useCraftileEngine();
  const { propertyFields: propertyFieldConfigs } = useUI();

  const propertyFields = computed(() => {
    if (!selectedBlock.value) {
      return [];
    }

    const schema = engine.getBlockSchema(selectedBlock.value.type);

    if (!schema || !schema.properties) {
      return [];
    }

    return schema.properties;
  });

  const hasGroupedProperties = computed(() => {
    return propertyFields.value.some(field => field.group);
  });

  // Group properties by their group attribute
  const propertyGroups = computed(() => {
    if (!hasGroupedProperties.value) return [];

    const groups = new Map<string, { id: string; label: string; fields: any[] }>();

    propertyFields.value.forEach(field => {
      const groupId = field.group || 'default';
      const groupLabel = field.group || t('common.default');

      if (!groups.has(groupId)) {
        groups.set(groupId, {
          id: groupId,
          label: groupLabel,
          fields: []
        });
      }

      groups.get(groupId)!.fields.push(field);
    });

    return Array.from(groups.values());
  });

  // open the first group by default
  const defaultOpenGroups = computed(() => {
    if (propertyGroups.value.length === 0) {
      return [];
    }

    return [propertyGroups.value[0].id];
  });

  const getPropertyValue = (propertyId: string) => {
    return selectedBlock.value?.properties?.[propertyId];
  };

  function updateProperty(propertyId: string, value: any) {
    if (!selectedBlock.value) {
      return;
    }

    setBlockProperty(selectedBlock.value.id, propertyId, value);
  }

  function getFieldRenderer(fieldType: string) {
    const config = propertyFieldConfigs.value.find(config => config.type === fieldType);
    return config?.render || null;
  }
</script>

<template>
  <div v-if="selectedBlock">
    <template v-if="propertyFields.length > 0">
      <template v-if="hasGroupedProperties">
        <Accordion.Root
          class="w-full"
          :default-value="defaultOpenGroups"
          multiple
        >
          <Accordion.Item
            v-for="group in propertyGroups"
            :key="group.id"
            :value="group.id"
            class="border-b border-gray-100"
          >
            <Accordion.ItemTrigger class="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors">
              <span class="text-sm font-medium text-gray-700 capitalize">{{ group.label }}</span>
              <Accordion.ItemIndicator class="transition-transform duration-200 data-[state=open]:rotate-180">
                <icon-chevron-down class="w-4 h-4 text-gray-500" />
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent class="overflow-hidden">
              <div class="p-3">
                <PropertyField
                  v-for="field in group.fields"
                  :key="field.id"
                  :field="field"
                  :model-value="getPropertyValue(field.id)"
                  @update:model-value="updateProperty(field.id, $event)"
                />
              </div>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </template>
      <div
        v-else
        class="p-4"
      >
        <h4 class="text-sm font-medium text-gray-900 mb-3">{{ t('configPanels.properties') }}</h4>
        <PropertyField
          v-for="field in propertyFields"
          :key="field.id"
          :field="field"
          :renderer="getFieldRenderer(field.type)!"
          :model-value="getPropertyValue(field.id)"
          @update:model-value="updateProperty(field.id, $event)"
        />
      </div>
    </template>
    <div
      v-else
      class="text-center py-8"
    >
      <p class="text-sm text-gray-500">
        {{ t('configPanels.noProperties') }}
      </p>
    </div>
  </div>
</template>
