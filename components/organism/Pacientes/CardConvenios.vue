<script setup>
import { storeToRefs } from 'pinia';
import { useConvenioActions } from '~/composables/Entidades/Convenio';
import { useConvenioStore } from '~/stores/Entidades/Convenio';
import { useOrdenamiento } from '~/composables/Tabla/useDatosOrdenadosTabla';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import {usePacientesStore} from '~/stores/Entidades/Paciente';
import Restringido from '../NoEnviados/Restringido.vue';

const store = useConvenioStore()
const varView = useVarView()
const notificaciones = useNotificacionesStore()
const mostrarFiltros = ref(false)
const pacientesStore = usePacientesStore()

const puedeVer = varView.getPermisos.includes('Convenios_view');
const puedeGet = varView.getPermisos.includes('Convenios_get');
const puedePost = varView.getPermisos.includes('Convenios_post');
const puedePut = varView.getPermisos.includes('Convenios_put');
const puedeDelete = varView.getPermisos.includes('Convenios_delete');

const {
  agregarConvenio,
  verConvenio,
  cerrar,
  eliminarConvenio
} = useConvenioActions(
  notificaciones
)

const { Convenios } = storeToRefs(store)

const {
  busqueda,
  filtros,
  filtrosConOpciones,
  sortedItems,
  datosOrdenados,
  columnaOrden,
  menorAMayor,
  borrarFiltros
} = useOrdenamiento(Convenios, [], []);

function getAcciones(item) {
  return [
    {
      label: 'Editar',
      icon: 'i-lucide-edit-2',
      onSelect: () => verConvenio(item),
      disabled: !puedePut
    },
    {
      label: 'Eliminar',
      icon: 'i-lucide-trash-2',
      onSelect: () => eliminarConvenio(item),
      disabled: !puedeDelete
    }
  ]
}

function formatFecha(fecha) {
  if (!fecha) return 'No especificada'
  return new Date(fecha).toLocaleDateString('es-CO')
}

function numeroPacientes(convenio) {
  const afiliados = pacientesStore.Pacientes.filter(paciente => {
    const convenioPaciente = paciente.convenios?.[0] || { id: 0 }
    return parseInt(convenioPaciente.id) === parseInt(convenio.id)
  })

  return afiliados.length

}

function llamaDatos(){
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
            class="w-12 h-12 rounded-lg bg-linear-to-br from-blue-100 to-blue-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <i class="fa-solid fa-handshake text-blue-600 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">Convenios</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ Convenios.length }} activos</p>
          </div>
        </div>
        <div class="flex gap-2">
          <UButton icon="i-lucide-filter" color="neutral" variant="outline" @click="mostrarFiltros = !mostrarFiltros">
            Filtrar
          </UButton>
          <UButton icon="i-lucide-plus" :disabled="!puedePost" @click="agregarConvenio">
            Nuevo
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

    <!-- Grid de Convenios -->
    <div v-if="Convenios.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="(item, index) in datosOrdenados" :key="index"
        class="p-4 rounded-lg bg-linear-to-br from-[#f9fbfd] dark:from-gray-700 dark:to-gray-600 border border-blue-100 dark:border-gray-500 hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3 flex-1">
            <div
              class="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
              {{ item.nombre.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 dark:text-white line-clamp-1">{{ item.nombre }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Activo desde {{ formatFecha(item.created_at) }}</p>
            </div>
          </div>
          <UDropdownMenu :items="getAcciones(item)" :popper="{ placement: 'bottom-end' }">
            <UButton icon="i-lucide-more-vertical" color="gray" variant="ghost" size="xs"
              class="opacity-0 group-hover:opacity-100 transition-opacity" />
          </UDropdownMenu>
        </div>

        <!-- Detalles -->
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">NIT:</span>
            <span class="font-semibold text-blue-600 dark:text-blue-400">0</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Numero de pacientes:</span>
            <span class="font-semibold text-green-600 dark:text-green-400">{{ numeroPacientes(item) }}</span>
          </div>
          <div class="pt-2 border-t border-blue-50 dark:border-gray-500">
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.descripcion || 'Sin descripción' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <i class="fa-solid fa-handshake text-4xl text-gray-300 mb-3"></i>
      <p class="text-gray-500 dark:text-gray-400 mb-4">No hay convenios registrados</p>
      <UButton icon="i-lucide-plus" color="blue" @click="agregarConvenio">
        Crear Primer Convenio
      </UButton>
    </div>
  </UCard>
  <Restringido v-else />
</template>
