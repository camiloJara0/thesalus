<template>
  <UModal :model-value="show" @update:model-value="$emit('update:show', $event)" prevent-close size="lg">
    <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <i class="fa-solid fa-lock text-blue-600"></i>
            Gestión de Permisos
          </h3>
          <UButton color="gray" variant="ghost" icon="i-lucide-x" @click="$emit('update:show', false)" />
        </div>
      </template>

      <div class="space-y-4">
        <!-- Seleccionar Profesional -->
        <div>
          <label class="text-sm font-medium text-gray-900">Profesional</label>
          <USelect
            v-model="selectedProfesional"
            :options="profesionales"
            option-attribute="info_usuario.name"
            placeholder="Selecciona un profesional"
            class="mt-1"
          >
            <template #label>
              {{ selectedProfesional?.info_usuario?.name || 'Selecciona un profesional' }}
            </template>
          </USelect>
        </div>

        <!-- Permisos Disponibles -->
        <div v-if="selectedProfesional" class="space-y-3">
          <label class="text-sm font-medium text-gray-900">Permisos</label>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="permiso in permisosDisponibles" :key="permiso.id" class="flex items-center">
              <UCheckbox
                :model-value="selectedPermisos.includes(permiso.id)"
                :label="permiso.nombre"
                @update:model-value="togglePermiso(permiso.id)"
              />
            </div>
          </div>
        </div>

        <!-- Info de Permisos -->
        <UAlert
          color="blue"
          variant="subtle"
          icon="i-lucide-info"
          title="Información"
        >
          Los permisos controlan qué acciones puede realizar cada profesional en el sistema.
        </UAlert>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            @click="$emit('update:show', false)"
          >
            Cancelar
          </UButton>
          <UButton
            color="blue"
            @click="guardarPermisos"
            :loading="cargando"
          >
            <i class="fa-solid fa-save mr-2"></i>
            Guardar Permisos
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UCheckbox, USelect, UButton, UModal, UAlert, UCard } from '#components'

const emit = defineEmits(['update:show', 'update:permisos'])

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  profesionales: {
    type: Array,
    default: () => []
  }
})

const selectedProfesional = ref(null)
const selectedPermisos = ref([])
const cargando = ref(false)

const permisosDisponibles = [
  { id: 'Profesional_view', nombre: 'Ver Profesionales' },
  { id: 'Profesional_get', nombre: 'Obtener Datos' },
  { id: 'Profesional_post', nombre: 'Crear Profesionales' },
  { id: 'Profesional_put', nombre: 'Editar Profesionales' },
  { id: 'Profesional_delete', nombre: 'Eliminar Profesionales' }
]

const togglePermiso = (permisoId) => {
  const index = selectedPermisos.value.indexOf(permisoId)
  if (index > -1) {
    selectedPermisos.value.splice(index, 1)
  } else {
    selectedPermisos.value.push(permisoId)
  }
}

const guardarPermisos = async () => {
  cargando.value = true
  try {
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('update:permisos', {
      profesional: selectedProfesional.value,
      permisos: selectedPermisos.value
    })
    
    emit('update:show', false)
    selectedProfesional.value = null
    selectedPermisos.value = []
  } finally {
    cargando.value = false
  }
}
</script>
