<script setup>
import { computed } from 'vue';

const storeAside = useButtonsAside()
const varView = useVarView()
const route = useRoute()
const buttons = ref([])
const rol = ref('')

// Traer secciones del footer y boton activo
onMounted(() => {
    rol.value = varView.getPermisos
    buttons.value = storeAside.getbuttons(rol.value);
});

const secciones = computed(() => {
    const botonActual = buttons.value.find(btn =>
        btn.secciones.some(sec =>
            route.path.startsWith(sec.ruta)
        )
    );

    return botonActual?.secciones?.map(sec => ({
        ...sec,
        active: route.path === sec.ruta
    }));
});

const isActive = (path) => route.path === path
</script>

<template>
    <div class="flex w-full items-center">
        <nuxt-link v-for="(pagina, key) in secciones" :to="pagina.ruta"
            class="subSeccion select-none cursor-pointer py-2 md:min-w-50 min-w-28 flex justify-center text-xs bg-(--color-default-700) md:text-base hover:bg-(--color-default-600) hover:text-white"
            :class="{ 'active dark:bg-gray-900 bg-gray-50 dark:text-white text-black font-semibold pointer-events-none': isActive(pagina.ruta), 'text-white' : !isActive(pagina.ruta) }">
            {{ pagina.titulo }}
        </nuxt-link>
    </div>
</template>

<style scoped>
.subSeccion {
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}

.active {
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%);
}
</style>