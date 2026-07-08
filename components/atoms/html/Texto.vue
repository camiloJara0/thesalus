<template>
  <p class="text-sm mb-2">{{ props.Propiedades.texto }}</p>
</template>

<script setup>
const props = defineProps({
  Propiedades: { type: Object, required: true }
})
</script>