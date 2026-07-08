<script setup>
import { computed } from 'vue'
import { UBadge, UAlert } from '#components'
const varView = useVarView()
const permisos = ref([])

onMounted(() => {
  permisos.value = varView.getPermisos
})

const permisosAgrupados = computed(() => {
  const grupos = {}

  permisos.value.forEach((permiso) => {
    const [modulo, accion] = permiso.split('_')

    if (!grupos[modulo]) {
      grupos[modulo] = []
    }

    grupos[modulo].push(accion)
  })

  return Object.entries(grupos).map(([modulo, permisos]) => ({
    modulo,
    permisos
  }))
})

function getColorPermiso(permiso) {
  if (!permiso) return 'gray'
  if (permiso.includes('post')) return 'success'
  if (permiso.includes('put')) return 'info'
  if (permiso.includes('delete')) return 'error'
  if (permiso.includes('view')) return 'info'
  if (permiso.includes('get')) return 'success'
  return 'gray'
}

function getIconPermiso(permiso) {
  if (!permiso) return 'i-lucide-shield'
  if (permiso.includes('post')) return 'i-lucide-plus';
  if (permiso.includes('put')) return 'i-lucide-edit-2';
  if (permiso.includes('delete')) return 'i-lucide-trash-2';
  if (permiso.includes('view')) return 'i-lucide-eye';
  if (permiso.includes('get')) return 'i-lucide-download';
  return 'i-lucide-shield';
}

function getNombrePermiso(permiso) {
  if (!permiso) return ''
  const partes = permiso.split('_')
  const accion = partes.pop()
  const modulo = partes.join(' ')

  let nombreAccion = ''
  switch (accion) {
    case 'post':
      nombreAccion = 'Crear'
      break
    case 'put':
      nombreAccion = 'Editar'
      break
    case 'delete':
      nombreAccion = 'Eliminar'
      break
    default:
      nombreAccion = accion.charAt(0).toUpperCase() + accion.slice(1)
  }

  return `${nombreAccion} ${modulo}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tus Permisos</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Distribución de permisos y accesos</p>
      </div>
    </div>

    <!-- Tabla de Permisos Detallada -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-2">
      <div class="overflow-x-auto grid grid-cols-4 gap-3">


        <UCard v-for="grupo in permisosAgrupados" :key="grupo.modulo">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-semibold">
                {{ grupo.modulo }}
              </span>

              <UBadge color="primary" variant="soft">
                {{ grupo.permisos.length }} permisos
              </UBadge>
            </div>
          </template>

          <div class="flex flex-wrap gap-2">
            <UBadge v-for="permiso in grupo.permisos" :key="permiso" :color="getColorPermiso(permiso)" variant="soft">
              <UIcon :name="getIconPermiso(permiso)" />
              {{ getNombrePermiso(permiso) }}
            </UBadge>
          </div>
        </UCard>

      </div>
    </div>

    <!-- Resumen de Permisos -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="permiso in permisosStats" :key="'resumen-' + permiso.id"
        class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-900">{{ permiso.nombre }}</span>
          <i :class="permiso.icono" class="text-blue-600 text-lg"></i>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between items-end">
            <span class="text-2xl font-bold text-gray-900">{{ permiso.cantidad }}</span>
            <span class="text-xs text-gray-600">de {{ totalProfesionales }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
              :style="{ width: permiso.porcentaje + '%' }"></div>
          </div>
          <div class="flex justify-between items-center pt-2">
            <span class="text-xs text-gray-600">Cobertura</span>
            <span class="text-sm font-semibold text-blue-600">{{ permiso.porcentaje }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Información -->
    <UAlert color="blue" variant="subtle" icon="i-lucide-info" title="Acerca de los Permisos">
      Los permisos controlan qué acciones puede realizar cada profesional en el sistema.
      Puedes gestionar permisos individuales desde la pestaña de Profesionales.
    </UAlert>

  </div>
</template>
