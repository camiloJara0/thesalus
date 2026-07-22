<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import Form from '../Forms/Form.vue';
import { storeToRefs } from 'pinia'
import { useProfesionesActions } from '~/composables/Entidades/Profesiones.js';
import { useProfesionStore } from '~/stores/Entidades/Profesion.js';
import { useProfesionesBuilder } from '~/build/Empresa/useProfesionesBuilder.js';

const varView = useVarView()
const store = useProfesionStore()
const { hasPermiso } = usePermisos()
const puedePostProfesion = hasPermiso('Datos_post')
const puedePutProfesion = hasPermiso('Datos_put')
const notificaciones = useNotificacionesStore()

// Usar storeToRefs para mantener reactividad
const { showNuevaProfesion, showModificarProfesion } = storeToRefs(store)

const {
    agregarProfesion,
    modificarProfesion,
    cerrar,
    eliminarProfesion
} = useProfesionesActions({
    profesionStore: store,
    varView,
    notificaciones,
})

const secciones = ref([])

onMounted(async () => {
    secciones.value = await store.listSecciones()
})

const propiedadesProfesion = puedePostProfesion
    ? computed(() => {
        return useProfesionesBuilder({
            storeId: 'Profesion',
            storePinia: 'Profesion',
            permisos: secciones.value,
            showModificarProfesion: showModificarProfesion,
            actualizar: true,
            eliminar: false,
            showModificarProfesion: showNuevaProfesion,
            cerrar
        })
    })
    : null;

const propiedadesVerProfesion = puedePutProfesion
    ? computed(() => {
        return useProfesionesBuilder({
            storeId: 'ActualizarProfesion',
            storePinia: 'Profesion',
            permisos: secciones.value,
            actualizar: true,
            eliminar: eliminarProfesion,
            showModificarProfesion: showModificarProfesion,
            cerrar
        })
    })
    : null;
</script>
<template>
    <div>
        <Form :Propiedades="propiedadesProfesion"></Form>
        <Form :Propiedades="propiedadesVerProfesion"></Form>
    </div>
</template>
