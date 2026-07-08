<script setup lang="ts">
// Props compatibles con NuxtUI 3.3.7
const props = defineProps({
  // Valores del modelo
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
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
  size: {
    type: String,
    default: 'md'
  },
  items: {
    type: Array,
    default: () => []
  },
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
    ietms: old.options || props.items,
    description: old.description || props.description,
    disabled: old.disabled || props.disabled,
    id: old.id || props.id,
    name: old.name || props.name,
    value: old.value || props.value,
    color: old.color || props.color,
    size: old.size || props.size,
    required: old.required || props.required
  };
};

const mergedProps = computed(() => getMergedProps());
</script>
<template>
    <UFormField 
      v-if="Propiedades.label || Propiedades.name" 
      :label="Propiedades.label" 
      :name="Propiedades.name"
      class="mb-2 capitalize"
    >
  <URadioGroup

    :label="mergedProps.label"
    :description="mergedProps.description"
    :required="mergedProps.required"
    :disabled="mergedProps.disabled"
    :id="mergedProps.id"
    :name="mergedProps.name"
    :value="mergedProps.value"
    :color="mergedProps.color"
    :size="mergedProps.size"
    :items="props.Propiedades.options"
    orientation="horizontal"
    indicator="end" variant="card"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
  >
  </
    <!-- Slots para customización -->
    <!-- <template v-if="$slots.label" #label="{ label }">
      <slot name="label" :label="label" />
    </template>

    <template v-if="$slots.description" #description="{ description }">
      <slot name="description" :description="description" />
    </template>

    <template v-if="$slots.default" #default>
      <slot />
    </template> -->
  </URadioGroup>
  </UFormField> 
</template>
