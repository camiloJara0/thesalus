<script setup>
import Titulo from '~/components/atoms/html/Titulo.vue'
import Texto from '~/components/atoms/html/Texto.vue'
import Tabla from '~/components/atoms/html/Tabla.vue'
import Firma from '~/components/atoms/html/Firma.vue'
import Espacio from '~/components/atoms/html/Espacio.vue'
import Imagen from '~/components/atoms/Images/Imagen.vue'

definePageMeta({
    layout: 'impresion'
})

const varView = useVarView()

onMounted(() => {
    console.log(varView.propiedadesPDF)
    document.title = varView.propiedadesPDF.filename;
    window.print()
})

const componentes = {
    Titulo,
    Texto,
    Tabla,
    Espacio,
    Firma,
    Imagen
}

function getValue(obj, path) {
    console.log(obj, path)
    if (!path) return undefined
    return path.split('.').reduce((acc, key) => acc[key], obj)
}
</script>

<template>
    <div class="absolute inset-0 bg-white text-black md:px-8 md:py-5 px-4 py-3 h-[100vh] z-999 print-page">
        <component v-for="component in varView.propiedadesPDF.components" :is="componentes[component.tipo]" :Propiedades="{
            ...component,
            disabled: true,
            ...(component.vmodel ? { texto: component.texto + getValue(tablaStore?.Formulario, component.vmodel) } : {}),
        }" />
    </div>
</template>

<style scoped>
/* Fuente base profesional */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Merriweather:wght@400;700&display=swap');

.print-page {
  font-family: 'Roboto', 'Merriweather', serif;
  color: #222; /* tono negro suave para mejor lectura */
  background: #fff;
  line-height: 1.6;
}

/* Encabezados */
.print-page h1, .print-page h2, .print-page h3 {
  font-family: 'Merriweather', serif;
  font-weight: 700;
  margin-bottom: 0.5em;
  color: #111;
}

/* Tablas */
.print-page table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.print-page table th {
  background: #f0f0f0;
  font-weight: 600;
  text-align: left;
  padding: 8px;
  border: 1px solid #ccc;
}

.print-page table td {
  padding: 8px;
  border: 1px solid #ccc;
}

/* Componentes */
.print-page .component {
  margin-bottom: 1.2em;
}

/* Estilo para impresión */
@media print {
  body {
    margin: 0;
    -webkit-print-color-adjust: exact; /* asegura colores */
  }
  .print-page {
    box-shadow: none;
    border: none;
  }
}

</style>