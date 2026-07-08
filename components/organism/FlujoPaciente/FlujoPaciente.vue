<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="p-4 bg-gradient-to-r from-[var(--color-default-500)] to-[var(--color-default-700)] rounded-lg text-white">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-network-wired text-lg"></i>
          <h3 class="font-semibold">Flujo de Trabajo</h3>
        </div>
        <UBadge color="white">{{ accionesActuales.length }}</UBadge>
      </div>
      <p class="text-xs text-gray-200">Acciones rápidas del paciente</p>
    </div>

    <!-- Grid de Acciones -->
    <div class="grid grid-cols-2 gap-2">
      <!-- Nueva Consulta -->
      <UCard 
        class="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        @click="emit('nuevaConsulta')"
      >
        <div class="text-center space-y-2 py-2">
          <i class="fa-solid fa-plus-circle text-2xl text-blue-500"></i>
          <p class="text-xs font-semibold">Nueva Consulta</p>
          <p class="text-xs text-gray-500">Registrar</p>
        </div>
      </UCard>

      <!-- Agregar Medicamento -->
      <UCard 
        class="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        @click="emit('agregarMedicamento')"
      >
        <div class="text-center space-y-2 py-2">
          <i class="fa-solid fa-pill text-2xl text-green-500"></i>
          <p class="text-xs font-semibold">Medicamento</p>
          <p class="text-xs text-gray-500">Agregar</p>
        </div>
      </UCard>

      <!-- Diagnóstico -->
      <UCard 
        class="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        @click="emit('nuevosDiagnosticos')"
      >
        <div class="text-center space-y-2 py-2">
          <i class="fa-solid fa-stethoscope text-2xl text-orange-500"></i>
          <p class="text-xs font-semibold">Diagnóstico</p>
          <p class="text-xs text-gray-500">Nuevo</p>
        </div>
      </UCard>

      <!-- Nota Médica -->
      <UCard 
        class="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
        @click="emit('nuevaNota')"
      >
        <div class="text-center space-y-2 py-2">
          <i class="fa-solid fa-file-medical text-2xl text-purple-500"></i>
          <p class="text-xs font-semibold">Nota</p>
          <p class="text-xs text-gray-500">Crear</p>
        </div>
      </UCard>
    </div>

    <!-- Divider -->
    <UDivider />

    <!-- Acciones Contextuales -->
    <div class="space-y-2">
      <!-- Referencia/Derivación -->
      <UButton 
        block
        color="cyan"
        variant="soft"
        size="sm"
        icon="i-lucide-send"
        @click="emit('referencia')"
      >
        Hacer Referencia
      </UButton>

      <!-- Exportar -->
      <UButton 
        block
        color="gray"
        variant="ghost"
        size="sm"
        icon="i-lucide-download"
        @click="emit('exportar')"
      >
        Exportar Datos
      </UButton>

      <!-- Comunicación -->
      <UButton 
        block
        color="blue"
        variant="ghost"
        size="sm"
        icon="i-lucide-message-square"
        @click="emit('comunicacion')"
      >
        Comunicarse
      </UButton>
    </div>

    <!-- Historial Rápido -->
    <div v-if="historialReciente.length > 0" class="space-y-2">
      <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2">Acciones Recientes</p>
      <div class="space-y-1 max-h-[200px] overflow-y-auto scrollForm">
        <div 
          v-for="item in historialReciente"
          :key="item.id"
          class="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs border-l-2"
          :class="`border-[${item.color}]`"
        >
          <p class="font-semibold text-gray-900 dark:text-white truncate">{{ item.titulo }}</p>
          <p class="text-gray-600 dark:text-gray-400 text-xs">{{ item.fecha }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

defineProps({
  historialReciente: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'nuevaConsulta',
  'agregarMedicamento',
  'nuevosDiagnosticos',
  'nuevaNota',
  'referencia',
  'exportar',
  'comunicacion'
]);

const accionesActuales = computed(() => [
  'nuevaConsulta',
  'agregarMedicamento',
  'nuevosDiagnosticos',
  'nuevaNota',
]);
</script>

<style scoped>
.scrollForm {
  scrollbar-width: thin;
  scrollbar-color: var(--color-default-300) transparent;
}

.scrollForm::-webkit-scrollbar {
  width: 6px;
}

.scrollForm::-webkit-scrollbar-track {
  background: transparent;
}

.scrollForm::-webkit-scrollbar-thumb {
  background: var(--color-default-300);
  border-radius: 3px;
}
</style>
