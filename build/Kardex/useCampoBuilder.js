import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useKardexStore } from '~/stores/Entidades/Kardex'

export function useCampoBuilder({
    modo = 'crear',
    campo = null,
    onGuardar,
    onCerrar,
    show
}) {
    const builder = new FormularioBuilder()
    const store = useKardexStore()
    const esModoEditar = modo === 'editar' && campo

    let opcionesIniciales = ''
    if (esModoEditar && campo.opciones) {
        const opts = Array.isArray(campo.opciones) ? campo.opciones : []
        opcionesIniciales = opts.map(o => typeof o === 'object' ? o.value || o.label : o).join('\n')
    }

    builder
        .setStoreId(esModoEditar ? 'ModificarCampo' : 'NuevoCampo')
        .setStorePinia('Kardex')
        .setFormulariotamaño('SM')
        .setFormularioShow(show)
        .setFormularioTipo('Wizard')
        .setFormularioTituloFormulario(esModoEditar ? 'Editar Campo' : 'Nuevo Campo')
        .setFormularioContenedorCampos('flex flex-col')
        .setBotones([
            { text: 'Guardar', color: 'primary', type: 'enviar' },
            { text: 'Cancelar', color: 'neutral', type: 'cerrar', accion: onCerrar },
        ])

    builder.nuevaSeccion('Definición de Campo')

    builder.addCampo({
        component: 'Input',
        type: 'text',
        placeholder: 'Nombre del campo',
        id: 'nombreCampo',
        name: 'nombreCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.nombre',
    })

    builder.addCampo({
        component: 'Input',
        type: 'text',
        placeholder: 'Titulo del campo',
        id: 'slugCampo',
        name: 'slugCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.titulo',
    })

    builder.addCampo({
        component: 'Select',
        placeholder: 'Tipo de campo',
        id: 'tipoCampo',
        name: 'tipoCampo',
        tamaño: 'w-full',
        options: [
            { label: 'Texto', value: 'text' },
            { label: 'Número', value: 'number' },
            { label: 'Selección (Select)', value: 'select' },
            { label: 'Sí / No', value: 'boolean' },
            { label: 'Fecha', value: 'date' },
            { label: 'Texto largo (Textarea)', value: 'textarea' },
        ],
        vmodel: 'Campo.tipo',
    })

    builder.addCampo({
        component: 'Input',
        type: 'text',
        placeholder: 'Texto de descripcion del campo',
        id: 'placeholderCampo',
        name: 'placeholderCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.descripcion',
    })

    builder.addCampo({
        component: 'Input',
        type: 'text',
        placeholder: 'Valor por defecto',
        id: 'placeholderCampo',
        name: 'placeholderCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.valor_defecto',
    })

    builder.addCampo({
        component: 'Input',
        type: 'number',
        placeholder: 'Orden de aparición',
        id: 'ordenCampo',
        name: 'ordenCampo',
        tamaño: 'w-full',
        min: '0',
        vmodel: 'Campo.orden',
    })

    builder.addCampo({
        component: 'Textarea',
        placeholder: 'Opciones (una por línea, solo para tipo Select)',
        id: 'opcionesCampo',
        name: 'opcionesCampo',
        tamaño: 'w-full col-span-2',
        vmodel: 'Campo.opciones',
        value: opcionesIniciales,
    })


    return builder.build()
}
