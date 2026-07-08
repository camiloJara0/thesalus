import { mapCampos } from "~/components/organism/Forms/useFormulario"
export const adaptacionHistoria = {

  Medicamento: (item, historiasStore) => {
    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
    historiasStore.Formulario.Analisis.Plan_manejo_medicamentos = historiasStore.Formulario.Analisis.medicamentos[0]
  },

  Tratamientos: (item, historiasStore) => {
    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
    historiasStore.Formulario.Analisis.Plan_manejo_procedimientos = historiasStore.Formulario.Analisis.procedimientos[0]
  },

  Consulta: (item, historiasStore) => {
    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
  },

  Terapia: (item, historiasStore) => {
    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
  },

  Evolucion: (item, historiasStore) => {
    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
  },

  TrabajoSocial: (item, historiasStore) => {
    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
  },

  Nota: (item, historiasStore) => {
    item.nota.subjetivo = item.nota.descripcion_nota.filter(d => d.tipo === 'subjetivo')
    item.nota.objetivo = item.nota.descripcion_nota.filter(d => d.tipo === 'objetivo')
    item.nota.actividades = item.nota.descripcion_nota.filter(d => d.tipo === 'actividades')
    item.nota.plan = item.nota.descripcion_nota.filter(d => d.tipo === 'plan')
    item.nota.intervencion = item.nota.descripcion_nota.filter(d => d.tipo === 'intervencion')
    item.nota.evaluacion = item.nota.descripcion_nota.filter(d => d.tipo === 'evaluacion')

    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
  },

  Historial_cambios_sonda: (item, historiasStore) => {
    historiasStore.Formulario.Analisis = JSON.parse(JSON.stringify(item))
  }
}

export function historialManejoModales({
  historiasStore,
  showItem,
  formularioItem,
  actualizar
}) {

  function loadItem(tipo, item, mode = 'view') {
    const varView = useVarView()
    formularioItem.value = tipo
    varView.tipoHistoria = tipo
    actualizar.value = mode === 'update'

    const adapter = adaptacionHistoria[tipo]

    if (!adapter)
      throw new Error(`Adapter no definido para ${tipo}`)

    adapter(item, historiasStore)

    showItem.value = true
  }

  return { loadItem }
}