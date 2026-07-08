import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePasswordVisibilityStore = defineStore('passwordVisibility', () => {
  // Mapa de visibilidad por ID de campo (permite múltiples campos de contraseña)
  const visibility = ref({})

  const toggleVisibility = (fieldId) => {
    if (visibility.value[fieldId] === undefined) {
      visibility.value[fieldId] = false
    }
    visibility.value[fieldId] = !visibility.value[fieldId]
  }

  const setVisibility = (fieldId, value) => {
    visibility.value[fieldId] = value
  }

  const getVisibility = (fieldId) => {
    return visibility.value[fieldId] ?? false
  }

  const resetVisibility = (fieldId) => {
    if (fieldId) {
      delete visibility.value[fieldId]
    } else {
      visibility.value = {}
    }
  }

  return {
    visibility,
    toggleVisibility,
    setVisibility,
    getVisibility,
    resetVisibility
  }
})
