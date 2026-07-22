// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { reducirImagen } from '~/Core/Profesional/POSTMedico'
import { useProfesionalStore } from '~/stores/Entidades/Profesional'
import { municipios } from "~/data/municipios.js";
import { validarCelular, validarTelefono, validarDocumento, validarNombre, validarDireccion } from '~/composables/Formulario/useValidaciones'

export function useProfesionalBuilder({
    storeId,
    storePinia,
    camposRequeridos = [],
    cerrarModal,
    tipoFormulario,
    buscarUsuario,
    municipiosList,
    municipios_laboral,
    opcionesProfesion,
    show,
    verUser,
    soloVer,
    eliminar,
    validarFecha = () => { },
    validarTipoDoc = () => { },
}) {

    const profesionalStore = useProfesionalStore()

    const departamentosList = municipios?.map(d => ({
        label: d.nombre,
        value: d.nombre
    })) || []

    function filtrarMunicipios(departamentoSeleccionado) {
        const departamento = municipios.find(d => d.nombre === departamentoSeleccionado);
        municipiosList.value = departamento ? departamento.municipios.map(m => ({ label: `${m.NOMBRE} - ${m.CODIGO_MUNICIPIO}`, value: m.NOMBRE })) : [];
    }

    function filtrarMunicipiosLaboral(departamentoSeleccionado) {
        const departamento = municipios.find(d => d.nombre === departamentoSeleccionado);
        municipios_laboral.value = departamento ? departamento.municipios.map(m => ({ label: `${m.NOMBRE} - ${m.CODIGO_MUNICIPIO}`, value: m.NOMBRE })) : [];
    }

    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setEditarFormulario(verUser)
        .setSoloVer(soloVer)
        .setEliminarFormulario(eliminar)
        .setCamposRequeridos(camposRequeridos)
        .setFormulariotamaño('LG')
    if (verUser) {
        builder
            .setFormularioTituloFormulario('Modificar Usuario')
    } else {
        builder
            .setFormularioTituloFormulario('Nuevo Usuario')
    }
    builder
        .setFormularioShow(show)
        .setFormularioTipo(tipoFormulario)
        .setFormularioContenedorCampos('flex flex-col')
        .setBotones([
            { text: 'Siguiente', color: 'primary', type: 'enviar' },
            { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cerrar' },
        ])
        // 📌 Sección: Datos
        .nuevaSeccion('Datos usuarios')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Datos usuario',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'documento'
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            placeholder: 'Número de documento',
            id: 'documento',
            name: 'documento',
            tamaño: 'w-full',
            max: '10000000000',
            min: '1000000',
            vmodel: 'Profesional.info_usuario.No_document',
            validate: validarDocumento,
            events: {
                onKeyUp: buscarUsuario
            },
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Tipo de Documento',
            id: 'tipoDocumento',
            name: 'tipoDocumento',
            tamaño: 'w-full',
            options: [
                { label: 'Cédula de ciudadanía', value: 'cedula' },
                { label: 'Tarjeta de identidad', value: 'Tarjeta de identidad' },
                { label: 'Cédula Extranjera', value: 'extranjera' },
                { label: 'RC', value: 'RC' },
            ],
            vmodel: 'Profesional.info_usuario.type_doc',
            events: {
                onChange: validarTipoDoc
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Nombres y Apellidos',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            upperCase: true,
            vmodel: 'Profesional.info_usuario.name',
            minlength: 5,
            validate: validarNombre,
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            placeholder: 'Nacimiento',
            id: 'nacimiento',
            name: 'nacimiento',
            tamaño: 'w-full text-gray-500',
            vmodel: 'Profesional.info_usuario.nacimiento',
            slot: {
                tooltip: `<div id="error-fecha" class="text-red-300 text-xs mt-1"></div>`
            },
            events: {
                onChange: validarFecha
            }
        })

        // 📌 Sección: Ubicación
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-location-dot text-blue-700 mr-1"></i>Ubicacion',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'departamento'
        })
        .addCampo({
            component: 'SelectSearch',
            options: departamentosList,
            placeholder: 'Departamento',
            id: 'departamento',
            name: 'departamento',
            tamaño: 'md:w-full w-full',
            vmodel: 'Profesional.info_usuario.departamento',
            upperCase: true,
            events: {
                onChange: filtrarMunicipios
            }
        })
        .addCampo({
            component: 'SelectSearch',
            options: municipiosList.value,
            placeholder: 'Municipio',
            id: 'municipio',
            name: 'municipio',
            tamaño: 'md:w-full w-full',
            vmodel: 'Profesional.info_usuario.municipio',
            upperCase: true,
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Zona',
            id: 'zona',
            name: 'zona',
            tamaño: 'md:w-full w-full',
            options: [
                { label: 'Rural', value: 'Rural' },
                { label: 'Urbana', value: 'Urbana' },
            ],
            vmodel: 'Profesional.info_usuario.zona',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Barrio',
            id: 'barrio',
            name: 'barrio',
            tamaño: 'md:w-full w-full',
            minLength: '5',
            vmodel: 'Profesional.info_usuario.barrio',
            upperCase: true,
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Dirección',
            id: 'direccion',
            name: 'direccion',
            tamaño: 'md:w-full w-full',
            minLength: '5',
            vmodel: 'Profesional.info_usuario.direccion',
            upperCase: true,
            validate: validarDireccion,
        })

        // 📌 Sección: Contacto
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-phone text-blue-500 mr-1"></i>Contacto',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'celular'
        })
        .addCampo({
            component: 'Input',
            type: 'tel',
            placeholder: 'Celular',
            id: 'celular',
            name: 'celular',
            tamaño: 'md:w-full w-full',
            max: '10000000000',
            min: '1000000000',
            vmodel: 'Profesional.info_usuario.celular',
            validate: validarCelular,
        })
        .addCampo({
            component: 'Input',
            type: 'tel',
            placeholder: 'Teléfono (opcional)',
            id: 'telefono',
            name: 'telefono',
            tamaño: 'md:w-full w-full',
            max: '100000000',
            min: '100000',
            vmodel: 'Profesional.info_usuario.telefono',
            validate: validarTelefono,
        })



    builder
        .nuevaSeccion('Datos del Profesional')
        // 📌 Sección: Médico
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Medico',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'profesion'
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Profesión',
            id: 'profesion',
            name: 'profesion',
            tamaño: 'w-full md:col-span-2',
            options: opcionesProfesion,
            vmodel: 'Profesional.id_profesion',
        })

        // 📌 Sección: Ubicación Laboral
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Ubicación Laboral',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'listDepartamento'
        })
        .addCampo({
            component: 'SelectSearch',
            tamaño: 'w-full',
            placeholder: 'Departamento Laboral',
            id: 'listDepartamento',
            name: 'listDepartamento',
            options: departamentosList,
            vmodel: 'Profesional.departamento_laboral',
            upperCase: true,
            events: {
                onChange: filtrarMunicipiosLaboral
            }
        })
        .addCampo({
            component: 'SelectSearch',
            options: municipios_laboral.value,
            placeholder: 'Municipio Laboral',
            id: 'municipiolaboral',
            name: 'municipiolaboral',
            tamaño: 'md:w-full w-full',
            vmodel: 'Profesional.municipio_laboral',
            upperCase: true,
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Zona',
            id: 'zonaLaboral',
            name: 'zona_laboral',
            tamaño: 'w-full',
            options: [
                { label: 'Rural', value: 'Rural' },
                { label: 'Urbana', value: 'Urbana' }
            ],
            vmodel: 'Profesional.zona_laboral',
        })
        // 📌 Sección: Usuario
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user-secret text-sky-600 mr-1"></i>Datos usuario',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'correo-secret'
        })
        builder.addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Correo Electrónico',
            id: 'correo-secret',
            name: 'correo-secret',
            tamaño: 'w-full',
            minLength: '5',
            vmodel: 'Profesional.user.correo',
        })
    builder.addCampo({
        component: 'Input',
        type: 'file',
        placeholder: 'Firma y Sello',
        id: 'sello',
        name: 'sello',
        tamaño: 'w-full cursor-pointer',
        events: {
            onInput: async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const imagenReducida = await reducirImagen(file);
                    profesionalStore.Formulario.Profesional.sello = imagenReducida;
                }
            }
        }
    })


    return builder.build()
}