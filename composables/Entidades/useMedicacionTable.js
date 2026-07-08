import { h } from 'vue'
import { UBadge, UButton, UDropdownMenu } from '#components'

export const useMedicacionTable = (loadItem, exportar, puedePutMedicacion) => {
  const columns = [
    { accessorKey: 'fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'servicio.name', header: 'Servicio' },
    { accessorKey: 'medicamento', header: 'Medicamento', ordenar: true },
    { accessorKey: 'dosis', header: 'Dosis' },
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
              items: getRowItemsMedicacion(row)
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
    { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' }
  ]

  const headerConfig = {
    titulo: 'Medicamentos del Paciente',
    buscador: true,
    filtros
  }

  const acciones = {
    icons: [
      { icon: 'estadoSemaforo', action: () => { } },
      { icon: 'ver', action: null },
      { icon: 'actualizar', action: null },
      { icon: 'pdf', action: null }
    ],
    botones: true
  }

  function getRowItemsMedicacion(row) {
    const medicacion = row.original

    return [
      {
        type: 'label',
        label: 'Acciones'
      },
      {
        label: 'Ver',
        onSelect() {
          loadItem('Medicamento', medicacion)
        }
      },
      puedePutMedicacion ? {
        label: 'Actualizar',
        onSelect() {
          loadItem('Medicamento', medicacion, 'update')
        }
      } : null,
      {
        type: 'separator'
      },

      {
        label: 'Exportar PDF',
        onSelect() {
          exportar('Formula', medicacion.id_analisis)
        }
      },
    ].filter(Boolean)
  }

  return {
    columns,
    filtros,
    headerConfig,
    acciones
  }
}
