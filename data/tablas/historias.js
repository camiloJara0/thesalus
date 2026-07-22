/**
 * Definiciones de columnas para la tabla de historias clínicas.
 * Reutilizable entre Historial/index.vue, ExportarPDFs, etc.
 */

export const columnasHistoria = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'servicio.name', header: 'Servicio', ordenar: true },
    { accessorKey: 'paciente.info_usuario.name', header: 'Paciente', ordenar: true },
    { accessorKey: 'tipo_historia', header: 'Tipo', ordenar: true },
    { accessorKey: 'motivo_consulta', header: 'Motivo' },
]

export const columnasNota = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'nota.fecha_nota', header: 'Fecha', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional', ordenar: true },
    { accessorKey: 'servicio.name', header: 'Servicio', ordenar: true },
    { accessorKey: 'nota.direccion', header: 'Direccion' },
]

export const columnasDiagnostico = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'diagnostico.codigo_cie10', header: 'CIE-10', ordenar: true },
    { accessorKey: 'diagnostico.descripcion', header: 'Descripcion', ordenar: true },
    { accessorKey: 'diagnostico.tipo', header: 'Tipo', ordenar: true },
    { accessorKey: 'diagnostico.fecha', header: 'Fecha', ordenar: true },
]

export const columnasTratamiento = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'tratamiento.fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'tratamiento.descripcion', header: 'Descripcion' },
    { accessorKey: 'tratamiento.estado', header: 'Estado', ordenar: true },
]

export const columnasMedicacion = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'medicacion.fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'medicacion.medicamento', header: 'Medicamento', ordenar: true },
    { accessorKey: 'medicacion.dosis', header: 'Dosis' },
    { accessorKey: 'medicacion.frecuencia', header: 'Frecuencia' },
    { accessorKey: 'medicacion.estado', header: 'Estado', ordenar: true },
]

export const columnasEvolucion = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'evolucion.fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'evolucion.descripcion', header: 'Descripcion' },
    { accessorKey: 'evolucion.estado', header: 'Estado', ordenar: true },
]

export const columnasNutricion = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'nutricion.fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'nutricion.descripcion', header: 'Descripcion' },
    { accessorKey: 'nutricion.estado', header: 'Estado', ordenar: true },
]

export const columnasTrabajoSocial = [
    { accessorKey: 'id', header: 'id', visible: false },
    { accessorKey: 'trabajo_social.fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'trabajo_social.descripcion', header: 'Descripcion' },
    { accessorKey: 'trabajo_social.estado', header: 'Estado', ordenar: true },
]

export const filtrosHistoria = [
    { columna: 'profesional', placeholder: 'Profesional' },
    { columna: 'servicio', placeholder: 'Servicio' },
    { columna: 'tipo_historia', placeholder: 'Tipo' },
    { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
]

export const filtrosNota = [
    { columna: 'nombreServicio', placeholder: 'Servicio' },
    { columna: 'profesional', placeholder: 'Profesional' },
    { columna: 'tipoAnalisis', placeholder: 'Estado' },
    { columna: 'fecha_mes', columnaReal: 'fecha_nota', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha_nota', placeholder: 'Año', tipo: 'año' },
]
