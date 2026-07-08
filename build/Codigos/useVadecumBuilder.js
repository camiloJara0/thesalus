import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useVadecumBuilder({
    storeId = 'VadecumNuevo',
    storePinia = 'Vadecum',
    cerrarModal = () => {},
    show = ref(false),
    tipoFormulario = 'Wizard',
    soloVer = false,
    eliminar = null,
} = {}) {

    const builder = new FormularioBuilder();

    if (eliminar) {
        builder
            .setFormularioTituloFormulario('Vádecum')
            .setFormularioTipo(tipoFormulario)
    }

    builder
        .setFormularioFondo(true)
        .setFormulariotamaño('SM')
        .nuevaSeccion('Código Vádecum')
        .setFormularioShow(show)
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'primary', },
            { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrarModal },
        ])
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setEliminarFormulario(eliminar)
        .setCamposRequeridos(['Vadecum.producto'])
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Datos basicos',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'muetramedica'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Número de expediente',
            id: 'expediente',
            name: 'expediente',
            tamaño: 'w-full',
            vmodel: 'Vadecum.expediente',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Nombre del producto',
            id: 'producto',
            name: 'producto',
            tamaño: 'w-full',
            vmodel: 'Vadecum.producto',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Empresa titular',
            id: 'titular',
            name: 'titular',
            tamaño: 'w-full',
            vmodel: 'Vadecum.titular',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Unidad comercial',
            id: 'unidad',
            name: 'unidad',
            tamaño: 'w-full',
            vmodel: 'Vadecum.unidad',
            upperCase: true
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Registro sanitario',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'muetramedica'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Número RS',
            id: 'registrosanitario',
            name: 'registrosanitario',
            tamaño: 'w-full',
            vmodel: 'Vadecum.registrosanitario',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            placeholder: 'Fecha Expedición',
            id: 'fechaexpedicion',
            name: 'fechaexpedicion',
            tamaño: 'w-full',
            vmodel: 'Vadecum.fechaexpedicion'
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            placeholder: 'Fecha Vencimiento',
            id: 'fechavencimiento',
            name: 'fechavencimiento',
            tamaño: 'w-full',
            vmodel: 'Vadecum.fechavencimiento'
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Estado Registro',
            id: 'estadoregistro',
            name: 'estadoregistro',
            tamaño: 'w-full',
            vmodel: 'Vadecum.estadoregistro',
            options: [
                { label: 'Activo', value: 'activo' },
                { label: 'Vencido', value: 'vencido' },
                { label: 'Suspendido', value: 'suspendido' }
            ]
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Expediente CUM',
            id: 'expedientecum',
            name: 'expedientecum',
            tamaño: 'w-full',
            vmodel: 'Vadecum.expedientecum',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Consecutivo CUM',
            id: 'consecutivocum',
            name: 'consecutivocum',
            tamaño: 'w-full',
            vmodel: 'Vadecum.consecutivocum',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Cantidad CUM',
            id: 'cantidadcum',
            name: 'cantidadcum',
            tamaño: 'w-full',
            vmodel: 'Vadecum.cantidadcum'
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Estado CUM',
            id: 'estadocum',
            name: 'estadocum',
            tamaño: 'w-full',
            vmodel: 'Vadecum.estadocum',
            options: [
                { label: 'Activo', value: 'activo' },
                { label: 'Inactivo', value: 'inactivo' }
            ]
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Datos farmaceuticos',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'muetramedica'
        })
        .addCampo({
            component: 'Textarea',
            placeholder: 'Descripción del producto',
            id: 'descripcioncomercial',
            name: 'descripcioncomercial',
            tamaño: 'w-full',
            vmodel: 'Vadecum.descripcioncomercial'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Código ATC',
            id: 'atc',
            name: 'atc',
            tamaño: 'w-full',
            vmodel: 'Vadecum.atc',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Descripción ATC',
            id: 'descripcionatc',
            name: 'descripcionatc',
            tamaño: 'w-full',
            vmodel: 'Vadecum.descripcionatc'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Oral, IV, IM, etc',
            id: 'viaadministracion',
            name: 'viaadministracion',
            tamaño: 'w-full',
            vmodel: 'Vadecum.viaadministracion'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tableta, cápsula, inyección, etc',
            id: 'formafarmaceutica',
            name: 'formafarmaceutica',
            tamaño: 'w-full',
            vmodel: 'Vadecum.formafarmaceutica'
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Componentes activos',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'muetramedica'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Principio Activo',
            id: 'principioactivo',
            name: 'principioactivo',
            tamaño: 'w-full',
            vmodel: 'Vadecum.principioactivo'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Concentración',
            id: 'concentracion',
            name: 'concentracion',
            tamaño: 'w-full',
            vmodel: 'Vadecum.concentracion'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Unidad de Medida',
            id: 'unidadmedida',
            name: 'unidadmedida',
            tamaño: 'w-full',
            vmodel: 'Vadecum.unidadmedida'
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            placeholder: 'Cantidad',
            id: 'cantidad',
            name: 'cantidad',
            tamaño: 'w-full',
            vmodel: 'Vadecum.cantidad'
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Informacion adicional',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'muetramedica'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Unidad de Referencia',
            id: 'unidadreferencia',
            name: 'unidadreferencia',
            tamaño: 'w-full',
            vmodel: 'Vadecum.unidadreferencia'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Nombre del Rol',
            id: 'nombrerol',
            name: 'nombrerol',
            tamaño: 'w-full',
            vmodel: 'Vadecum.nombrerol'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Rol',
            id: 'tiporol',
            name: 'tiporol',
            tamaño: 'w-full',
            vmodel: 'Vadecum.tiporol'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Modalidad',
            id: 'modalidad',
            name: 'modalidad',
            tamaño: 'w-full',
            vmodel: 'Vadecum.modalidad'
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Datos de control',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'muetramedica'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Muestra Médica',
            id: 'muestramedica',
            name: 'muestramedica',
            tamaño: 'w-full',
            vmodel: 'Vadecum.muestramedica'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'IUM',
            id: 'IUM',
            name: 'IUM',
            tamaño: 'w-full',
            vmodel: 'Vadecum.IUM',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            placeholder: 'Fecha Activo',
            id: 'fechaactivo',
            name: 'fechaactivo',
            tamaño: 'w-full',
            vmodel: 'Vadecum.fechaactivo'
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            placeholder: 'Fecha Inactivo',
            id: 'fechainactivo',
            name: 'fechainactivo',
            tamaño: 'w-full',
            vmodel: 'Vadecum.fechainactivo'
        })


    return builder.build()
}
