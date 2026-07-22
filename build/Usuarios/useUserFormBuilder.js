// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { CUPS } from '~/data/CUPS'
import { usePacientesStore } from "~/stores/Entidades/Paciente"
import { reducirImagen } from '~/Core/Profesional/POSTMedico'
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { validarCelular, validarTelefono, validarDocumento, validarNombre, validarDireccion, validarPasswordFortaleza } from '~/composables/Formulario/useValidaciones'

export function useUserBuilder({
    storeId,
    storePinia,
    camposRequeridos = [],
    cerrarModal,
    tipoFormulario,
    buscarUsuario,
    departamentos,
    seleccionarDepartamento,
    municipios,
    municipios_laboral,
    seleccionarMunicipio,
    EPS,
    opcionesProfesion,
    show,
    tipoUsuario,
    verUser,
    soloVer,
    eliminar,
    conveniosOptions = [],
    validarFecha = () => { },
    validarTipoDoc = () => { },
}) {

    const varView = useVarView()
    const pacienteStore = usePacientesStore()
    const medicoStore = useProfesionalStore()
    const user = varView.getRol

    const validarContraseña = (event) => {
        const valor = event.target.value
        const result = validarPasswordFortaleza(valor)

        const errorDiv = document.getElementById(`error-password`)
        if (errorDiv) {
            if (result.level > 0) {
                const colors = { 1: 'text-red-400', 2: 'text-yellow-400', 3: 'text-green-400' }
                errorDiv.innerHTML = `<p class="${colors[result.level]}">${result.text}</p>`
            } else {
                errorDiv.innerHTML = ''
            }
        }
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
                { text: 'Cédula de ciudadanía', value: 'cedula' },
                { text: 'Tarjeta de identidad', value: 'Tarjeta de identidad' },
                { text: 'Cédula Extranjera', value: 'extranjera' },
                { text: 'RC', value: 'RC' },
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
            text: '<i class="fa-solid fa-location-dot text-blue-700 mr-1"></i>Ubicacion',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'departamento'
        })
        .addCampo({
            component: 'SelectSearch',
            options: departamentos,
            opciones: [{ value: "nombre" }, { text: 'Nombre:', value: 'nombre' }],
            seleccionarItem: seleccionarDepartamento,
            placeholder: 'Departamento',
            id: 'departamento',
            name: 'departamento',
            tamaño: 'md:w-full w-full',
            vmodel: 'InformacionUser.departamento',
            upperCase: true,
            events: {
                onChange: () => {

                }
            }
        })
        .addCampo({
            component: 'SelectSearch',
            options: municipios,
            opciones: [{ value: "NOMBRE" }, { text: 'Codigo:', value: 'CODIGO_MUNICIPIO' }],
            seleccionarItem: seleccionarMunicipio,
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
                { text: 'Rural', value: 'Rural' },
                { text: 'Urbana', value: 'Urbana' },
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

    if (tipoUsuario === 'Administrador') {
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

    }

    if (tipoUsuario === 'Paciente') {
        builder
            .nuevaSeccion('Datos Paciente')
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
                tamaño: 'w-full col-span-2',
                forLabel: 'Sexo'
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Sexo al Nacer',
                id: 'Sexo',
                name: 'Sexo',
                tamaño: 'w-full md:col-span-1 col-span-2',
                options: [
                    { text: 'Masculino', value: 'masculino' },
                    { text: 'Femenino', value: 'femenino' },
                ],
                vmodel: 'Paciente.sexo',
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Identidad de Género',
                id: 'genero',
                name: 'genero',
                tamaño: 'w-full md:col-span-1 col-span-2',
                options: [
                    { text: 'Masculino', value: 'masculino' },
                    { text: 'Femenino', value: 'femenino' },
                    { text: 'Neutro', value: 'neutro' },
                    { text: 'No lo declara', value: 'no lo declara' },
                    { text: 'Transgenero', value: 'transgenero' },
                ],
                vmodel: 'Paciente.genero',
            })

            // 📌 Sección: Datos adicionales
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-file text-blue-500 mr-1"></i>Datos Adicionales',
                tamaño: 'w-full col-span-2',
                forLabel: 'eps'
            })
            .addCampo({
                component: 'Select',
                placeholder: 'EPS',
                id: 'eps',
                name: 'eps',
                tamaño: ' w-full md:col-span-1 col-span-2',
                options: EPS,
                vmodel: 'Paciente.id_eps',
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Régimen',
                id: 'regimen',
                name: 'regimen',
                tamaño: ' w-full md:col-span-1 col-span-2',
                options: [
                    { text: 'Contributivo', value: 'Contributivo' },
                    { text: 'Subsidiado', value: 'Subsidiado' },
                    { text: 'Especial/Excepcion', value: 'Especial/Excepcion' },
                ],
                vmodel: 'Paciente.regimen',
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Población Vulnerable',
                id: 'poblacionVulnerable',
                name: 'poblacionVulnerable',
                tamaño: 'w-full',
                options: [
                    { text: 'Ninguno', value: 'Ninguno' },
                    { text: 'Adultos Mayores', value: 'Adultos Mayores' },
                    { text: 'Discapacidad', value: 'Discapacidad' },
                    { text: 'Victimas Conflicto Armado', value: 'Victimas Conflicto Armado' },
                    { text: 'Habitantes de calle', value: 'Habitantes de calle' },
                    { text: 'Poblacion LGBTIQ+', value: 'Poblacion LGBTIQ+' },
                    { text: 'Grupos étnicos', value: 'Grupos étnicos' },
                    { text: 'Personas privadas de la libertad', value: 'Personas privadas de la libertad' },
                    { text: 'Desmovilizados', value: 'Desmovilizados' },
                    { text: 'Migrantes colombianos repatriados', value: 'Migrantes colombianos repatriados' },
                    { text: 'Madres comunitarias o sustitutas', value: 'Madres comunitarias o sustitutas' },
                    { text: 'Voluntarios activos', value: 'Voluntarios activos' },
                    { text: 'Personas con enfermedades huerfanas o catastroficas', value: 'Personas con enfermedades huerfanas o catastroficas' },
                ],
                vmodel: 'Paciente.vulnerabilidad',
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Selecciona Convenio (opcional)',
                id: 'convenio',
                name: 'convenio',
                tamaño: 'w-full md:col-span-1 col-span-2',
                options: conveniosOptions,
                vmodel: 'Paciente.convenio_id',
            })

        if (user === 'Admin') {
            builder
                // 📌 Sección: tratamientos
                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Procedimientos (opcional)',
                    buttons: [{ icon: 'fa-solid fa-kit-medical', label: 'Agregar', color: 'bg-green-500', addItem: { procedimiento: '', codigo: '', dias_asignados: '', } },],
                    tamaño: 'w-full cols-span-2 mb-6',
                    vmodel: 'Plan_manejo_procedimientos',
                    liveUpdate: true,
                    value: [],
                    campos: [
                        {
                            name: 'procedimiento',
                            id: 'descripcionProcedimiento',
                            typeCampo: 'SelectSearch',
                            placeholder: 'Procedimiento',
                            tamaño: 'w-full md:col-span-2',
                            UpperCase: true,
                            options: CUPS,
                            opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                            seleccionarItem: (item) => {
                                pacienteStore.Formulario.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                                pacienteStore.Formulario.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                            },
                        },
                        {
                            name: 'dias_asignados',
                            id: 'dias_asignados',
                            typeCampo: 'Input',
                            placeholder: 'Numero de Veces',
                            tamaño: 'w-full',
                        },
                    ],
                    containerCampos: 'grid md:grid-cols-2 grid-cols-1 gap-2'
                })
                // 📌 Sección: Antecedentes
                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Antecedentes',
                    buttons: [
                        { icon: 'fa-solid fa-plus', color: 'bg-blue-500', label: 'Personal', addItem: { descripcion: '', tipo: '' } },
                        { icon: 'fa-solid fa-plus', color: 'bg-blue-700', label: 'Familiar', addItem: { descripcion: '', tipo: 'Familiar' } },
                    ],
                    tamaño: 'w-full col-span-2',
                    vmodel: 'Antecedentes_nuevos',
                    value: [],
                    campos: [
                        {
                            name: 'descripcion',
                            id: 'antecedente',
                            typeCampo: 'Input',
                            type: 'text',
                            placeholder: 'Antecedente',
                            UpperCase: true,
                            tamaño: 'w-full'
                        },
                        {
                            name: 'tipo',
                            id: 'tipoAntecedente',
                            typeCampo: 'Select',
                            placeholder: 'Tipo Antecedente',
                            options: [
                                {
                                    text: 'Personal',
                                    value: 'Personal'
                                },
                                {
                                    text: 'Familiar',
                                    value: 'Familiar'
                                }
                            ],
                            tamaño: 'w-full'
                        },
                    ],
                    containerCampos: 'grid md:grid-cols-2 grid-cols-1 gap-2'
                })

        }

    }


    if (tipoUsuario === 'Profesional') {
        builder
            .nuevaSeccion('Datos Profesional')
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
                options: departamentos,
                opciones: [{ value: "nombre" }, { text: 'Nombre: ', value: 'nombre' }],
                seleccionarItem: seleccionarDepartamento,
                vmodel: 'Profesional.departamento_laboral',
                upperCase: true,
            })
            .addCampo({
                component: 'SelectSearch',
                options: municipios_laboral,
                opciones: [{ value: "NOMBRE" }, { text: 'Codigo:', value: 'CODIGO_MUNICIPIO' }],
                seleccionarItem: seleccionarMunicipio,
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
                    { text: 'Rural', value: 'Rural' },
                    { text: 'Urbana', value: 'Urbana' }
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
        if (verUser) {
            builder.addCampo({
                component: 'Input',
                type: 'text',
                placeholder: 'Correo Electrónico',
                id: 'correo-secret',
                name: 'correo-secret',
                tamaño: 'w-full',
                minLength: '5',
                vmodel: 'User.correo',
            })
        } else {
            builder.addCampo({
                component: 'Input',
                type: 'text',
                placeholder: 'Correo Electrónico',
                id: 'correo-secret',
                name: 'correo-secret',
                tamaño: 'w-full',
                minLength: '5',
                vmodel: 'User.correo',
            })
        }
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
                        medicoStore.Formulario.Profesional.sello = imagenReducida;
                    }
                }
            }
        })
    }

    return builder.build()
}