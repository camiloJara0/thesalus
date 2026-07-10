<script setup>
import { useEpsBuilder } from '~/build/Empresa/useEpsBuilder'
import { ref, computed, watch } from 'vue'
import Form from '../Forms/Form.vue';
import { useEpsActions } from '~/composables/Entidades/Eps.js';
import { useEpsStore } from '~/stores/Entidades/Eps.js';
import { storeToRefs } from 'pinia'

const varView = useVarView()
const store = useEpsStore()
const puedePostEPS = varView.getPermisos.includes('Datos_post');
const puedePutEPS = varView.getPermisos.includes('Datos_put');
const notificaciones = useNotificacionesStore()

// Usar storeToRefs para mantener reactividad
const { showNuevaEps, showModificarEps } = storeToRefs(store)

const {
    agregarEps,
    verEps,
    cerrar,
    eliminarEps
} = useEpsActions({
    notificaciones,
})

const propiedadesEPS = puedePostEPS
    ? useEpsBuilder({
            storeId: 'EPS',
            storePinia: 'EPS',
            actualizar: true,
            showModificarEPS: showNuevaEps,
            cerrar: cerrar,
        })
    : null;

const propiedadesVerEPS = puedePutEPS
    ? useEpsBuilder({
        storeId: 'ActualizarEPS',
        storePinia: 'EPS',
        actualizar: true,
        showModificarEPS: showModificarEps,
        cerrar: cerrar,
        eliminar: eliminarEps
    })
    : null;
</script>
<template>
    <div>
        <Form v-if="propiedadesEPS" :Propiedades="propiedadesEPS"></Form>
        <Form v-if="propiedadesVerEPS" :Propiedades="propiedadesVerEPS"></Form>
    </div>
</template>
