import { h } from 'vue'
import { UBadge } from '#components'

// Helper para obtener los loaders que se pasan a los composables de tablas
export const useTableLoaders = (historiasStore, varView, loadItem, exportar) => {
  return {
    loadItem,
    exportar,
    historiasStore,
    varView
  }
}

// Helper para estadoSemaforo - función que genera el icono según el estado
export const estadoSemaforoCell = (fila) => {
  if (fila.tipoAnalisis === 'Estado clinico sin cambios') {
    return 'Verde'
  } else if (fila.tipoAnalisis === 'Recomendaciones Adicionales') {
    return 'Naranja'
  } else if (fila.tipoAnalisis === 'Cambios criticos') {
    return 'Rojo'
  } else {
    return ''
  }
}
