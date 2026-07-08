<script setup>
import { computed, watch } from 'vue';
import { useSeccionFooter } from '~/stores/NavigationFooter';
const footer = useSeccionFooter();
const subSeccion = computed(() => footer.secciones)
// Traer secciones del footer y boton activo
onMounted(() => {
    footer.seccionesGuardadas();
    const idGuardado = sessionStorage.getItem('seccionIdActivo');
    if (idGuardado) {
        footer.cambiarIdActivo(idGuardado);
    } else {
        footer.cambiarIdActivo(0)
    }
});

watch(() => footer.secciones,
    (nuevaSeccion) => {
        if (nuevaSeccion && nuevaSeccion.length > 0) {
            footer.cambiarIdActivo(0); // cambia al índice 0
        }
    }
);

</script>

<template>
    <div class="flex w-full items-center">
        <nuxt-link v-for="(pagina, key) in subSeccion" :to="pagina.ruta"
            class="subSeccion cursor-pointer text-gray-500 py-2 min-w-50 flex justify-center text-xs md:text-base hover:bg-[rgba(0,0,0,0.3)] hover:text-white"
            :class="{ 'active dark:bg-gray-900 bg-gray-50': footer.idActivo === key }" @click="footer.cambiarIdActivo(key)">
            {{ pagina.titulo }}
        </nuxt-link>
    </div>
</template>

<style scoped>
.subSeccion {
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}

.active {
    color: #fff;
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}
</style>