import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useKardexStore } from '~/stores/Entidades/Kardex'

export function useCampoBuilder({
    modo = 'crear',
    campo = null,
    onGuardar,
    onCerrar,
    show,
    campos
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
        label: 'Nombre del campo *',
        placeholder: 'nombre_paciente',
        id: 'nombreCampo',
        name: 'nombreCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.nombre',
    })

    builder.addCampo({
        component: 'Input',
        type: 'text',
        label: 'Título del campo *',
        placeholder: 'Nombre',
        id: 'slugCampo',
        name: 'slugCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.titulo',
    })

    builder.addCampo({
        component: 'Select',
        label: 'Tipo de campo *',
        placeholder: 'Tipo de campo *',
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
            { label: 'Suma', value: 'suma' },
            { label: 'Resta', value: 'resta' },
            { label: 'Multiplicación', value: 'multiplicacion' },
            { label: 'División', value: 'division' },
        ],
        vmodel: 'Campo.tipo',
    })

    builder.addCampo({
        component: 'Input',
        type: 'text',
        label: 'Texto de descripción del campo',
        placeholder: 'Juan Perez',
        id: 'placeholderCampo',
        name: 'placeholderCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.descripcion',
    })

    builder.addCampo({
        component: 'Input',
        type: 'text',
        label: 'Valor por defecto (opcional)',
        placeholder: '(opcional)',
        id: 'placeholderCampo',
        name: 'placeholderCampo',
        tamaño: 'w-full',
        vmodel: 'Campo.valor_defecto',
    })

    builder.addCampo({
        component: 'SelectMultiple',
        label: 'Campos aplicados a formula (opcional)',
        placeholder: 'Celda X',
        id: 'formulaCampos',
        name: 'formulaCampos',
        tamaño: 'w-full',
        options: campos,
        vmodel: 'Campo.formulaCampos',
        labelKey: 'nombre',
        valueKey: 'id',
    })

    // builder.addCampo({
    //     component: 'Input',
    //     type: 'number',
    //     placeholder: 'Orden de aparición *',
    //     id: 'ordenCampo',
    //     name: 'ordenCampo',
    //     tamaño: 'w-full',
    //     min: '0',
    //     vmodel: 'Campo.orden',
    // })

    builder.addCampo({
        component: 'Textarea',
        label: 'Opciones (una por línea, solo aplica para tipo Select)',
        placeholder: 'Uno \nDos \nTres',
        id: 'opcionesCampo',
        name: 'opcionesCampo',
        tamaño: 'w-full col-span-2',
        vmodel: 'Campo.opciones',
        value: opcionesIniciales,
    })


    return builder.build()
}
