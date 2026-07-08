<script setup lang="ts">
// Props compatibles con NuxtUI 3.3.7
const props = defineProps({
  // Valores del modelo
  modelValue: {
    type: [String, Number, Array],
    default: ''
  },
  // Items disponibles
  items: {
    type: Array,
    default: () => []
  },
  // Props estándar de NuxtUI
  placeholder: String,
  multiple: Boolean,
  searchable: Boolean,
  required: Boolean,
  disabled: Boolean,
  // Atributos HTML
  id: String,
  name: String,
  // Estilos de NuxtUI
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
  // Iconos
  trailingIcon: String,
  leadingIcon: String,
  // Claves para items complejos
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

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'update:open']);

// Fusionar propiedades antiguas con nuevas
const getMergedProps = () => {
  const old = props.Propiedades;
  return {
    placeholder: old.placeholder || props.placeholder || 'Seleccionar...',
    multiple: old.multiple || props.multiple,
    disabled: old.disabled || props.disabled,
    id: old.id || props.id,
    name: old.name || props.name,
    color: old.color || props.color,
    variant: old.variant || props.variant,
    size: old.size || props.size,
    items: old.options || props.items,
    valueKey: old.valueKey || props.valueKey,
    labelKey: old.labelKey || props.labelKey
  };
};

const mergedProps = computed(() => getMergedProps());
</script>
<template>
  <div class="w-full" :class="Propiedades.tamaño">
    <UFormField 
      v-if="Propiedades.label || Propiedades.name" 
      :label="Propiedades.label" 
      :name="Propiedades.name"
    >
      <USelect
        :model-value="modelValue"
        :items="mergedProps.items"
        :placeholder="mergedProps.placeholder"
        :multiple="mergedProps.multiple"
        :searchable="searchable"
        :required="required || Propiedades.required"
        :disabled="mergedProps.disabled"
        :id="mergedProps.id"
        :name="mergedProps.name"
        :color="mergedProps.color"
        :variant="mergedProps.variant"
        :size="mergedProps.size"
        :trailing-icon="trailingIcon"
        :leading-icon="leadingIcon"
        :value-key="mergedProps.valueKey"
        :label-key="mergedProps.labelKey"
        class="w-full"

        @update:model-value="value => {
          emit('update:modelValue', value)
          emit('change', value)               // aquí propagas el valor
          Propiedades.events?.onChange?.(value)
        }"
        @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
        @update:open="emit('update:open', $event)"
      >
        <!-- Slots para customización de items -->
        <template v-if="$slots['item-label']" #item-label="{ item }">
          <slot name="item-label" :item="item" />
        </template>

        <template v-if="$slots['item-leading']" #item-leading="{ item }">
          <slot name="item-leading" :item="item" />
        </template>

        <template v-if="$slots['item-trailing']" #item-trailing="{ item }">
          <slot name="item-trailing" :item="item" />
        </template>

        <!-- Slot por defecto -->
        <template v-if="$slots.default" #default>
          <slot />
        </template>
      </USelect>
    </UFormField>
    <!-- Si no es parte de un formulario -->
    <USelect
      v-else
      :model-value="modelValue"
      :items="mergedProps.items"
      :placeholder="mergedProps.placeholder"
      :multiple="mergedProps.multiple"
      :searchable="searchable"
      :required="required || Propiedades.required"
      :disabled="mergedProps.disabled"
      :id="mergedProps.id"
      :name="mergedProps.name"
      :color="mergedProps.color"
      :variant="mergedProps.variant"
      :size="mergedProps.size"
      :trailing-icon="trailingIcon"
      :leading-icon="leadingIcon"
      :value-key="mergedProps.valueKey"
      :label-key="mergedProps.labelKey"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
      @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
      @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
      @update:open="emit('update:open', $event)"
    >
      <!-- Slots para customización de items -->
      <template v-if="$slots['item-label']" #item-label="{ item }">
        <slot name="item-label" :item="item" />
      </template>

      <template v-if="$slots['item-leading']" #item-leading="{ item }">
        <slot name="item-leading" :item="item" />
      </template>

      <template v-if="$slots['item-trailing']" #item-trailing="{ item }">
        <slot name="item-trailing" :item="item" />
      </template>

      <!-- Slot por defecto -->
      <template v-if="$slots.default" #default>
        <slot />
      </template>
    </USelect>
  </div>
</template>