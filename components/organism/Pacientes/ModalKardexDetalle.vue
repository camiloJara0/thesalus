<template>
  <UModal v-model="isOpen" size="xl" :ui="{ body: { padding: 'p-6' } }">
    <UCard v-if="historia">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-linear-to-br from-amber-100 to-amber-50 flex items-center justify-center">
            <i class="fa-solid fa-file-medical text-amber-600"></i>
          </div>
          <div>
            <h3 class="font-bold">Detalle de Consulta</h3>
            <p class="text-sm text-gray-500">{{ formatFecha(historia.fecha) }} - {{ formatHora(historia.hora) }}</p>
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Información General -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <p class="text-xs text-blue-600 font-semibold mb-1">PROFESIONAL</p>
            <p class="text-lg font-bold text-blue-900">{{ historia.profesional_nombre || 'Desconocido' }}</p>
          </div>
          <div class="p-4 rounded-lg bg-amber-50 border border-amber-100">
            <p class="text-xs text-amber-600 font-semibold mb-1">TIPO DE CONSULTA</p>
            <p class="text-lg font-bold text-amber-900 capitalize">{{ getTipoConsulta(historia.tipo_consulta) }}</p>
          </div>
        </div>

        <!-- Síntomas -->
        <div class="p-4 rounded-lg bg-linear-to-r from-[#f9fbfd] to-white border border-gray-200">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-stethoscope text-red-500"></i>
            <h4 class="font-semibold text-gray-900">Síntomas y Quejas</h4>
          </div>
          <p class="text-gray-700 leading-relaxed">{{ historia.sintomas || 'No registrado' }}</p>
        </div>

        <!-- Diagnósticos -->
        <div v-if="historia.diagnosticos && historia.diagnosticos.length > 0" class="p-4 rounded-lg bg-linear-to-r from-red-50 to-white border border-red-100">
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-solid fa-tag text-red-600"></i>
            <h4 class="font-semibold text-gray-900">Diagnósticos ({{ historia.diagnosticos.length }})</h4>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(diag, index) in historia.diagnosticos" 
              :key="index"
              class="flex items-start gap-3 p-3 rounded bg-white border-l-4 border-red-400"
            >
              <i class="fa-solid fa-circle-check text-red-500 mt-1"></i>
              <div>
                <p class="font-semibold text-gray-900">{{ diag.codigo }}</p>
                <p class="text-sm text-gray-600">{{ diag.nombre }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Medicamentos -->
        <div v-if="historia.medicamentos && historia.medicamentos.length > 0" class="p-4 rounded-lg bg-linear-to-r from-green-50 to-white border border-green-100">
          <div class="flex items-center gap-2 mb-3">
            <i class="fa-solid fa-prescription-bottle text-green-600"></i>
            <h4 class="font-semibold text-gray-900">Medicamentos Prescritos ({{ historia.medicamentos.length }})</h4>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(med, index) in historia.medicamentos" 
              :key="index"
              class="flex items-start gap-3 p-3 rounded bg-white border-l-4 border-green-400"
            >
              <i class="fa-solid fa-pills text-green-500 mt-1"></i>
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ med.nombre }}</p>
                <div class="flex gap-4 text-sm text-gray-600 mt-1">
                  <span><strong>Dosis:</strong> {{ med.dosis }}</span>
                  <span><strong>Frecuencia:</strong> {{ med.frecuencia }}</span>
                  <span><strong>Duración:</strong> {{ med.duracion }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Signos Vitales -->
        <div v-if="historia.signos_vitales" class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p class="text-xs text-blue-600 font-semibold mb-1">TENSIÓN ARTERIAL</p>
            <p class="text-lg font-bold text-blue-900">{{ historia.signos_vitales.TA || '-' }}</p>
          </div>
          <div class="p-3 rounded-lg bg-red-50 border border-red-100">
            <p class="text-xs text-red-600 font-semibold mb-1">FRECUENCIA CARDÍACA</p>
            <p class="text-lg font-bold text-red-900">{{ historia.signos_vitales.FC || '-' }} bpm</p>
          </div>
          <div class="p-3 rounded-lg bg-green-50 border border-green-100">
            <p class="text-xs text-green-600 font-semibold mb-1">FR</p>
            <p class="text-lg font-bold text-green-900">{{ historia.signos_vitales.FR || '-' }} rpm</p>
          </div>
          <div class="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
            <p class="text-xs text-yellow-600 font-semibold mb-1">TEMPERATURA</p>
            <p class="text-lg font-bold text-yellow-900">{{ historia.signos_vitales.temp || '-' }} °C</p>
          </div>
        </div>

        <!-- Notas y Recomendaciones -->
        <div class="p-4 rounded-lg bg-linear-to-r from-purple-50 to-white border border-purple-100">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-note-sticky text-purple-500"></i>
            <h4 class="font-semibold text-gray-900">Notas y Recomendaciones</h4>
          </div>
          <p class="text-gray-700 leading-relaxed">{{ historia.notas || 'Sin notas registradas' }}</p>
        </div>

        <!-- Próximo Control -->
        <div v-if="historia.proximo_control" class="p-4 rounded-lg bg-linear-to-r from-cyan-50 to-white border border-cyan-100">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-calendar-check text-cyan-600"></i>
            <h4 class="font-semibold text-gray-900">Próximo Control</h4>
          </div>
          <p class="text-lg font-semibold text-cyan-700">{{ formatFecha(historia.proximo_control) }}</p>
        </div>
      </div>

      <!-- Acciones -->
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton 
            icon="i-lucide-download"
            color="gray"
            variant="ghost"
            @click="descargarPDF"
          >
            Descargar PDF
          </UButton>
          <UButton 
            color="gray"
            @click="isOpen = false"
          >
            Cerrar
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  historia: Object
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function formatFecha(fecha) {
  if (!fecha) return 'No especificada'
  return new Date(fecha).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatHora(hora) {
  if (!hora) return ''
  return hora.substring(0, 5)
}

function getTipoConsulta(tipo) {
  const tipos = {
    'consulta': 'Consulta General',
    'urgencia': 'Urgencia',
    'seguimiento': 'Seguimiento',
    'control': 'Control'
  }
  return tipos[tipo] || 'Consulta'
}

function descargarPDF() {
  // Esta función será implementada cuando se tenga el servicio de PDF
  console.log('Descargando PDF de la historia...')
  // TODO: Implementar descarga de PDF
}
</script>
