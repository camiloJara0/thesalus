<script setup>
import { computed } from 'vue'
import { useProfesionesActions } from '~/composables/Entidades/Profesiones'
import { useProfesionStore } from '~/stores/Entidades/Profesion'
import { storeToRefs } from 'pinia'
import { useOrdenamiento } from '~/composables/Tabla/useDatosOrdenadosTabla';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Restringido from '../NoEnviados/Restringido.vue';

const props = defineProps({
  profesionales: {
    type: Array,
    default: () => []
  },
  profesiones: {
    type: Array,
    default: () => []
  }
})

const profesionStore = useProfesionStore()
const varView = useVarView()
const notificaciones = useNotificacionesStore()
const mostrarFiltros = ref(false)

const puedeVer = varView.getPermisos.includes('Datos_view');
const puedeGet = varView.getPermisos.includes('Datos_get');
const puedePost = varView.getPermisos.includes('Datos_post');
const puedePut = varView.getPermisos.includes('Datos_put');
const puedeDelete = varView.getPermisos.includes('Datos_delete');
const { Profesiones } = storeToRefs(profesionStore)

const {
  busqueda,
  filtros,
  filtrosConOpciones,
  sortedItems,
  datosOrdenados,
  columnaOrden,
  menorAMayor,
  borrarFiltros
} = useOrdenamiento(Profesiones, [], []);

const {
  agregarProfesion,
  modificarProfesion,
  eliminarProfesion,
  cerrar
} = useProfesionesActions(
  profesionStore,
  varView,
  notificaciones
)

const totalProfesionales = computed(() => props.profesionales?.length || 0)

// Mapear profesiones con sus colores
const listaProfesiones = computed(() => {
  const lista = Profesiones.value.map((profesion, index) => {
    const cantidad = props.profesionales.filter(p => p.id_profesion === profesion.id).length
    return {
      id: profesion.id,
      nombre: profesion.nombre,
      codigo: profesion.codigo,
      permisos: profesion.permisos,
      cantidad: cantidad ? cantidad : 0,
      icono: 'fa-solid fa-user-md',
    }
  })

  return lista
})

const top3Profesiones = computed(() => listaProfesiones.value.slice(0, 3))

const promedioProfesionales = computed(() => {
  return listaProfesiones.value.length > 0
    ? Math.round(totalProfesionales.value / listaProfesiones.value.length)
    : 0
})

function getAcciones(item) {
  return [
    {
      label: 'Editar',
      icon: 'i-lucide-edit-2',
      onSelect: () => modificarProfesion(item),
      disabled: !puedePut
    },
    {
      label: 'Eliminar',
      icon: 'i-lucide-trash-2',
      onSelect: () => eliminarProfesion(item),
      disabled: !puedeDelete
    }
  ]
}

function llamaDatos() {
  profesionStore.traer(true, true)
  varView.datosActualizados()
}
</script>

<template>
  <div class="space-y-6" v-if="puedeVer">
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Profesiones Registradas</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 hidden md:block">Distribución de profesionales por especialidad</p>
      </div>
      <div class="flex gap-2">
          <UButton icon="i-lucide-filter" color="neutral" variant="outline" @click="mostrarFiltros = !mostrarFiltros">
            <p class="hidden md:block">Filtrar</p>
          </UButton>
        <UButton icon="i-lucide-plus" :disabled="!puedePost" @click="agregarProfesion"><p class="hidden md:block">Agregar</p></UButton>
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

    <!-- Lista de Profesiones con Gráfica -->
    <div v-if="listaProfesiones && listaProfesiones.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Cards de Profesiones -->
      <div class="lg:col-span-2 space-y-4">
        <div v-for="profesion in datosOrdenados" :key="profesion.id"
          class="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:shadow-md transition">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0 text-blue-500">
            <i class="fa-solid fa-list"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ profesion.nombre }} - <span class="text-xs text-gray-500">{{ profesion.codigo }}</span></p>
            <span class="text-xs mr-1">Estado: </span> <UBadge :color="profesion.estado === 1 ? 'success' : 'neutral'" variant="soft">{{ profesion.estado === 1 ? 'Activo' : 'Inactivo' }}</UBadge>
          </div>
          <div class="flex flex-col items-end gap-1">
        <UDropdownMenu 
          :items="getAcciones(profesion)"
          :popper="{ placement: 'bottom-end' }"
        >
          <UButton 
            icon="i-lucide-more-vertical"
            color="neutral"
            variant="ghost"
            size="xs"
          />
        </UDropdownMenu>
          </div>
        </div>
      </div>

      <!-- Resumen estadístico -->
      <div class="space-y-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumen</h4>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Total Profesionales:</span>
              <span class="font-semibold">{{ totalProfesionales }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Profesiones:</span>
              <span class="font-semibold">{{ listaProfesiones.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Promedio:</span>
              <span class="font-semibold">{{ promedioProfesionales }}</span>
            </div>
          </div>
        </div>

        <!-- Top 3 Profesiones -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Top 3</h4>
          <div class="space-y-2">
            <div v-for="(prof, idx) in top3Profesiones" :key="prof.id" class="flex items-center gap-2 text-xs">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-white"
                :style="{ backgroundColor: prof.color }">
                {{ idx + 1 }}
              </span>
              <span class="text-gray-900 dark:text-gray-100 flex-1">{{ prof.nombre }}</span>
              <span class="font-semibold text-gray-600 dark:text-gray-400">{{ prof.cantidad }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div v-else class="text-center py-12">
      <i class="fa-solid fa-briefcase text-gray-300 text-4xl mb-3"></i>
      <p class="text-gray-500 dark:text-gray-400">No hay profesiones registradas</p>
    </div>
  </div>
  <Restringido v-else/>
</template>
