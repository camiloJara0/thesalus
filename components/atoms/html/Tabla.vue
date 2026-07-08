<script setup type="">
const props = defineProps({
  Propiedades: { type: Object, required: true },
});

function esHTML(texto) {
  const regex = /<\/?[a-z][\s\S]*>/i;
  return regex.test(texto);
};

</script>

<template>
  <table class="w-full text-sm mb-4" :class="[Propiedades.container, {'border-custom' : props.Propiedades.border === true}]" :style="Propiedades.styles" >
    <thead>
      <tr>
        <th v-for="col in Propiedades.columnas" :key="col" class="px-2 py-1 ">
          <span v-if="esHTML(col)" v-html="col"></span>
          <p v-if="!esHTML(col)">{{ col }}</p>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(fila, i) in Propiedades.filas" :key="i">
        <td v-for="(valor, j) in fila" :key="j" class="px-2 py-1">
          <span v-if="esHTML(valor)" v-html="valor"></span>
          <p v-if="!esHTML(valor)">{{ valor }}</p>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.border-custom th, td {
  border: 1px solid #000;
}

</style>