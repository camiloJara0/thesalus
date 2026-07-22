/**
 * Definiciones de columnas para la tabla de insumos y movimientos.
 * Reutilizable entre Historial/Insumos/index.vue y composables/Entidades/Insumo.js
 */

export const columnasInsumos = [
    { accessorKey: 'nombre', header: 'Nombre', ordenar: true },
    { accessorKey: 'es_prestable', header: 'Prestable', ordenar: true },
    { accessorKey: 'categoria', header: 'Tipo', ordenar: true },
    { accessorKey: 'stock', header: 'Stock', ordenar: true },
    { accessorKey: 'lote', header: 'Lote' },
]

export const columnasMovimiento = [
    { accessorKey: 'fechaMovimiento', header: 'Fecha' },
    {
        accessorKey: 'paciente.info_usuario.name',
        header: 'Paciente',
        cell: (row) => {
            const data = row.original || row
            if (!data.id_paciente) return 'Sin Paciente'
            return data.paciente?.info_usuario?.name || 'Sin Paciente'
        },
    },
    { accessorKey: 'medico.info_usuario.name', header: 'Responsable', ordenar: true },
    { accessorKey: 'insumo.nombre', header: 'Nombre' },
    { accessorKey: 'insumo.categoria', header: 'Categoria', ordenar: true },
    {
        accessorKey: 'tipoMovimiento',
        header: 'Tipo',
        ordenar: true,
    },
]

export const columnasPrestaciones = [
    { accessorKey: 'fecha_prestamo', header: 'Fecha Prestamo', ordenar: true },
    { accessorKey: 'insumo.nombre', header: 'Insumo', ordenar: true },
    { accessorKey: 'medico.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'cantidadMovimiento', header: 'Cantidad' },
    { accessorKey: 'estado', header: 'Estado', ordenar: true },
]

export const filtrosInsumos = [
    { columna: 'nombre', placeholder: 'Nombre' },
    { columna: 'categoria', placeholder: 'Categoria' },
    { columna: 'es_prestable', placeholder: 'Prestable' },
]

export const filtrosMovimiento = [
    { columna: 'insumo', placeholder: 'Insumo' },
    { columna: 'medico', placeholder: 'Responsable' },
    { columna: 'tipoMovimiento', placeholder: 'Tipo' },
    { columna: 'fecha_mes', columnaReal: 'fechaMovimiento', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fechaMovimiento', placeholder: 'Año', tipo: 'año' },
]
