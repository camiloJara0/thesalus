import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function usePlantillaBuilder({
    modo = 'crear',
    plantilla = null,
    show,
    camposAsignados = [],
    camposDisponibles = [],
    onGuardar,
    onCerrar,
    onAgregarCampo,
    onEliminarCampo,
    onToggleRequerido,
}) {
    const builder = new FormularioBuilder()
    const esModoEditar = modo === 'editar' && plantilla

    builder
        .setStoreId(esModoEditar ? 'ModificarPlantilla' : 'NuevaPlantilla')
        .setStorePinia('Kardex')
        .setFormulariotamaño('SM')
        .setFormularioShow(show)
        .setFormularioTipo(esModoEditar ? 'Wizard' : 'Form')
        .setFormularioTituloFormulario(esModoEditar ? 'Editar Plantilla' : 'Nueva Plantilla')
        .setFormularioContenedorCampos('flex flex-col')
        .setBotones([
            { text: esModoEditar ? 'Siguiente' : 'Guardar', color: 'primary', type: 'enviar' },
            { text: 'Cancelar', color: 'neutral', type: 'cerrar', accion: onCerrar },
        ])

    builder.nuevaSeccion('Datos de Plantilla')

    builder.addCampo({
        component: 'Input',
        type: 'text',
        placeholder: 'Nombre de la plantilla',
        id: 'nombre',
        name: 'nombre',
        tamaño: 'w-full',
        vmodel: 'Plantilla.nombre',
    })

    builder.addCampo({
        component: 'Select',
        placeholder: 'Estado',
        id: 'estado',
        name: 'estado',
        tamaño: 'w-full',
        options: [
            { label: 'Activo', value: 'ACTIVO' },
            { label: 'Inactivo', value: 'INACTIVO' },
        ],
        vmodel: 'Plantilla.estado',
    })

    builder.addCampo({
        component: 'Textarea',
        placeholder: 'Descripción (opcional)',
        id: 'descripcion',
        name: 'descripcion',
        tamaño: 'w-full col-span-2',
        vmodel: 'Plantilla.descripcion',
    })


    if (esModoEditar) {
        builder.nuevaSeccion('Campos Asignados', 'Ordena, requiere o elimina campos de esta plantilla')

        builder.addCampo({
            component: 'Label',
            text: '<p>Campos asignados a esta plantilla</p>',
            tamaño: 'w-full col-span-2',
            icon: 'i-lucide-list',
            forLabel: 'campos',
        })

        if (camposAsignados.length > 0) {
            camposAsignados.forEach((campo, index) => {
                builder.addCampo({
                    component: 'Label',
                    text: `<div class="flex items-center justify-between w-full">
                        <span class="flex items-center gap-2">
                            <span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">#${index + 1}</span>
                            <span class="font-medium">${campo.nombre}</span>
                            <span class="text-xs text-gray-400">(${campo.tipo})</span>
                            ${campo.requerido ? '<span class="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Req</span>' : ''}
                        </span>
                    </div>`,
                    tamaño: 'w-full',
                    icon: 'i-lucide-grip-vertical',
                })
            })
        } else {
            builder.addCampo({
                component: 'Label',
                text: '<p class="text-gray-400 italic">No hay campos asignados aún</p>',
                tamaño: 'w-full',
            })
        }
    }

    return builder.build()
}
