<script setup lang="ts">
import { usePasswordVisibilityStore } from '~/stores/passwordVisibility'

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
  fieldId: String,
  // Compatibilidad con estructura antigua
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

// Store de visibilidad de contraseña
const passwordStore = usePasswordVisibilityStore()

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

// Usar el fieldId del props o del id
const currentFieldId = computed(() => props.fieldId || props.id || 'default-password');

// Obtener visibilidad desde el store
const show = computed(() => passwordStore.getVisibility(currentFieldId.value));

// Toggle visibilidad
const togglePasswordVisibility = () => {
  passwordStore.toggleVisibility(currentFieldId.value);
};

// Determinar tipo de input basado en visibilidad
const inputType = computed(() => {
  return show.value ? 'text' : 'password';
});
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
        :type="inputType"
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
        class="w-full"
        @update:model-value="emit('update:modelValue', $event)"
        @blur="emit('blur', $event); Propiedades.events?.onBlur?.($event)"
        @change="emit('change', $event); Propiedades.events?.onChange?.($event)"
        @keyup.enter="Propiedades.events?.onKeyUp?.($event)"
      >
        <!-- Slot leading -->
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="show ? 'Esconder contraseña' : 'Ver contraseña'"
            :aria-pressed="show"
            aria-controls="password"
            @click="togglePasswordVisibility"
          />
        </template>
      </UInput>
    </UFormField>
    <!-- Si no es parte de un formulario -->
    <UInput
      v-else
      :modelValue="modelValue"
      :type="inputType"
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
      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="show ? 'Hide password' : 'Show password'"
          :aria-pressed="show"
          aria-controls="password"
          @click="togglePasswordVisibility"
        />
      </template>
    </UInput>
  </div>
</template>

<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}

input:invalid {
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
</style>