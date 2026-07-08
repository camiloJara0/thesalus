<template>
  <div class="space-y-6">
    <!-- Encabezado -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas Generales</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Resumen de actividad y desempeño</p>
      </div>
    </div>

    <!-- Grid de Estadísticas Generales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Estado de Profesionales -->
      <UCard class="hover:shadow-lg transition-all">
        <template #header>
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900 dark:text-white">Estado de Profesionales</h4>
            <i class="fa-solid fa-heart-pulse text-red-500 text-lg"></i>
          </div>
        </template>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Activos</span>
            <div class="flex items-center gap-2">
              <div class="w-16 bg-gray-200 rounded-full h-2">
                <div class="bg-green-500 h-2 rounded-full" :style="{ width: porcentajeActivos + '%' }"></div>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ profesionalesActivos }}</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Inactivos</span>
            <div class="flex items-center gap-2">
              <div class="w-16 bg-gray-200 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full" :style="{ width: porcentajeInactivos + '%' }"></div>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ profesionalesInactivos }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Distribución por Municipio -->
      <UCard class="hover:shadow-lg transition-all">
        <template #header>
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900 dark:text-white">Top Municipios</h4>
            <i class="fa-solid fa-map-location-dot text-blue-500 text-lg"></i>
          </div>
        </template>
        <div class="space-y-2">
          <div v-for="(municipio, idx) in topMunicipios" :key="idx" class="flex items-center justify-between text-sm">
            <span class="text-gray-600">{{ municipio.nombre }}</span>
            <UBadge color="blue" variant="subtle">{{ municipio.cantidad }}</UBadge>
          </div>
          <div v-if="topMunicipios.length === 0" class="text-xs text-gray-500">
            Sin datos de municipios
          </div>
        </div>
      </UCard>

      <!-- Actividad Reciente -->
      <UCard class="hover:shadow-lg transition-all">
        <template #header>
          <div class="flex items-center justify-between">
            <h4 class="font-semibold text-gray-900 dark:text-white">Resumen Rápido</h4>
            <i class="fa-solid fa-chart-line text-purple-500 text-lg"></i>
          </div>
        </template>
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Total:</span>
            <span class="font-semibold">{{ totalProfesionales }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Profesiones:</span>
            <span class="font-semibold">{{ totalProfesiones }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Tasa Actividad:</span>
            <span class="font-semibold text-green-600">{{ tasaActividad }}%</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Distribución por Zona -->
    <UCard class="hover:shadow-lg transition-all">
      <template #header>
        <h4 class="font-semibold text-gray-900 dark:text-white">Profesionales por Zona Laboral</h4>
      </template>
      <div v-if="zonasData && zonasData.length > 0" class="space-y-3">
        <div v-for="zona in zonasData" :key="zona.nombre" class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-gray-900">{{ zona.nombre }}</span>
              <span class="text-sm font-semibold text-gray-900">{{ zona.cantidad }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                :style="{ width: zona.porcentaje + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        No hay datos disponibles
      </div>
    </UCard>

    <!-- Tabla Detallada de Zonas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Zonas más activas -->
      <UCard class="hover:shadow-lg transition-all">
        <template #header>
          <h4 class="font-semibold text-gray-900">Zonas Más Activas</h4>
        </template>
        <div class="space-y-2">
          <div v-for="(zona, idx) in topZonas" :key="zona.nombre" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              {{ idx + 1 }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ zona.nombre }}</p>
              <p class="text-xs text-gray-600">{{ zona.cantidad }} profesionales</p>
            </div>
            <span class="text-sm font-semibold text-gray-600">{{ zona.porcentaje }}%</span>
          </div>
        </div>
      </UCard>

      <!-- Información de Cobertura -->
      <UCard class="hover:shadow-lg transition-all">
        <template #header>
          <h4 class="font-semibold text-gray-900">Cobertura</h4>
        </template>
        <div class="space-y-3">
          <div class="text-center py-2">
            <p class="text-3xl font-bold text-blue-600">{{ totalZonas }}</p>
            <p class="text-sm text-gray-600">Zonas cubiertas</p>
          </div>
          <div class="border-t pt-3 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Densidad promedio:</span>
              <span class="font-semibold">{{ densidadPromedio }} prof/zona</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Zona con más:</span>
              <span class="font-semibold">{{ zonaMayor?.nombre }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { UBadge, UCard } from '#components'

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

// Estadísticas básicas
const totalProfesionales = computed(() => props.profesionales?.length || 0)
const totalProfesiones = computed(() => props.profesiones?.length || 0)

const profesionalesActivos = computed(() =>
  props.profesionales?.filter(p => p.estado === 1).length || 0
)

const profesionalesInactivos = computed(() =>
  props.profesionales?.filter(p => p.estado === 0).length || 0
)

const porcentajeActivos = computed(() =>
  totalProfesionales > 0 ? Math.round((profesionalesActivos.value / totalProfesionales) * 100) : 0
)

const porcentajeInactivos = computed(() =>
  totalProfesionales > 0 ? Math.round((profesionalesInactivos.value / totalProfesionales) * 100) : 0
)

const tasaActividad = computed(() => porcentajeActivos.value)

// Top municipios
const topMunicipios = computed(() => {
  if (!props.profesionales || props.profesionales.length === 0) return []
  
  const municipios = {}
  props.profesionales.forEach(p => {
    const municipio = p.municipio_laboral || 'Sin especificar'
    municipios[municipio] = (municipios[municipio] || 0) + 1
  })

  return Object.entries(municipios)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5)
})

// Datos por zona
const zonasData = computed(() => {
  if (!props.profesionales || props.profesionales.length === 0) return []

  const zonas = {}
  props.profesionales.forEach(p => {
    const zona = p.zona_laboral || 'Sin especificar'
    zonas[zona] = (zonas[zona] || 0) + 1
  })

  const zonasArr = Object.entries(zonas)
    .map(([nombre, cantidad]) => {
      const porcentaje = totalProfesionales > 0 ? Math.round((cantidad / totalProfesionales) * 100) : 0
      return { nombre, cantidad, porcentaje }
    })
    .sort((a, b) => b.cantidad - a.cantidad)

  return zonasArr
})

const topZonas = computed(() => zonasData.value.slice(0, 5))

const totalZonas = computed(() => zonasData.value.length)

const densidadPromedio = computed(() =>
  totalZonas.value > 0 ? Math.round(totalProfesionales / totalZonas.value) : 0
)

const zonaMayor = computed(() => {
  const zonas = zonasData.value
  return zonas.length > 0 ? zonas[0] : null
})
</script>
