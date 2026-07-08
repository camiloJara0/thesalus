import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { reducirImagen } from '~/Core/Profesional/POSTMedico';
import { useConvenioStore } from '~/stores/Entidades/Convenio';

export function useConvenioBuilder({
    storeId = 'ConvenioNuevo',
    storePinia = 'Convenio',
    cerrarModal = () => { },
    show = ref(false),
    tipoFormulario = 'Wizard',
    soloVer = false,
    eliminar = null,
}) {

    const builder = new FormularioBuilder();
    const store = useConvenioStore()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setSoloVer(false)
        .setEliminarFormulario(eliminar)
        .setFormularioTipo(tipoFormulario)
        .setFormulariotamaño('SM')
        .setFormularioTituloFormulario('Convenio')
        .setFormularioFondo(true)
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'primary', },
            { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrarModal },
        ])
        .nuevaSeccion('Datos')
        .addCampo({
            vmodel: 'Convenio.nombre',
            component: 'Input',
            label: 'Nombre del Convenio',
            placeholder: 'Ej: Aseguradora XYZ',
            required: true,
            maxlength: 255,
            tamaño: 'w-full col-span-2',
        })
        .addCampo({
            component: 'Input',
            type: 'file',
            label: 'Logo URL',
            placeholder: 'URL del logo',
            required: false,
            tamaño: 'w-full col-span-2',
            events: {
                onChange: async (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const imagenReducida = await reducirImagen(file);
                        console.log(imagenReducida)
                        store.Formulario.Convenio.logo = imagenReducida;
                    }
                }
            }
        })


    return builder.build();
}
