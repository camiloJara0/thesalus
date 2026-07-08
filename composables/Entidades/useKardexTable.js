import { h } from 'vue'
import { UBadge, UButton, UDropdownMenu } from '#components'

export const useKardexTable = (loadItem) => {
  const columns = [
    { titulo: 'fecha_cambio', value: 'Fecha', tamaño: 110, ordenar: true },
    { titulo: 'observacion', value: 'Observación', tamaño: 500 },
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
              items: getRowItemsKardex(row)
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
    { columna: 'fecha_mes', columnaReal: 'fecha_cambio', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha_cambio', placeholder: 'Año', tipo: 'año' }
  ]

  const headerConfig = {
    titulo: 'Historial de cambios de sonda',
    color: 'bg-[var(--color-default-600)] text-white',
    filtros
  }

  const acciones = {
    icons: [
      { icon: 'ver', action: null }
    ],
    botones: true
  }

  function getRowItemsKardex(row) {
    const kardex = row.original

    return [
      {
        type: 'label',
        label: 'Acciones'
      },
      {
        label: 'Ver Kardex',
        onSelect() {
          loadItem('Historial_cambios_sonda', kardex)
        }
      },
      {
        type: 'separator'
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
