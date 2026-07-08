<script setup>
const props = defineProps({
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});
</script>

<template>
  <div class="relative flex items-center w-fit">
    <!-- Elemento trigger -->
    <slot />

    <!-- Tooltip -->
    <span
      class="absolute left-1/2 -translate-x-1/2 -bottom-10 px-3 py-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none"
    >
      {{ Propiedades.texto }}
    </span>
  </div>
</template>
