<script setup lang="ts">
// Props compatibles con NuxtUI 3.3.7
const props = defineProps({
  // Valores del modelo
  modelValue: {
    type: [Boolean, String, Number],
    default: false
  },
  // Props estándar de NuxtUI
  label: String,
  description: String,
  required: Boolean,
  disabled: Boolean,
  // Atributos HTML
  id: String,
  name: String,
  value: {
    type: [String, Number, Boolean],
    default: 'on'
  },
  // Estilos de NuxtUI
  color: {
    type: String,
    default: 'primary'
  },
  variant: {
    type: String,
    default: 'list'
  },
  size: {
    type: String,
    default: 'md'
  },
  indicator: {
    type: String,
    default: 'start'
  },
  // Iconos
  icon: String,
  indeterminateIcon: String,
  // Compatibilidad con estructura antigua
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

// Fusionar propiedades antiguas con nuevas
const getMergedProps = () => {
  const old = props.Propiedades;
  return {
    label: old.label || old.placeholder || props.label,
    description: old.description || props.description,
    disabled: old.disabled || props.disabled,
    id: old.id || props.id,
    name: old.name || props.name,
    color: old.color || props.color,
    variant: old.variant || props.variant,
    size: old.size || props.size,
    indicator: old.indicator || props.indicator,
    required: old.required || props.required
  };
};

const mergedProps = computed(() => getMergedProps());
</script>
<template>
  <UCheckbox
    :model-value="modelValue"
    :label="mergedProps.label"
    :description="mergedProps.description"
    :required="mergedProps.required"
    :disabled="mergedProps.disabled"
    :id="mergedProps.id"
    :name="mergedProps.name"
    :value="value"
    :color="mergedProps.color"
    :variant="mergedProps.variant"
    :size="mergedProps.size"
    :indicator="mergedProps.indicator"
    :icon="icon"
    :indeterminate-icon="indeterminateIcon"
    :class="Propiedades.tamaño"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
  >
    <!-- Slots para customización del label -->
    <template v-if="$slots.label" #label="{ label }">
      <slot name="label" :label="label" />
    </template>

    <!-- Slots para customización de la descripción -->
    <template v-if="$slots.description" #description="{ description }">
      <slot name="description" :description="description" />
    </template>

    <!-- Slot por defecto -->
    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </UCheckbox>
</template>