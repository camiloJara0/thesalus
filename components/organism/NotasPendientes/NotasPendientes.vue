<template>
  <UCard v-if="notasPendientes.length > 0" class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
            <i class="fa-solid fa-bell text-[var(--color-warning)] text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Notas Médicas Pendientes</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ notasPendientes.length }} nota{{ notasPendientes.length !== 1 ? 's' : '' }} por enviar</p>
          </div>
        </div>
        <UBadge color="warning" variant="subtle">{{ notasPendientes.length }}</UBadge>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Resumen Rápido -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 pb-4 border-b border-yellow-200 dark:border-yellow-800">
        <div class="text-center">
          <p class="text-xs text-gray-600 dark:text-gray-400">Más antiguas</p>
          <p class="text-sm font-semibold text-[var(--color-warning)]">{{ masAntigua }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-600 dark:text-gray-400">Total</p>
          <p class="text-sm font-semibold">{{ notasPendientes.length }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-600 dark:text-gray-400">Próximas</p>
          <p class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{ proximasEnvio }}</p>
        </div>
      </div>

      <!-- Lista de Notas -->
      <div v-if="mostrarTodas" class="space-y-3 max-h-[400px] overflow-y-auto scrollForm">
        <div 
          v-for="(nota, idx) in notasPendientes" 
          :key="nota.id"
          class="p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-[var(--color-warning)] hover:shadow-md transition-all duration-200"
          :class="{ 'opacity-75': idx > 2 }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-semibold text-gray-900 dark:text-white truncate">{{ nota.titulo || 'Sin título' }}</p>
                <UBadge v-if="estaVencida(nota)" size="xs" color="danger">Vencida</UBadge>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">{{ nota.descripcion?.substring(0, 80) }}...</p>
              <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                <span><i class="fa-solid fa-calendar mr-1"></i>{{ formatoFecha(nota.fecha_nota) }}</span>
                <span><i class="fa-solid fa-user-doctor mr-1"></i>{{ nota.nombre_doctor || 'Doctor' }}</span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <UButton 
                size="sm"
                color="warning"
                variant="soft"
                icon="i-lucide-send"
                @click="emit('enviar', nota)"
              >
                {{ isMobile ? '' : 'Enviar' }}
              </UButton>
              <UButton 
                size="sm"
                color="gray"
                variant="ghost"
                icon="i-lucide-eye"
                @click="emit('ver', nota)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen Condensado -->
      <div v-else class="space-y-2">
        <div 
          v-for="nota in notasPendientes.slice(0, 3)"
          :key="nota.id"
          class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ nota.titulo }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400">{{ formatoFecha(nota.fecha_nota) }}</p>
          </div>
          <UButton 
            size="xs"
            color="warning"
            @click="emit('enviar', nota)"
          >
            Enviar
          </UButton>
        </div>

        <!-- Ver más -->
        <UButton 
          v-if="notasPendientes.length > 3"
          block
          color="gray"
          variant="ghost"
          size="sm"
          @click="mostrarTodas = true"
          icon="i-lucide-chevron-down"
        >
          Ver {{ notasPendientes.length - 3 }} más
        </UButton>
      </div>

      <!-- Botón Expandir/Colapsar -->
      <div class="flex gap-2 pt-3 border-t border-yellow-200 dark:border-yellow-800">
        <UButton 
          block
          color="warning"
          variant="soft"
          icon="i-lucide-check-all"
          @click="emit('enviarTodas')"
        >
          Enviar Todas
        </UButton>
        <UButton 
          block
          color="gray"
          variant="ghost"
          icon="i-lucide-chevron-up"
          @click="mostrarTodas = false"
          v-if="mostrarTodas"
        >
          Contraer
        </UButton>
      </div>
    </div>
  </UCard>

  <!-- Estado Vacío -->
  <div v-else-if="mostrarVacio" class="text-center py-8">
    <i class="fa-solid fa-check-circle text-4xl text-green-500 mb-3 block"></i>
    <p class="text-gray-600 dark:text-gray-400">No hay notas pendientes por enviar</p>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  notas: {
    type: Array,
    default: () => [],
  },
  mostrarVacio: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['enviar', 'verNota', 'enviarTodas']);

const mostrarTodas = ref(false);

// Filtrar solo notas pendientes
const notasPendientes = computed(() => {
  return props.notas.filter(n => n.estado === 'pendiente' || !n.estado);
});

// Nota más antigua
const masAntigua = computed(() => {
  if (notasPendientes.value.length === 0) return '-';
  const notas = [...notasPendientes.value].sort((a, b) => 
    new Date(a.fecha_nota) - new Date(b.fecha_nota)
  );
  return formatoFecha(notas[0].fecha_nota);
});

// Notas próximas a enviar (últimas 24 horas)
const proximasEnvio = computed(() => {
  const ahora = new Date();
  const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
  return notasPendientes.value.filter(n => 
    new Date(n.fecha_nota) > hace24h
  ).length;
});

// Detectar si es mobile
const isMobile = computed(() => {
  return window.innerWidth < 768;
});

// Verificar si nota está vencida (más de 7 días)
function estaVencida(nota) {
  const ahora = new Date();
  const hace7d = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
  return new Date(nota.fecha_nota) < hace7d;
}

// Formatear fecha
function formatoFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
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

.scrollForm::-webkit-scrollbar-thumb:hover {
  background: var(--color-default-500);
}
</style>
