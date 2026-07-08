<template>
  <div class="flex flex-col items-center mt-6" :class="Propiedades.contenedor">
    <div class="w-40 border-b border-black"></div>
    <span class="text-sm mt-1">{{ Propiedades.nombre }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  Propiedades: { type: Object, required: true }
})
</script>