<script setup>
const props = defineProps({
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});
</script>

<template>
  <a
    :href="Propiedades.href || '#'"
    :target="Propiedades.target || '_self'"
    :class="[
      'relative font-medium transition-all duration-300 hover:text-blue-500',
      'after:content-[\'\'] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full',
      Propiedades.clase
    ]"
    @click="Propiedades.events?.onClick"
  >
    {{ Propiedades.texto }}
  </a>
</template>
