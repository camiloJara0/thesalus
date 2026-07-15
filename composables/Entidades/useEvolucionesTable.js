import { h } from 'vue'
import { UBadge, UButton, UDropdownMenu } from '#components'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'
import { eliminarTerapias } from '~/Core/Historial/Historia/DeleteAnalisis'

export const useEvolucionesTable = (loadItem, exportar, exportarServicio, puedePutTerapias, puedeDelete) => {
  const columns = [
    { accessorKey: 'id', header: 'id' },
    { accessorKey: 'terapia.fecha', header: 'Fecha'},
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'servicio.name', header: 'Servicio', ordenar: true },
    { accessorKey: 'terapia.sesion', header: 'Sesión' },
    {
      accessorKey: 'terapia.objetivos', header: 'Objetivos',
      cell: ({ row }) => {
        const texto = row.original.terapia.objetivos || ''
        const limitado = texto.length > 20 ? texto.substring(0, 20) + '...' : texto
        return h('p', limitado)
      }
    },
    {
      accessorKey: 'terapia.evolucion', header: 'Evolucion',
      cell: ({ row }) => {
        const texto = row.original.terapia.evolucion || ''
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
              items: getRowItemsEvolucion(row)
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
    { columna: 'fecha_mes', columnaReal: 'terapia.fecha', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'terapia.fecha', placeholder: 'Año', tipo: 'año' }
  ]

  const headerConfig = {
    titulo: 'Avances de Tratamientos',
    color: 'bg-[var(--color-default-600)] text-white',
    espacioMargen: '520',
    buscador: true,
    filtros,
    buttons: [{
      icon: 'i-lucide-file-down',
      accion: () => {exportarServicio('Terapia')},
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

  const eliminarTerapia = async (analisis) => {
    const store = useHistoriasStore()
    const notificaciones = useNotificacionesStore()

    notificaciones.options.icono = "warning",
    notificaciones.options.titulo = "¿Deseas eliminar permanentemente el reporte?",
    notificaciones.options.html = `Se eliminará el servicio de ${analisis.servicio.name}, hecho por: <span>${analisis.profesional.info_usuario.name}</span>`,
    notificaciones.options.confirmtext = "Sí, eliminar",
    notificaciones.options.canceltext = "Atrás"

    const respuesta = await notificaciones.alertRespuesta();
    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarTerapias(analisis);
    if (!eliminado) return;

    notificaciones.options.position = "top-end",
    notificaciones.options.texto = "Reporte eliminado con éxito.",
    notificaciones.options.background = "#6bc517",
    notificaciones.options.tiempo = 1500

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";
  };

const card = {
    header: ['terapia.fecha', 'profesional.info_usuario.name'],
    body: ['servicio.name', 'terapia.sesion', 'terapia.objetivos', 'terapia.evolucion'],
}

  function getRowItemsEvolucion(row) {
    const terapia = row.original || row

    return [
      {
        type: 'label',
        label: 'Acciones'
      },
      {
        label: 'Ver',
        onSelect() {
          loadItem('Terapia', terapia)
        }
      },
      {
        label: 'Actualizar',
        onSelect() {
          loadItem('Terapia', terapia, 'update')
        },
        disabled: !puedePutTerapias
      },
      {
        label: 'Eliminar',
        onSelect() {
          eliminarTerapia(terapia)
        },
        disabled: !puedeDelete
      },
      {
        type: 'separator'
      },
      {
        label: 'Exportar PDF',
        onSelect() {
          exportar('Terapia', terapia.id)
        }
      }
    ].filter(Boolean)
  }

  return {
    columns,
    getRowItemsEvolucion,
    card,
    filtros,
    headerConfig,
    acciones,
    getRowItemsEvolucion
  }
}
