<template>
  <div :style="{ height: Propiedades.alto + 'px' }"></div>
</template>

<script setup>
const props = defineProps({
  Propiedades: { type: Object, }
})
</script>