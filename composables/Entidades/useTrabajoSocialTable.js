import { h } from 'vue'
import { UBadge, UButton, UDropdownMenu } from '#components'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'
import { formatDate } from '../Formulario/FormatearFecha'

export const useTrabajoSocialTable = (loadItem, exportar, exportarServicio, puedePut, puedeDelete) => {
  const columns = [
    { accessorKey: 'id', header: 'id' },
    { accessorKey: 'created_at', header: 'Fecha', 
      cell: ({ row }) => {
        const texto = row.original.created_at || ''
        return h('p', formatDate(texto))
      }
    },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'servicio.name', header: 'Servicio', ordenar: true },
    { 
      accessorKey: 'analisis', header: 'Analisis',
      cell: ({ row }) => {
        const texto = row.original.analisis || ''
        const limitado = texto.length > 20 ? texto.substring(0, 20) + '...' : texto
        return h('p', limitado)
      }
     },
    { 
      accessorKey: 'motivo', header: 'Motivo',
      cell: ({ row }) => {
        const texto = row.original.motivo || ''
        const limitado = texto.length > 20 ? texto.substring(0, 20) + '...' : texto
        return h('p', limitado)
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
                  items: getRowItemsTrabajoSocial(row)
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
    { columna: 'profesional', placeholder: 'Profesional' },
    { columna: 'tipoAnalisis', placeholder: 'Estado' },
    { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' }
  ]

  const headerConfig = {
    titulo: 'Trabajo Social',
    color: 'bg-[var(--color-default-600)] text-white',
    buscador: true,
    filtros,
    buttons: [{
      icon: 'i-lucide-file-down',
      accion: () => {exportarServicio('Trabajo Social')},
      color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
      texto: 'Exportar'
    },]
  }

  const acciones = {
    icons: [
      { icon: 'actualizar', action: null },
      { icon: 'pdf', action: null }
    ],
    botones: true
  }

  const eliminarTrabajoSocial = async (analisis) => {
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

  function getRowItemsTrabajoSocial(row) {
    const trabajoSocial = row.original

    return [
      {
        type: 'label',
        label: 'Acciones'
      },
      {
        label: 'Ver',
        onSelect() {
          loadItem('TrabajoSocial', trabajoSocial)
        }
      },
      {
        label: 'Actualizar',
        onSelect() {
          loadItem('TrabajoSocial', trabajoSocial, 'update')
        },
        disabled: !puedePut
      },
      {
        label: 'Eliminar',
        onSelect() {
          eliminarTrabajoSocial(trabajoSocial)
        },
        disabled: !puedeDelete
      },
      {
        type: 'separator'
      },
      {
        label: 'Exportar PDF',
        onSelect() {
          exportar('Trabajo Social', trabajoSocial.id)
        }
      }
    ].filter(Boolean)
  }

  return {
    columns,
    filtros,
    headerConfig,
    acciones
  }
}
