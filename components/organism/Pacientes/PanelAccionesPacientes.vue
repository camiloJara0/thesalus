<template>
  <div class="space-y-6">
    <!-- Header con Estadísticas Rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Card Total Pacientes -->
      <UCard 
        :ui="{ body: { padding: 'p-4' }, header: { padding: 'p-4' } }"
        class="hover:shadow-lg transition-all duration-300"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fa-solid fa-users text-blue-600 text-lg"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-semibold">Total Pacientes</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalPacientes }}</p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Card EPS Registradas -->
      <UCard 
        :ui="{ body: { padding: 'p-4' }, header: { padding: 'p-4' } }"
        class="hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fa-solid fa-hospital text-green-600 text-lg"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-semibold">EPS Activas</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalEps }}</p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Card Convenios -->
      <UCard 
        :ui="{ body: { padding: 'p-4' }, header: { padding: 'p-4' } }"
        class="hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <i class="fa-solid fa-handshake text-amber-600 text-lg"></i>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-semibold">Convenios</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalConvenios }}</p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Card Kardex -->
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
                <p class="text-xs text-gray-600 font-semibold">Datos No Enviados</p>
                <p class="text-2xl font-bold text-(--color-warning)">{{ totalKardex }}</p>
              </div>
            </div>
            <div>
              <UButton icon="i-lucide-download" color="warning" variant="subtle" @click="$emit('sincronizarDatos')" loading-auto></UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Acciones Rápidas -->

  </div>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['showNoEnviados', 'sincronizarDatos'])

const props = defineProps({
  pacientes: {
    type: Array,
    default: () => []
  },
  eps: {
    type: Array,
    default: () => []
  },
  convenios: {
    type: Array,
    default: () => []
  },
  kardex: {
    type: Array,
    default: () => []
  }
})

const totalPacientes = computed(() => props.pacientes?.length || 0)
const totalEps = computed(() => props.eps?.length || 0)
const totalConvenios = computed(() => props.convenios?.length || 0)
const totalKardex = computed(() => (props.kardex?.Pacientes?.length || 0) + (props.kardex?.EPS?.length || 0) + (props.kardex?.Convenios?.length || 0))
</script>
