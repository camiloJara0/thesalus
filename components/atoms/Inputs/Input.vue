<script setup lang="ts">
// Props compatibles con NuxtUI 3.3.7
const props = defineProps({
  // Valores del modelo
  modelValue: {
    type: [String, Number, Object],
    default: ''
  },
  // Props estándar de NuxtUI
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  icon: String,
  leading: Boolean,
  trailing: Boolean,
  // Atributos HTML
  id: String,
  name: String,
  minlength: [String, Number],
  maxlength: [String, Number],
  min: [String, Number],
  max: [String, Number],
  required: Boolean,
  disabled: Boolean,
  autocomplete: {
    type: String,
    default: 'on'
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
  // Propiedades adicionales
  leadingIcon: String,
  trailingIcon: String,
  loading: Boolean,
  loadingIcon: String,
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
    type: old.type || props.type,
    placeholder: old.placeholder || props.placeholder,
    icon: old.icon || props.icon,
    id: old.id || props.id,
    name: old.name || props.name,
    minlength: old.minlength || props.minlength,
    maxlength: old.maxlength || props.maxlength,
    min: old.min || props.min,
    max: old.max || props.max,
    disabled: old.disabled || props.disabled,
    color: old.color || props.color,
    variant: old.variant || props.variant,
    size: old.size || props.size
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
      <UInput
        :modelValue="modelValue"
        :type="mergedProps.type"
        :placeholder="mergedProps.placeholder"
        :icon="mergedProps.icon"
        :leading-icon="leadingIcon"
        :trailing-icon="trailingIcon"
        :id="mergedProps.id"
        :name="mergedProps.name"
        :minlength="mergedProps.minlength"
        :maxlength="mergedProps.maxlength"
        :min="mergedProps.min"
        :max="mergedProps.max"
        :required="required || Propiedades.required"
        :disabled="mergedProps.disabled"
        :autocomplete="autocomplete"
        :color="mergedProps.color"
        :variant="mergedProps.variant"
        :size="mergedProps.size"
        :loading="loading"
        :loading-icon="loadingIcon"
        :multiple="Propiedades.multiple"
        class="w-full my-input"
        @update:model-value="emit('update:modelValue', $event)"
        @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
        @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
        @keyup.enter="Propiedades.events?.onKeyUp?.($event)"
      >
        <!-- Slot leading -->
        <template v-if="$slots.leading" #leading>
          <slot name="leading" />
        </template>

        <!-- Slot trailing -->
        <template v-if="$slots.trailing" #trailing>
          <slot name="trailing" />
        </template>

        <!-- Slot default (para contenido adicional) -->
        <template v-if="$slots.default" #default>
          <slot />
        </template>
      </UInput>
      <div v-html="Propiedades.slot?.tooltip"></div>
    </UFormField>
    <!-- Si no es parte de un formulario -->
    <UInput
      v-else
      :modelValue="modelValue"
      :type="mergedProps.type"
      :placeholder="mergedProps.placeholder"
      :icon="mergedProps.icon"
      :leading-icon="leadingIcon"
      :trailing-icon="trailingIcon"
      :id="mergedProps.id"
      :name="mergedProps.name"
      :minlength="mergedProps.minlength"
      :maxlength="mergedProps.maxlength"
      :min="mergedProps.min"
      :max="mergedProps.max"
      :required="required || Propiedades.required"
      :disabled="mergedProps.disabled"
      :autocomplete="autocomplete"
      :color="mergedProps.color"
      :variant="mergedProps.variant"
      :size="mergedProps.size"
      :loading="loading"
      :loading-icon="loadingIcon"
      class="w-full"
      @update:model-value="emit('update:modelValue', $event)"
      @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
      @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
      @keyup.enter="Propiedades.events?.onKeyUp?.($event)"
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
    </UInput>
    <div v-html="Propiedades.slot?.tooltip"></div>
  </div>
</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}

input:invalid {
    border: 1px solid var(--color-red-500);
}

.my-input:invalid {
  border: 1px solid var(--color-red-500);
}

.inputIcon {
    padding: 5px 10px 5px 35px;
}

.inputSlot {
    padding: 5px 35px 5px 10px;
}

.iconInput {
    transform: translateY(-50%);
}

@layer utilities {

    /* Calendario y reloj */
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="datetime-local"]::-webkit-calendar-picker-indicator,
    input[type="month"]::-webkit-calendar-picker-indicator,
    input[type="week"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
        @apply dark:invert dark:brightness-0 dark:sepia dark:hue-rotate-180;
    }

    /* Botón de limpiar en search */
    input[type="search"]::-webkit-search-cancel-button {
        @apply dark:invert dark:brightness-0;
    }
}
</style>