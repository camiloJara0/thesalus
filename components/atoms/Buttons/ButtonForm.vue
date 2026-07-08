<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'primary'
  },
  variant: {
    type: String,
    default: 'solid'
  },
  size: {
    type: String,
    default: 'md'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const buttonClasses = computed(() => {
  const variants = {
    solid: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800',
    soft: 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    outline: 'border border-blue-600 hover:bg-blue-50 text-blue-600 dark:border-blue-400 dark:hover:bg-gray-900',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-200'
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'md:py-2 py-0.5 md:px-4 px-3 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  return [
    'font-semibold rounded-xl shadow transition-all duration-300 cursor-pointer active:scale-95',
    variants[props.variant] || variants.solid,
    sizes[props.size] || sizes.md,
    {
      'opacity-50 cursor-not-allowed': props.disabled,
      'opacity-75': props.loading
    },
    props.color
  ]
})
</script>

<template>
  <!-- Usar UButton de NuxtUI si está disponible -->
  <UButton
    v-if="$nuxt"
    class="w-full flex justify-center"
    :color="color"
    variant="solid"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :ui="{ rounded: 'rounded-xl' }"
  >
    <slot />
  </UButton>

  <!-- Fallback a button estándar -->
  <button 
    v-else
    :class="buttonClasses"
    class="text-center"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
/* Transiciones suaves */
button {
  transition: all 0.3s ease;
}

button:active:not(:disabled) {
  transform: scale(0.95);
}

/* Estados */
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

button:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
