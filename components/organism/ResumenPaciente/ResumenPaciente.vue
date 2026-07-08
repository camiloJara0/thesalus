<template>
  <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
    <!-- Tarjeta Principal - Datos del Paciente -->
    <UCard class="bg-gradient-to-br from-[var(--color-default-400)] to-[var(--color-default-600)] text-white md:col-span-2">
      <template #header>
        <div class="flex items-start justify-between -m-4 mb-0">
          <div>
            <h2 class="text-lg font-bold">{{ paciente.paciente || 'Paciente' }}</h2>
            <p class="text-sm text-gray-200 mt-1">
              <i class="fa-solid fa-id-card mr-1"></i>{{ paciente.cedula || 'Sin documento' }}
            </p>
          </div>
          <UButton 
            v-if="mostrarCerrar"
            icon="i-lucide-x" 
            color="white" 
            variant="ghost"
            size="sm"
            @click="emit('cerrar')"
          />
        </div>
      </template>

      <div class="space-y-3">
        <!-- Información básica en grid -->
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-gray-200 text-xs mb-1">Edad</p>
            <p class="font-semibold">{{ calcularEdad() }} años</p>
          </div>
          <div>
            <p class="text-gray-200 text-xs mb-1">Género</p>
            <p class="font-semibold">{{ paciente.sexo || 'No especificado' }}</p>
          </div>
          <div>
            <p class="text-gray-200 text-xs mb-1">Teléfono</p>
            <p class="font-semibold">{{ paciente.celular || 'No registrado' }}</p>
          </div>
          <div>
            <p class="text-gray-200 text-xs mb-1">Estado</p>
            <UBadge :color="paciente.estado === 'Activo' ? 'success' : 'warning'" variant="subtle">
              {{ paciente.estado || 'Activo' }}
            </UBadge>
          </div>
        </div>

        <!-- Botón de contacto rápido -->
        <UButton 
          block 
          color="white"
          variant="soft"
          icon="i-lucide-phone"
          @click="emit('contactar')"
        >
          Contactar Paciente
        </UButton>
      </div>
    </UCard>

    <!-- Tarjeta: Registros Médicos -->
    <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="emit('verRegistros')">
      <template #header>
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-clipboard-list text-[var(--color-default-600)]"></i>
          <h3 class="font-semibold text-sm">Registros</h3>
        </div>
      </template>
      <div class="space-y-2">
        <div class="text-center">
          <p class="text-3xl font-bold text-[var(--color-default-600)]">{{ estadisticas.consultas }}</p>
          <p class="text-xs text-gray-500 mt-1">Consultas</p>
        </div>
        <UDivider />
        <div class="flex justify-around text-center text-xs">
          <div>
            <p class="font-semibold text-[var(--color-default-500)]">{{ estadisticas.diagnosticos }}</p>
            <p class="text-gray-500">Diagnósticos</p>
          </div>
          <div>
            <p class="font-semibold text-[var(--color-default-500)]">{{ estadisticas.tratamientos }}</p>
            <p class="text-gray-500">Tratamientos</p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Tarjeta: Medicamentos -->
    <UCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="emit('verMedicamentos')">
      <template #header>
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-pills text-[var(--color-green)]"></i>
          <h3 class="font-semibold text-sm">Medicamentos</h3>
        </div>
      </template>
      <div class="space-y-2">
        <p class="text-3xl font-bold text-[var(--color-green)]">{{ estadisticas.medicamentos }}</p>
        <p class="text-xs text-gray-500">Registrados</p>
        <div class="pt-2">
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              class="bg-[var(--color-green)] h-2 rounded-full"
              :style="{ width: Math.min((estadisticas.medicamentos / 5) * 100, 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Tarjeta: Alertas -->
    <UCard 
      class="hover:shadow-lg transition-shadow cursor-pointer"
      :class="estadisticas.alertas > 0 ? 'border-l-4 border-[var(--color-warning)]' : ''"
      @click="emit('verAlertas')"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <i 
            :class="[
              'fa-solid', 
              estadisticas.alertas > 0 ? 'fa-triangle-exclamation text-[var(--color-warning)]' : 'fa-check-circle text-[var(--color-green)]'
            ]"
          ></i>
          <h3 class="font-semibold text-sm">Estado</h3>
        </div>
      </template>
      <div class="space-y-2">
        <p 
          class="text-3xl font-bold"
          :class="estadisticas.alertas > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-green)]'"
        >
          {{ estadisticas.alertas || '✓' }}
        </p>
        <p class="text-xs text-gray-500">
          {{ estadisticas.alertas > 0 ? 'Alertas activas' : 'Sin alertas' }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  paciente: {
    type: Object,
    required: true,
  },
  estadisticas: {
    type: Object,
    default: () => ({
      consultas: 0,
      diagnosticos: 0,
      tratamientos: 0,
      medicamentos: 0,
      alertas: 0,
    }),
  },
  mostrarCerrar: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['cerrar', 'contactar', 'verRegistros', 'verMedicamentos', 'verAlertas']);

function calcularEdad() {
  if (!props.paciente.fecha_nacimiento) return '-';
  const today = new Date();
  const birthDate = new Date(props.paciente.fecha_nacimiento);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
</script>
