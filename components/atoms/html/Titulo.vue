<template>
  <h1 class="text-sm font-bold text-center mb-4">{{ props.Propiedades.texto }}</h1>
</template>

<script setup>
const props = defineProps({
  Propiedades: { type: Object, required: true }
})
</script>