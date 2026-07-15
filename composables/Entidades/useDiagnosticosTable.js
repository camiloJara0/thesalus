export const useDiagnosticosTable = () => {
  const columns = [
    { accessorKey: 'fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', },
    { accessorKey: 'servicio.name', header: 'Servicio' },
    {
      accessorKey: 'descripcion', header: 'Descripcion',
      cell: ({ row }) => {
        const texto = row.original.descripcion || ''
        const limitado = texto.length > 50 ? texto.substring(0, 50) + '...' : texto
        return h('p', limitado)
      }
    },
    { accessorKey: 'codigo', header: 'CIE10', },
  ]

  const filtros = [
    { columna: 'servicio.name', placeholder: 'Servicio' },
    { columna: 'profesional.info_usuario.name', placeholder: 'Profesional' },
    { columna: 'tipoAnalisis', placeholder: 'Estado' },
    { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' }
  ]

const card = {
    header: ['codigo', 'descripcion'],
    body: ['profesional.info_usuario.name', 'servicio.name', 'fecha'],
}

  const headerConfig = {
    titulo: 'Diagnosticos',
    color: 'bg-[var(--color-default-600)] text-white',
    espacioMargen: '500',
    excel: true,
    buscador: true,
    filtros
  }

  return {
    columns,
    card,
    filtros,
    headerConfig
  }
}
