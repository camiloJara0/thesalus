// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { municipios } from "~/data/municipios.js";
import { validarCelular, validarTelefono, validarDocumento, validarNombre, validarDireccion } from '~/composables/Formulario/useValidaciones'

export function useAdministradorBuilder({
    storeId,
    storePinia,
    cerrarModal,
    tipoFormulario,
    buscarUsuario,
    municipiosList,
    show,
    verUser,
    soloVer,
    eliminar,
    validarFecha = () => { },
    validarTipoDoc = () => { },
    validarContraseña = () => {},
}) {

    const departamentosList = municipios?.map(d => ({
        label: d.nombre,
        value: d.nombre
    })) || []

    function filtrarMunicipios(departamentoSeleccionado) {
        const departamento = municipios.find(d => d.nombre === departamentoSeleccionado);
        municipiosList.value = departamento ? departamento.municipios.map(m => ({ label: `${m.NOMBRE} - ${m.CODIGO_MUNICIPIO}`, value: m.NOMBRE })) : [];
    }

    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setEditarFormulario(verUser)
        .setSoloVer(soloVer)
        .setEliminarFormulario(eliminar)
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
            text: '<p>Datos usuario</p>',
            tamaño: 'w-full md:col-span-2',
            icon: 'i-lucide-user',
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
            vmodel: 'InformacionUser.No_document',
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
            vmodel: 'InformacionUser.type_doc',
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
            vmodel: 'InformacionUser.name',
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
            vmodel: 'InformacionUser.nacimiento',
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
            text: '<p>Ubicacion</p>',
            tamaño: 'w-full md:col-span-2',
            icon: 'i-lucide-map-pin',
            forLabel: 'departamento'
        })
        .addCampo({
            component: 'SelectSearch',
            options: departamentosList,
            placeholder: 'Departamento',
            id: 'departamento',
            name: 'departamento',
            tamaño: 'md:w-full w-full',
            vmodel: 'InformacionUser.departamento',
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
            vmodel: 'InformacionUser.municipio',
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
            vmodel: 'InformacionUser.zona',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Barrio',
            id: 'barrio',
            name: 'barrio',
            tamaño: 'md:w-full w-full',
            minLength: '5',
            vmodel: 'InformacionUser.barrio',
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
            vmodel: 'InformacionUser.direccion',
            upperCase: true,
            validate: validarDireccion,
        })

        // 📌 Sección: Contacto
        .addCampo({
            component: 'Label',
            text: '<p>Contacto</p>',
            icon: 'i-lucide-phone',
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
            vmodel: 'InformacionUser.celular',
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
            vmodel: 'InformacionUser.telefono',
            validate: validarTelefono,
        })


        builder
            // 📌 Sección: Usuario
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-user-secret text-sky-600 mr-1"></i>Datos usuario',
                tamaño: 'w-full md:col-span-2',
                forLabel: 'correo-secret'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                placeholder: 'Correo Electrónico',
                id: 'correo-secret',
                name: 'correo-secret',
                tamaño: 'w-full',
                minLength: '5',
                mayuscula: false,
                vmodel: 'User.correo',
            })
            if(!verUser){
                builder
                .addCampo({
                    component: 'Input',
                    type: 'password',
                    placeholder: 'Crea una contraseña',
                    id: 'contraseña-usuario',
                    name: 'contraseña-usuario',
                    minLength: '5',
                    mayuscula: false,
                    vmodel: 'User.contraseña',
                    slot: {
                        html: `<div id="error-password"></div>`
                    },
                    events: {
                        onChange: validarContraseña
                    }
                })
            }

    return builder.build()
}