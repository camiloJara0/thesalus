<script setup lang="ts">
import { ref, watch, computed } from 'vue';

// Select con búsqueda integrada - Compatible con NuxtUI 3.3.7
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  items: {
    type: Array,
    default: () => []
  },
  searchable: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: 'Buscar por nombre o valor...'
  },
  required: Boolean,
  disabled: Boolean,
  id: String,
  name: String,
  color: {
    type: String,
    default: 'primary'
  },
  variant: {
    type: String,
    default: 'outline'
  },
  size: {
    type: String,
    default: 'md'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  // Compatibilidad con estructura antigua
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'input']);

// Fusionar propiedades
const mergedProps = computed(() => {
  const old = props.Propiedades;
  return {
    items: old.options || props.items,
    placeholder: old.placeholder || props.placeholder,
    id: old.id || props.id,
    name: old.name || props.name,
    color: old.color || props.color,
    variant: old.variant || props.variant,
    size: old.size || props.size,
    disabled: old.disabled || props.disabled,
    valueKey: old.valueKey || props.valueKey,
    labelKey: old.labelKey || props.labelKey
  };
});
</script>

<template>
  <div class="w-full" :class="Propiedades.tamaño">
    <UFormField 
      v-if="Propiedades.label || Propiedades.name" 
      :label="Propiedades.label" 
      :name="Propiedades.name"
    >
      <UInputMenu
        :model-value="modelValue"
        :items="mergedProps.items"
        :placeholder="mergedProps.placeholder"
        :searchable="true"
        :required="required || Propiedades.required"
        :disabled="mergedProps.disabled"
        :id="mergedProps.id"
        :name="mergedProps.name"
        :color="mergedProps.color"
        :variant="mergedProps.variant"
        :size="mergedProps.size"
        :value-key="mergedProps.valueKey"
        :label-key="mergedProps.labelKey"
        class="w-full"
        @update:model-value="value => {
          emit('update:modelValue', value)
          emit('change', value)
          Propiedades.events?.onChange?.(value)
        }"
        @input="emit('input', $event); Propiedades.events?.onInput?.($event)"
        @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
      >
        <!--  Slots para customización -->
        <template v-if="$slots['item-label']" #item-label="{ item }">
          <slot name="item-label" :item="item" />
        </template>

        <template v-if="$slots['item-leading']" #item-leading="{ item }">
          <slot name="item-leading" :item="item" />
        </template>

        <template v-if="$slots['item-trailing']" #item-trailing="{ item }">
          <slot name="item-trailing" :item="item" />
        </template>


      </UInputMenu>
    </UFormField>
    <!-- Sin UFormField -->
    <USelect
      v-else
      :model-value="modelValue"
      :items="mergedProps.items"
      :placeholder="mergedProps.placeholder"
      :searchable="searchable"
      :required="required || Propiedades.required"
      :disabled="mergedProps.disabled"
      :id="mergedProps.id"
      :name="mergedProps.name"
      :color="mergedProps.color"
      :variant="mergedProps.variant"
      :size="mergedProps.size"
      :value-key="mergedProps.valueKey"
      :label-key="mergedProps.labelKey"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
      @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
      @input="emit('input', $event); Propiedades.events?.onInput?.($event)"
      @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
    >
      <!-- Slots para customización -->
      <template v-if="$slots['item-label']" #item-label="{ item }">
        <slot name="item-label" :item="item" />
      </template>

      <template v-if="$slots['item-leading']" #item-leading="{ item }">
        <slot name="item-leading" :item="item" />
      </template>

      <template v-if="$slots['item-trailing']" #item-trailing="{ item }">
        <slot name="item-trailing" :item="item" />
      </template>

      <template v-if="$slots.default" #default>
        <slot />
      </template>
    </USelect>
  </div>
</template>