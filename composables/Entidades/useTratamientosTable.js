import { h } from 'vue'
import { UBadge, UButton, UDropdownMenu } from '#components'


export const useTratamientosTable = (loadItem, exportar, puedePutTratamientos, puedeDelete) => {
  const columns = [
    { accessorKey: 'fecha', header: 'Fecha', },
    { 
      accessorKey: 'procedimiento', header: 'Procedimiento', 
      cell: ({ row }) => {
        const texto = row.original.procedimiento || ''
        const limitado = texto.length > 30 ? texto.substring(0, 30) + '...' : texto
        return h('p', limitado)
      }
    },
    { accessorKey: 'codigo', header: 'CUPS', },
    { accessorKey: 'dias_asignados', header: 'No. Dias' },
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
              items: getRowItemsTratamiento(row)
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

  const filtros = []

const card = {
    header: ['procedimiento', 'codigo'],
    body: ['dias_asignados', 'fecha'],
}

  const headerConfig = {
    titulo: 'Tratamientos',
    buscador: true,
    filtros
  }

  const acciones = {
    icons: [
      { icon: 'estadoSemaforo', action: () => { } },
      { icon: 'ver', action: null },
      { icon: 'actualizar', action: null }
    ],
    botones: true
  }

  function getRowItemsTratamiento(row) {
    const tratamiento = row.original || row

    return [
      {
        type: 'label',
        label: 'Acciones'
      },
      {
        label: 'Ver',
        onSelect() {
          loadItem('Tratamientos', tratamiento)
        }
      },
      {
        label: 'Actualizar',
        onSelect() {
          loadItem('Tratamientos', tratamiento, 'update')
        },
        disabled: !puedePutTratamientos
      },
      {
        type: 'separator'
      },
      {
        label: 'Exportar PDF',
        onSelect() {
          exportar('Tratamiento', tratamiento.id_analisis)
        }
      },
    ].filter(Boolean)
  }

  return {
    columns,
    getRowItemsTratamiento,
    card,
    filtros,
    headerConfig,
    acciones
  }
}
