<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  Propiedades: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const showOptions = ref(props.Propiedades.showOptions ?? false)

/* ---------- UI ---------- */

function mostrarOptions() {
  showOptions.value = !showOptions.value
}

/* ---------- Helpers ---------- */

function togglePermiso(permiso) {
  const permisos = [...props.modelValue]
  const index = permisos.indexOf(permiso)

  if (index !== -1) {
    permisos.splice(index, 1)
  } else {
    permisos.push(permiso)
  }

  emit('update:modelValue', permisos)
}

function seleccionarModulo(modulo) {
  const permisos = new Set(props.modelValue)

  modulo.acciones.forEach(a => {
    permisos.add(a.nombre)
  })

  emit('update:modelValue', Array.from(permisos))
}

function moduloSeleccionado(modulo) {
  return modulo.acciones.every(a =>
    props.modelValue.includes(a.nombre)
  )
}
</script>


<template>
  <div class="relative select-none" :class="Propiedades.tamaño">
    <!-- Input visual -->
    <div
      class="mt-1 w-full h-[8.75 px-3 flex items-center justify-between
             border border-gray-300 dark:border-blue-900 rounded-lg
             cursor-pointer bg-white dark:bg-gray-900"
      @click="mostrarOptions"
    >
      <span class="text-sm text-black dark:text-white font-bold">
        {{ Propiedades.placeholder || 'Seleccionar permisos' }}
      </span>
    </div>

    <!-- Dropdown -->
    <div
      v-show="showOptions"
      class="absolute top-full left-0 right-0 mt-1 max-h-75
             overflow-y-auto scrollForm bg-white dark:bg-gray-900
             border border-gray-200 dark:border-gray-800 rounded-lg z-50 p-3"
    >
      <!-- Módulos -->
      <div
        v-for="modulo in Propiedades.options"
        :key="modulo.modulo"
        class="mb-4 rounded-lg"
      >
        <!-- Header módulo -->
        <div
          class="flex justify-between items-center px-4 py-2
                 bg-gray-100 dark:bg-gray-800 font-semibold"
        >
          <span class="flex gap-1 justify-center items-center text-gray-600 dark:text-gray-300 text-sm">
            <i class="fa-solid fa-file-pen "></i> Modulo:
            <p class="text-black dark:text-white text-base ml-1">{{ modulo.modulo }}</p> 
          </span>
          

          <button
            class="text-xs text-blue-600 hover:underline"
            @click.prevent="seleccionarModulo(modulo)"
          >
            Seleccionar todo
          </button>
        </div>

        <!-- Acciones -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <label
            v-for="accion in modulo.acciones"
            :key="accion.id"
            class="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="modelValue.includes(accion.nombre)"
              @change="togglePermiso(accion.nombre)"
            />
            <span class="text-sm">
                {{ 
                accion.key === 'get' ? 'LEER' :
                accion.key === 'post' ? 'CREAR' :
                accion.key === 'put' ? 'ACTUALIZAR' :
                accion.key === 'delete' ? 'ELIMINAR' : 'VISTA'
                }}
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
