<script setup lang="ts">
// Props compatibles con NuxtUI 3.3.7
const props = defineProps({
  // Valores del modelo
  modelValue: {
    type: String,
    default: ''
  },
  // Props estándar de NuxtUI
  placeholder: String,
  icon: String,
  leading: Boolean,
  trailing: Boolean,
  // Atributos HTML
  id: String,
  name: String,
  minlength: [String, Number],
  maxlength: [String, Number],
  required: Boolean,
  disabled: Boolean,
  autocomplete: {
    type: String,
    default: 'on'
  },
  // Configuración específica de Textarea
  rows: {
    type: Number,
    default: 3
  },
  autoresize: Boolean,
  maxrows: {
    type: Number,
    default: 0
  },
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
  leadingIcon: String,
  trailingIcon: String,
  loading: Boolean,
  loadingIcon: String,
  // Atributos de textarea
  lang: {
    type: String,
    default: 'es'
  },
  spellcheck: {
    type: Boolean,
    default: true
  },
  // Compatibilidad con estructura antigua
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

// Fusionar propiedades antiguas con nuevas
const getMergedProps = () => {
  const old = props.Propiedades;
  return {
    placeholder: old.placeholder || props.placeholder,
    icon: old.icon || props.icon,
    id: old.id || props.id,
    name: old.name || props.name,
    minlength: old.minlength || props.minlength,
    maxlength: old.maxlength || props.maxlength,
    disabled: old.disabled || props.disabled,
    color: old.color || props.color,
    variant: old.variant || props.variant,
    size: old.size || props.size,
    rows: old.rows || props.rows,
    autoresize: old.autoresize || props.autoresize,
    maxrows: old.maxrows || props.maxrows
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
      <UTextarea
        :model-value="modelValue"
        :placeholder="mergedProps.placeholder"
        :icon="mergedProps.icon"
        :leading-icon="leadingIcon"
        :trailing-icon="trailingIcon"
        :id="mergedProps.id"
        :name="mergedProps.name"
        :minlength="mergedProps.minlength"
        :maxlength="mergedProps.maxlength"
        :required="required || Propiedades.required"
        :disabled="mergedProps.disabled"
        :autocomplete="autocomplete"
        :color="mergedProps.color"
        :variant="mergedProps.variant"
        :size="mergedProps.size"
        :rows="mergedProps.rows"
        :autoresize="mergedProps.autoresize"
        :maxrows="mergedProps.maxrows"
        :loading="loading"
        :loading-icon="loadingIcon"
        :lang="lang"
        :spellcheck="spellcheck"
        class="w-full"
        @update:model-value="emit('update:modelValue', $event)"
        @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
        @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
      >
        <!-- Slot leading -->
        <template v-if="$slots.leading" #leading>
          <slot name="leading" />
        </template>

        <!-- Slot trailing -->
        <template v-if="$slots.trailing" #trailing>
          <slot name="trailing" />
        </template>

        <!-- Slot default -->
        <template v-if="$slots.default" #default>
          <slot />
        </template>
      </UTextarea>
    </UFormField>
    <!-- Si no es parte de un formulario -->
    <UTextarea
      v-else
      :model-value="modelValue"
      :placeholder="mergedProps.placeholder"
      :icon="mergedProps.icon"
      :leading-icon="leadingIcon"
      :trailing-icon="trailingIcon"
      :id="mergedProps.id"
      :name="mergedProps.name"
      :minlength="mergedProps.minlength"
      :maxlength="mergedProps.maxlength"
      :required="required || Propiedades.required"
      :disabled="mergedProps.disabled"
      :autocomplete="autocomplete"
      :color="mergedProps.color"
      :variant="mergedProps.variant"
      :size="mergedProps.size"
      :rows="mergedProps.rows"
      :autoresize="mergedProps.autoresize"
      :maxrows="mergedProps.maxrows"
      :loading="loading"
      :loading-icon="loadingIcon"
      :lang="lang"
      :spellcheck="spellcheck"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
      @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
      @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
    >
      <!-- Slot leading -->
      <template v-if="$slots.leading" #leading>
        <slot name="leading" />
      </template>

      <!-- Slot trailing -->
      <template v-if="$slots.trailing" #trailing>
        <slot name="trailing" />
      </template>

      <!-- Slot default -->
      <template v-if="$slots.default" #default>
        <slot />
      </template>
    </UTextarea>
  </div>
</template>