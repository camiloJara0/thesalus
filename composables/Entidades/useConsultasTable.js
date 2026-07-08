import { h } from 'vue'
import { UBadge, UButton, UDropdownMenu } from '#components'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'

export const useConsultasTable = (loadItem, exportar, exportarServicio, puedePutMedicina) => {
  const columns = [
    { accessorKey: 'id', header: 'id' },
    { accessorKey: 'fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'servicio.name', header: 'Servicio', ordenar: true },
    {
      accessorKey: 'motivo', header: 'Motivo',
      cell: ({ row }) => {
        const texto = row.original.motivo || ''
        const limitado = texto.length > 20 ? texto.substring(0, 20) + '...' : texto
        return h('p', limitado)
      }
    },
    {
      accessorKey: 'observacion', header: 'Observacion',
      cell: ({ row }) => {
        const texto = row.original.observacion || ''
        const limitado = texto.length > 20 ? texto.substring(0, 20) + '...' : texto
        return h('p', limitado)
      }
    },
    { accessorKey: 'tratamiento', header: 'Tratamiento' },
    {
      accessorKey: 'tipoAnalisis',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('tipoAnalisis')
        const color =
          estado === 'Estado clinico sin cambios'
            ? 'success'
            : estado === 'Recomendaciones Adicionales'
              ? 'warning'
              : 'error'

        return h(
          UBadge,
          { variant: 'subtle', color, class: 'capitalize' },
          () => estado
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        h(
          'div',
          { class: 'text-right' },
          h(
            UDropdownMenu,
            {
              content: { align: 'end' },
              items: getRowItems(row)
            },
            () =>
              h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost'
              })
          )
        )
    }
  ]

  const filtros = [
    { columna: 'servicio.name', placeholder: 'Servicio' },
    { columna: 'profesional.info_usuario.name', placeholder: 'Profesional' },
    { columna: 'tipoAnalisis', placeholder: 'Estado' },
    { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' }
  ]

  const headerConfig = {
    titulo: 'Consultas y Analisis',
    color: 'bg-[var(--color-default-600)] text-white',
    espacioMargen: '520',
    buscador: true,
    filtros,
    buttons: [{
      icon: 'i-lucide-file-down',
      accion: () => { exportarServicio('Medicina') },
      color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
      texto: 'Exportar'
    },]
  }

  const acciones = {
    icons: [
      { icon: 'estadoSemaforo', action: () => { } },
      { icon: 'ver', action: (item) => loadItem('Consulta', item) },
      puedePutMedicina ? { icon: 'actualizar', action: (item) => loadItem('Consulta', item, 'update') } : '',
      { icon: 'pdf', action: (item) => exportar('Medicina', item.id_analisis) }
    ],
    botones: true
  }

  const eliminarConsulta = async (analisis) => {
    const store = useHistoriasStore()
    const notificaciones = useNotificacionesStore()

    notificaciones.options.icono = "warning",
    notificaciones.options.titulo = "¿Deseas eliminar permanentemente el reporte?",
    notificaciones.options.html = `Se eliminará el servicio de ${analisis.servicio.name}, hecho por: <span>${analisis.profesional.info_usuario.name}</span>`,
    notificaciones.options.confirmtext = "Sí, eliminar",
    notificaciones.options.canceltext = "Atrás"

    const respuesta = await notificaciones.alertRespuesta();
    if (respuesta !== "confirmado") return;

    const eliminado = await store.eliminar(analisis);
    if (!eliminado) return;

    notificaciones.options.position = "top-end",
    notificaciones.options.texto = "Reporte eliminado con éxito.",
    notificaciones.options.background = "#6bc517",
    notificaciones.options.tiempo = 1500

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";
  };

  function getRowItems(row) {
    const consulta = row.original

    return [
      {
        type: 'label',
        label: 'Acciones'
      },
      {
        label: 'Ver',
        onSelect() {
          loadItem('Consulta', consulta)
        }
      },
      puedePutMedicina ? {
        label: 'Actualizar',
        onSelect() {
          loadItem('Consulta', consulta, 'update')
        }
      } : null,
      puedePutMedicina ? {
        label: 'Eliminar',
        onSelect() {
          eliminarConsulta(consulta)
        }
      } : null,
      {
        type: 'separator'
      },
      {
        label: 'Exportar PDF',
        onSelect() {
          exportar('Medicina', consulta.id)
        }
      }
    ].filter(Boolean)
  }

  return {
    columns,
    filtros,
    headerConfig,
    acciones,
    getRowItems
  }
}
