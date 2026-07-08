import { h } from 'vue'
import { UBadge, UButton, UDropdownMenu } from '#components'
import { eliminarNotas } from '~/Core/Historial/Historia/DeleteAnalisis'

export const useNotasTable = (loadItem, exportar, exportarServicio, puedePutNotas) => {
  const columns = [
    { accessorKey: 'id', header: 'id' },
    { accessorKey: 'nota.fecha_nota', header: 'Fecha', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'servicio.name', header: 'servicio', ordenar: true },
    { accessorKey: 'nota.direccion', header: 'Direccion' },
    {
      accessorKey: 'nota.tipoAnalisis',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.original.nota.tipoAnalisis || ''
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
              items: getRowItemsNota(row)
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
    { columna: 'nombreServicio', placeholder: 'Servicio' },
    { columna: 'profesional', placeholder: 'Profesional' },
    { columna: 'tipoAnalisis', placeholder: 'Estado' },
    { columna: 'fecha_mes', columnaReal: 'fecha_nota', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha_nota', placeholder: 'Año', tipo: 'año' }
  ]

  const headerConfig = {
    titulo: 'Notas Medicas',
    buscador: true,
    filtros,
    buttons: [{
      icon: 'i-lucide-file-down',
      accion: () => {exportarServicio('Nota')},
      color: 'bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-black',
      texto: 'Exportar'
    },]
  }

  const acciones = {
    icons: [
      { icon: 'actualizar', action: null },
      { icon: 'pdf', action: null }
    ],
  }

  const eliminarNota = async (analisis) => {
    const notificaciones = useNotificacionesStore()

    notificaciones.options.icono = "warning",
    notificaciones.options.titulo = "¿Deseas eliminar permanentemente el reporte?",
    notificaciones.options.html = `Se eliminará el servicio de ${analisis.servicio.name}, hecho por: <span>${analisis.profesional.info_usuario.name}</span>`,
    notificaciones.options.confirmtext = "Sí, eliminar",
    notificaciones.options.canceltext = "Atrás"

    const respuesta = await notificaciones.alertRespuesta();
    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarNotas(analisis);
    if (!eliminado) return;

    notificaciones.options.position = "top-end",
    notificaciones.options.texto = "Reporte eliminado con éxito.",
    notificaciones.options.background = "#6bc517",
    notificaciones.options.tiempo = 1500

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";
  };


  function getRowItemsNota(row) {
    const nota = row.original

    return [
      {
        type: 'label',
        label: 'Acciones'
      },
      {
        label: 'Ver',
        onSelect() {
          loadItem('Nota', nota)
        }
      },
      puedePutNotas ? {
        label: 'Actualizar',
        onSelect() {
          loadItem('Nota', nota, 'update')
        }
      } : null,
      puedePutNotas ? {
        label: 'Eliminar',
        onSelect() {
          eliminarNota(nota)
        }
      } : null,
      {
        type: 'separator'
      },
      {
        label: 'Exportar PDF',
        onSelect() {
          exportar('Nota', nota.id)
        }
      },
      {
        type: 'separator'
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
