// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useEpsBuilder({
    storeId,
    storePinia,
    showModificarEPS,
    cerrar,
    eliminar
}) {

    const builder = new FormularioBuilder()
    if (eliminar) {
        builder
        .setFormularioTituloFormulario('EPS')
        .setFormularioTipo('Wizard')
    }
    builder
        .setFormularioFondo(true)
        .setFormulariotamaño('SM')
        .nuevaSeccion('Formulario EPS')
        .setFormularioShow(showModificarEPS)
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'primary', },
            { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrar },
        ])
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setEliminarFormulario(eliminar)
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-hospital text-purple-500 mr-1"></i>Agregar Nueva EPS',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'eps'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre EPS',
            placeholder: 'Coomeva',
            id: 'eps',
            name: 'eps',
            tamaño: 'w-full col-span-2',
            minlength: 5,
            vmodel: 'EPS.nombre',
            upperCase: true,
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            maxLength: 3,
            label: 'Codigo',
            placeholder: 'Ej: 001',
            id: 'codigo',
            name: 'codigo',
            tamaño: 'col-span-2',
            vmodel: 'EPS.codigo',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            maxLength: 3,
            label: 'Nit',
            placeholder: 'Ej: 123456789',
            id: 'nit',
            name: 'nit',
            vmodel: 'EPS.nit',
            upperCase: true,
            tamaño: 'col-span-2'
        })


    return builder.build()
}