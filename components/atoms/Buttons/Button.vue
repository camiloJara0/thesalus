<script setup>
const props = defineProps({
  Propiedades: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: [String, Number, Boolean],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'click']);

// Fusionar props antiguos con nuevos
const mergedProps = computed(() => {
  const legacy = props.Propiedades || {};
  return {
    color: legacy.color || 'primary',
    variant: legacy.variant || 'soft',
    size: legacy.size || 'md',
    icon: legacy.icon || null,
    disabled: legacy.disabled || false,
    loading: legacy.loading || false,
    label: legacy.texto || legacy.label || 'Button',
    class: legacy.clase || ''
  };
});
</script>

<template>
  <!-- Usar UButton de NuxtUI -->
   <div class="w-full" :class="Propiedades.tamaño">
    <UButton
      :icon="mergedProps.icon"
      :color="mergedProps.color"
      :variant="mergedProps.variant"
      :size="mergedProps.size"
      :disabled="mergedProps.disabled"
      :loading="mergedProps.loading"
      :ui="{ rounded: 'rounded-2xl' }"
      :class="['w-full flex justify-center', mergedProps.class]"
      @click="Propiedades.events?.onClick"
    >
      {{ mergedProps.label }}
      <slot />
    </UButton>
  </div>

  <!-- Fallback si Propiedades no tiene estructura UButton -->
  <button 
    v-if="!$nuxt"
    :disabled="mergedProps.disabled"
    :class="[
      'px-5 py-2 rounded-2xl font-semibold shadow-md transition-all duration-300 cursor-pointer active:scale-95',
      mergedProps.disabled
        ? 'bg-gray-400 cursor-not-allowed'
        : 'primary active:scale-95 text-white',
      mergedProps.class
    ]"
    @click="emit('click', $event)"
  >
    <span v-if="mergedProps.icon" class="mr-2">
      <i :class="mergedProps.icon" />
    </span>
    {{ mergedProps.label }}
    <slot />
  </button>
</template>

<style scoped>
/* Estilos de transición */
:deep(.ui-button) {
  transition: all 0.3s ease;
}

:deep(.ui-button:active) {
  transform: scale(0.95);
}
</style>
