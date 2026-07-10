<script setup>
import { useEpsActions } from '~/composables/Entidades/Eps.js';
import { useEpsStore } from '~/stores/Entidades/Eps.js';
import { storeToRefs } from 'pinia';
import { useOrdenamiento } from '~/composables/Tabla/useDatosOrdenadosTabla';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Restringido from '../NoEnviados/Restringido.vue';

const store = useEpsStore()
const varView = useVarView()
const notificaciones = useNotificacionesStore()
const mostrarFiltros = ref(false)
const { Eps } = storeToRefs(store)

const puedeVer = varView.getPermisos.includes('Datos_view');
const puedeGet = varView.getPermisos.includes('Datos_get');
const puedePost = varView.getPermisos.includes('Datos_post');
const puedePut = varView.getPermisos.includes('Datos_put');
const puedeDelete = varView.getPermisos.includes('Datos_delete');

const {
  agregarEps,
  verEps,
  cerrar,
  eliminarEps
} = useEpsActions({
  notificaciones,
})

const {
  busqueda,
  filtros,
  filtrosConOpciones,
  sortedItems,
  datosOrdenados,
  columnaOrden,
  menorAMayor,
  borrarFiltros
} = useOrdenamiento(Eps, [], []);

function getAcciones(item) {
  return [
    {
      label: 'Editar',
      icon: 'i-lucide-edit-2',
      onSelect: () => verEps(item),
      disabled: !puedePut
    },
    {
      label: 'Eliminar',
      icon: 'i-lucide-trash-2',
      onSelect: () => eliminarEps(item),
      disabled: !puedeDelete
    }
  ]
}

function llamaDatos () {
  store.traer(true, true)
  varView.datosActualizados()
}

</script>

<template>
  <UCard v-if="puedeVer" :ui="{ body: { padding: 'p-6' }, header: { padding: 'p-6' } }" class="bg-white dark:bg-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-linear-to-br from-green-100 to-green-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <i class="fa-solid fa-hospital text-green-600 dark:text-green-400 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">Aseguradoras (EPS)</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ Eps.length }} registradas</p>
          </div>
        </div>
        <div class="flex gap-2">

          <UButton icon="i-lucide-filter" color="neutral" variant="outline" @click="mostrarFiltros = !mostrarFiltros">
            Filtrar
          </UButton>
          <UButton icon="i-lucide-plus" :disabled="!puedePost" @click="agregarEps">
            Agregar
          </UButton>
          <UButton icon="i-lucide-cloud-sync" variant="subtle" color="primary" @click="llamaDatos"/>
        </div>
      </div>
      <div v-if="mostrarFiltros" class="w-full">
        <div class="w-full py-4">
          <USeparator></USeparator>
        </div>
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-filter text-gray-400"></i>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
              Filtros de la tabla
              <span v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
                class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                Filtros activos
              </span>
            </p>
          </div>

          <div class="flex gap-2">
            <ButtonRounded @click="columnaOrden = 'nombre'"
              :color="columnaOrden ? 'bg-blue-800 dark:bg-blue-700' : 'bg-gray-800 text-gray-700 dark:bg-gray-700 dark:text-gray-200'"
              tooltip="Ordenar A-Z">
              <i class="fa-solid fa-up-down"></i>
            </ButtonRounded>
            <ButtonRounded v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
              color="dark:text-gray-200 dark:bg-red-600 text-gray-700 bg-red-400" tooltip="Limpiar filtros"
              tooltipPosition="top" @click="borrarFiltros">
              <i class="fa-solid fa-xmark"></i>
            </ButtonRounded>
          </div>
        </div>

        <div class="flex flex-wrap items-end justify-between gap-3"">
              <UInput v-model="busqueda" placeholder="Buscar dato en la Tabla..." icon="lucide-search"
          variant="outline" size="lg" class="md:w-90 w-full" />
      </div>
      </div>
    </template>

    <!-- Lista de EPS -->
    <div v-if="Eps.length > 0" class="space-y-1 h-[40vh] overflow-y-auto grid md:grid-cols-2 gap-3">
      <div v-for="(item, index) in datosOrdenados" :key="index"
        class="flex items-center justify-between p-4 rounded-lg bg-linear-to-r from-[#f9fbfd] to-white dark:from-gray-700 dark:to-gray-600 border border-green-100 dark:border-gray-500 hover:shadow-md transition-all duration-300 group">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-full bg-green-100 dark:bg-gray-600 flex items-center justify-center text-green-600 dark:text-green-400 font-bold">
            {{ item.nombre?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="font-semibold text-gray-900 dark:text-white">{{ item.nombre }}</p>
            <div class="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span><i class="fa-solid fa-code mr-1"></i>{{ item.codigo }}</span>
              <span><i class="fa-solid fa-id-card mr-1"></i>{{ item.nit }}</span>
            </div>
          </div>
        </div>
        <UDropdownMenu :items="getAcciones(item)" :popper="{ placement: 'bottom-end' }">
          <UButton icon="i-lucide-more-vertical" color="gray" variant="ghost" size="xs"
            class="opacity-0 group-hover:opacity-100 transition-opacity" />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <i class="fa-solid fa-inbox text-4xl text-gray-300 mb-3"></i>
      <p class="text-gray-500 dark:text-gray-400 mb-4">No hay EPS registradas</p>
      <UButton icon="i-lucide-plus" color="green" @click="agregarEps">
        Registrar Primera EPS
      </UButton>
    </div>
  </UCard>
  <Restringido v-else></Restringido>
</template>
