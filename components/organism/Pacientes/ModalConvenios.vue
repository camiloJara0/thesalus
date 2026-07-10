<script setup>
import Form from '../Forms/Form.vue';
import { useConvenioStore } from '~/stores/Entidades/Convenio';
import { useConvenioActions } from '~/composables/Entidades/Convenio.js';
import { useConvenioBuilder } from '~/build/Convenios/useConvenioBuilder';
import { storeToRefs } from 'pinia'

const varView = useVarView()
const store = useConvenioStore()
const puedeVer = varView.getPermisos.includes('Convenios_view');
const puedeGet = varView.getPermisos.includes('Convenios_get');
const puedePost = varView.getPermisos.includes('Convenios_post');
const puedePut = varView.getPermisos.includes('Convenios_put');
const notificaciones = useNotificacionesStore()

// Usar storeToRefs para mantener reactividad
const { showNuevoConvenio, showModificarConvenio } = storeToRefs(store)

const {
  agregarConvenio,
  verConvenio,
  cerrar,
  eliminarConvenios
} = useConvenioActions({
  notificaciones,
})

const propiedadesConvenio = puedePost
  ? computed(() => {
    return useConvenioBuilder({
      storeId: 'ConvenioNuevo',
      storePinia: 'Convenio',
      cerrarModal: cerrar,
      show: showNuevoConvenio,
      tipoFormulario: 'Wizard',
      verUser: true,
      eliminar: eliminarConvenios,
      soloVer: varView.soloVer,
    })
  })
  : null;

const propiedadesVerConvenio = puedePut
  ? useConvenioBuilder({
    storeId: 'ConvenioNuevo',
    storePinia: 'Convenio',
    cerrarModal: cerrar,
    show: showModificarConvenio,
    tipoFormulario: 'Wizard',
    eliminar: eliminarConvenios,
  })
  : null;
</script>

<template>
  <div>
    <Form v-if="propiedadesConvenio" :Propiedades="propiedadesConvenio"></Form>
    <Form v-if="propiedadesVerConvenio" :Propiedades="propiedadesVerConvenio"></Form>
  </div>
</template>
