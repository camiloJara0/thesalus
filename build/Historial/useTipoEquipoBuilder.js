// builders/useTipoEquipoBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useTipoEquiposBuilder({
    storeId,
    storePinia,
    show,
    cerrarModal,
}) {

    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setFormulariotamaño('SM')
        .setFormularioTipo('Form')
        .setBotones([
            { type: 'enviar', text: 'Siguiente', color: 'primary', },
            { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cerrar' },
        ])
            .setFormularioTituloFormulario('Tipo Equipo')
    builder
        .nuevaSeccion('Tipo Equipo')
            builder
                .addCampo({
                    component: 'Input',
                    type: 'text',
                    label: 'Nombre del tipo de equipo *',
                    placeholder: 'Ej: Monitor, Desfibrilador, Ventilador',
                    id: 'nombre_tipo',
                    name: 'nombre_tipo',
                    tamaño: 'col-span-2',
                    minlength: 3,
                    vmodel: 'Tipo_equipo.nombre'
                })
                .addCampo({
                    component: 'Textarea',
                    type: 'text',
                    label: 'Descripción del tipo de equipo *',
                    placeholder: 'Ej: Equipo médico encargado de monitoreo',
                    id: 'descripcion_tipo',
                    name: 'descripcion_tipo',
                    tamaño: 'col-span-2',
                    minlength: 3,
                    vmodel: 'Tipo_equipo.descripcion'
                })


    return builder.build()
}