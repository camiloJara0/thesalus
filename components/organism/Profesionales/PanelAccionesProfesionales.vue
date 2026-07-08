<template>
  <div class="space-y-6">
    <!-- Header con Estadísticas Rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Card Total Profesionales -->
      <UCard 
        :ui="{ body: { padding: 'p-4' }, header: { padding: 'p-4' } }"
        class="hover:shadow-lg transition-all duration-300"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fa-solid fa-stethoscope text-blue-600 text-lg"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-semibold">Total Profesionales</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalProfesionales }}</p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Card Profesionales Activos -->
      <UCard 
        :ui="{ body: { padding: 'p-4' }, header: { padding: 'p-4' } }"
        class="hover:shadow-lg transition-all duration-300"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fa-solid fa-check-circle text-green-600 text-lg"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-semibold">Activos</p>
              <p class="text-2xl font-bold text-gray-900">{{ profesionalesActivos }}</p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Card Profesiones Registradas -->
      <UCard 
        :ui="{ body: { padding: 'p-4' }, header: { padding: 'p-4' } }"
        class="hover:shadow-lg transition-all duration-300"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <i class="fa-solid fa-briefcase text-purple-600 text-lg"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-semibold">Profesiones</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalProfesiones }}</p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Card Datos No Enviados -->
      <UCard 
        :ui="{ body: { padding: 'p-4' }, header: { padding: 'p-4' } }"
        class="hover:shadow-lg transition-all duration-300 cursor-pointer"
        @click="$emit('showNoEnviados')"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <i class="fa-solid fa-exclamation-triangle text-(--color-warning) text-lg"></i>
              </div>
              <div>
                <p class="text-xs text-gray-600 font-semibold">No Enviados</p>
                <p class="text-2xl font-bold text-(--color-warning)">{{ datosNoEnviados }}</p>
              </div>
            </div>
            <div>
              <UButton icon="i-lucide-download" color="warning" variant="subtle" @click="$emit('sincronizarDatos')" loading-auto></UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['showNoEnviados', 'sincronizarDatos'])

const props = defineProps({
  profesionales: {
    type: Array,
    default: () => []
  },
  profesiones: {
    type: Array,
    default: () => []
  },
  datosNoEnviados: {
    type: Object,
    default: () => ({})
  }
})

const totalProfesionales = computed(() => props.profesionales?.length || 0)
const profesionalesActivos = computed(() => 
  props.profesionales?.filter(p => p.estado === 1).length || 0
)
const totalProfesiones = computed(() => props.profesiones?.length || 0)
const datosNoEnviados = computed(() => 
  (props.datosNoEnviados?.Profesionales?.length || 0)
)
</script>
