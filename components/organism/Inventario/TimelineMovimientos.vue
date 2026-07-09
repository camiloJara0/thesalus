<script setup>
import { computed } from 'vue'
import { formatDate } from '~/composables/Formulario/FormatearFecha'
import { useInsumoActions } from '~/composables/Entidades/Insumo'
import { useInsumoStore } from '~/stores/Entidades/Insumo'

const props = defineProps({
  movimientos: {
    type: Array,
    default: () => []
  }
})

const notificaciones = useNotificacionesStore()
const insumoStore = useInsumoStore()
const {
    agregarInsumo,
    agregarMovimiento,
    verInsumo,
    cerrar,
    eliminarInsumo,
    verMovimiento,
    eliminarMovimiento,
    columnsMovimiento,
    agregarPrestacion,
    devolverMovimiento
} = useInsumoActions({
    notificaciones
})


const totalMovimientos = computed(() => props.movimientos.length)

const getEstadoPrestamo = (fecha) => {
  const hoy = new Date()
  const devolucion = new Date(fecha)

  const dias = Math.ceil(
    (devolucion.getTime() - hoy.getTime()) /
    (1000 * 60 * 60 * 24)
  )

  if (dias < 0) {
    return {
      label: 'Préstamo vencido',
      class: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      icon: 'fa-solid fa-circle-exclamation'
    }
  }

  if (dias <= 3) {
    return {
      label: 'Próximo a vencer',
      class: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
      icon: 'fa-solid fa-clock'
    }
  }

  return {
    label: 'Préstamo activo',
    class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    icon: 'fa-solid fa-circle-check'
  }
}

const diasRestantes = (fecha_hasta) => {
  const hoy = new Date()
  const fechaHasta = new Date(fecha_hasta)

  const dias = Math.ceil(
    (fechaHasta.getTime() - hoy.getTime()) /
    (1000 * 60 * 60 * 24)
  )
  return dias >= 0 ? `${dias} días restantes` : `${Math.abs(dias)} días vencidos`
}

function getAcciones(movimiento) {
  return [
    {
      label: 'Ver Detalles',
      icon: 'i-lucide-eye',
      onSelect: () => {
        insumoStore.soloVer = true
        verMovimiento({...movimiento.movimiento, ...movimiento})
      }
    },
    {
      label: 'Devolver',
      icon: 'i-lucide-file',
      onSelect: () => {
        insumoStore.soloVer = false
        devolverMovimiento({...movimiento.movimiento, ...movimiento})
      }
    },
    {
      label: 'Eliminar',
      icon: 'i-lucide-trash-2',
      onSelect: () => {
        eliminarMovimiento(movimiento)
      }
    }
  ]
}

</script>


<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 shadow">
      <div class="flex items-center gap-3">
        <div>
          <h3 class="font-bold text-lg">Historial de Prestaciones</h3>
          <p class="text-sm">{{ totalMovimientos }} prestaciones registradas</p>
        </div>
      </div>
      <div>
        <UButton icon="i-lucide-plus" color="white" variant="soft" @click="agregarPrestacion">
          Nuevo
        </UButton>
        <UButton icon="i-lucide-cloud-sync" color="white" variant="soft" @click="$emit('recargar')">
        </UButton>
      </div>
    </div>

    <!-- Timeline de Movimientos -->
    <div v-if="movimientos.length > 0" class="w-full grid md:grid-cols-2 grid-cols-1 gap-4 h-[50%] overflow-y-auto">

      <!-- Items -->
        <UCard v-for="(item, index) in movimientos.slice(0, 10)" :key="index"
          class="group hover:shadow-md transition-all duration-200 hover:border-(--color-primary-300)">
          <div class="flex items-start gap-4">


            <!-- Información -->
            <div class="flex-1 min-w-0">

              <!-- Header -->
              <div class="flex items-start justify-between gap-2">

                <div>
                  <div class="flex items-center gap-2">
                    <div
                      class="size-10 shrink-0 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <i class="fa-solid fa-box text-amber-600"></i>
                    </div>
                    <div class="flex flex-col">
                      <h3 class="font-semibold text-sm truncate">
                        {{ item.insumo.nombre }}
                      </h3>
                      <p class="text-xs text-gray-500">
                        {{ item.insumo.categoria || 'Sin categoría' }}
                      </p>
                    </div>
                  </div>

                </div>

                <div class="flex items-center gap-2">

                  <UBadge color="warning" variant="soft">
                    Prestado
                  </UBadge>

                  <UDropdownMenu :items="getAcciones(item)" :popper="{ placement: 'bottom-end' }">
                    <UButton icon="i-lucide-more-horizontal" color="neutral" variant="ghost" size="xs" />
                  </UDropdownMenu>

                </div>

              </div>

              <!-- Métricas -->
              <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-4">

                <div>
                  <p class="text-[11px] text-gray-500">
                    Cantidad
                  </p>

                  <p class="font-semibold">
                    {{ item.movimiento.cantidadMovimiento }}
                    {{ item.insumo.unidad || 'Und' }}
                  </p>
                </div>

                <div>
                  <p class="text-[11px] text-gray-500">
                    Responsable
                  </p>

                  <p class="font-semibold truncate">
                    {{ item.movimiento.medico?.info_usuario?.name || 'No asignado' }}
                  </p>
                </div>

                <div>
                  <p class="text-[11px] text-gray-500">
                    Fecha préstamo
                  </p>

                  <p class="font-semibold">
                    {{ formatDate(item.movimiento.fechaMovimiento) }}
                  </p>
                </div>

                <div>
                  <p class="text-[11px] text-gray-500">
                    Devolución
                  </p>

                  <p class="font-semibold">
                    {{ formatDate(item.fecha_hasta) }}
                  </p>
                </div>

              </div>

              <!-- Estado devolución -->
              <div class="mt-4 flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                :class="getEstadoPrestamo(item.fecha_hasta).class">
                <div class="flex items-center gap-2">

                  <i :class="getEstadoPrestamo(item.fecha_hasta).icon"></i>

                  <span class="text-xs font-medium">
                    {{ getEstadoPrestamo(item.fecha_hasta).label }}
                  </span>

                </div>

                <span class="text-xs opacity-80">
                  {{ diasRestantes(item.fecha_hasta) }}
                </span>
              </div>

              <!-- Observación -->
              <div v-if="item.observacion" class="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                <p class="text-xs text-gray-600 dark:text-gray-300">
                  {{ item.observacion }}
                </p>
              </div>

            </div>

          </div>
        </UCard>

    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
        <i class="fa-solid fa-inbox text-2xl text-gray-400"></i>
      </div>
      <p class="text-gray-600 dark:text-gray-400 mb-4">No hay movimientos registrados</p>
      <UButton icon="i-lucide-plus" @click="agregarPrestacion">
        Registrar Primer Movimiento
      </UButton>
    </div>


  </div>
</template>