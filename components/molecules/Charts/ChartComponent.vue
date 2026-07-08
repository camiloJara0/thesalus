<script setup>
const props = defineProps({
    Propiedades: {
        type: Object,
        required: true,
    },
})

</script>

<template>
  <div class="flex-col gap-2">
    <h3 class="text-2xl text-center text-black dark:text-white">{{ props.Propiedades.title  }}</h3>
    <LineChart
      :data="Propiedades.datos"
      :title="Propiedades.title"
      :categories="Propiedades.configuracion.categories"
      :index="Propiedades.configuracion.index"
      :type="Propiedades.configuracion.type"
      :height="Propiedades.configuracion.height"
      :xLabel="Propiedades.configuracion.xLabel"
      :yLabel="Propiedades.configuracion.yLabel"
      :stacked="true"
      :legend="true"
      :colors="['#3b82f6', '#10b981']"
      :yAxis="Propiedades.configuracion.yAxis"
      :tooltip="{ enabled: true }"
    />
  </div>
</template>
