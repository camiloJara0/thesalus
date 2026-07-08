<script setup>
const props = defineProps({
    Propiedades: {
        type: Object,
        default: {}
    }
});

</script>
<template>
    <div :class="Propiedades.contenedor">
        <img :src="Propiedades.src" :alt="Propiedades.alt"
            :class="Propiedades.tamaño"/>
            <span v-html="Propiedades.html"></span>
    </div>

</template>