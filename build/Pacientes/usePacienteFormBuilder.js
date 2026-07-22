// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { CUPS } from '~/data/CUPS'
import { usePacientesStore } from "~/stores/Entidades/Paciente"
import { municipios } from "~/data/municipios.js";
import { validarCelular, validarTelefono, validarDocumento, validarNombre, validarDireccion } from '~/composables/Formulario/useValidaciones'

export function usePacienteBuilder({
    storeId,
    storePinia,
    camposRequeridos = [],
    cerrarModal,
    tipoFormulario,
    buscarUsuario,
    municipiosList,
    EPS,
    show,
    verUser,
    soloVer,
    eliminar,
    conveniosOptions = [],
    validarFecha = () => { },
    validarTipoDoc = () => { },
}) {

    const varView = useVarView()
    const pacienteStore = usePacientesStore()
    const user = varView.getRol

    // const opcionesCups = CUPS.map(c => {return {label: `${c.DESCRIPCION} - ${c.CODIGO}`, value: c.DESCRIPCION}})

    const departamentosList = municipios?.map(d => ({
        label: d.nombre,
        value: d.nombre
    })) || []

    function filtrarMunicipios(departamentoSeleccionado) {
        const departamento = municipios.find(d => d.nombre === departamentoSeleccionado);
        municipiosList.value = departamento ? departamento.municipios.map(m => ({ label: `${m.NOMBRE} - ${m.CODIGO_MUNICIPIO}`, value: m.NOMBRE })) : [];
    }

    function seleccionarProcedimiento(item) {
        pacienteStore.Formulario.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
        pacienteStore.Formulario.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
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
            vmodel: 'Paciente.info_usuario.No_document',
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
            vmodel: 'Paciente.info_usuario.type_doc',
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
            vmodel: 'Paciente.info_usuario.name',
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
            vmodel: 'Paciente.info_usuario.nacimiento',
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
            vmodel: 'Paciente.info_usuario.departamento',
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
            vmodel: 'Paciente.info_usuario.municipio',
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
            vmodel: 'Paciente.info_usuario.zona',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Barrio',
            id: 'barrio',
            name: 'barrio',
            tamaño: 'md:w-full w-full',
            minLength: '5',
            vmodel: 'Paciente.info_usuario.barrio',
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
            vmodel: 'Paciente.info_usuario.direccion',
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
            type: 'number',
            placeholder: 'Celular',
            id: 'celular',
            name: 'celular',
            tamaño: 'md:w-full w-full',
            max: '10000000000',
            min: '1000000000',
            vmodel: 'Paciente.info_usuario.celular',
            validate: validarCelular,
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            placeholder: 'Teléfono (opcional)',
            id: 'telefono',
            name: 'telefono',
            tamaño: 'md:w-full w-full',
            max: '100000000',
            min: '100000',
            vmodel: 'Paciente.info_usuario.telefono',
            validate: validarTelefono,
        })


    builder
        .nuevaSeccion('Datos Paciente')
        .addCampo({
            component: 'Label',
            text: '<p>Paciente</p>',
            icon: 'i-lucide-user',
            tamaño: 'w-full col-span-2',
            forLabel: 'Sexo'
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Sexo al Nacer',
            id: 'Sexo',
            name: 'Sexo',
            tamaño: 'w-full',
            options: [
                { label: 'Masculino', value: 'masculino' },
                { label: 'Femenino', value: 'femenino' },
            ],
            vmodel: 'Paciente.sexo',
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Identidad de Género',
            id: 'genero',
            name: 'genero',
            tamaño: 'w-full',
            options: [
                { label: 'Masculino', value: 'masculino' },
                { label: 'Femenino', value: 'femenino' },
                { label: 'Neutro', value: 'neutro' },
                { label: 'No lo declara', value: 'no lo declara' },
                { label: 'Transgenero', value: 'transgenero' },
            ],
            vmodel: 'Paciente.genero',
        })

        // 📌 Sección: Datos adicionales
        .addCampo({
            component: 'Label',
            text: '<p>Datos Adicionales</p>',
            icon: 'i-lucide-file',
            tamaño: 'w-full col-span-2',
            forLabel: 'eps'
        })
        .addCampo({
            component: 'Select',
            placeholder: 'EPS',
            id: 'eps',
            name: 'eps',
            tamaño: ' w-full',
            options: EPS,
            vmodel: 'Paciente.id_eps',
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Régimen',
            id: 'regimen',
            name: 'regimen',
            tamaño: ' w-full',
            options: [
                { label: 'Contributivo', value: 'Contributivo' },
                { label: 'Subsidiado', value: 'Subsidiado' },
                { label: 'Especial/Excepcion', value: 'Especial/Excepcion' },
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
                { label: 'Ninguno', value: 'Ninguno' },
                { label: 'Adultos Mayores', value: 'Adultos Mayores' },
                { label: 'Discapacidad', value: 'Discapacidad' },
                { label: 'Victimas Conflicto Armado', value: 'Victimas Conflicto Armado' },
                { label: 'Habitantes de calle', value: 'Habitantes de calle' },
                { label: 'Poblacion LGBTIQ+', value: 'Poblacion LGBTIQ+' },
                { label: 'Grupos étnicos', value: 'Grupos étnicos' },
                { label: 'Personas privadas de la libertad', value: 'Personas privadas de la libertad' },
                { label: 'Desmovilizados', value: 'Desmovilizados' },
                { label: 'Migrantes colombianos repatriados', value: 'Migrantes colombianos repatriados' },
                { label: 'Madres comunitarias o sustitutas', value: 'Madres comunitarias o sustitutas' },
                { label: 'Voluntarios activos', value: 'Voluntarios activos' },
                { label: 'Personas con enfermedades huerfanas o catastroficas', value: 'Personas con enfermedades huerfanas o catastroficas' },
            ],
            vmodel: 'Paciente.vulnerabilidad',
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Selecciona Convenio (opcional)',
            id: 'convenio',
            name: 'convenio',
            tamaño: 'w-full',
            options: conveniosOptions,
            vmodel: 'Paciente.convenio_id',
        })

    if (user === 'Admin') {
        builder
            // 📌 Sección: tratamientos
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Procedimientos (opcional)',
                buttons: [{ icon: 'i-lucide-plus', label: 'Agregar', color: 'bg-green-500', addItem: { procedimiento: '', codigo: '', dias_asignados: '', } },],
                tamaño: 'w-full cols-span-2 mb-6',
                vmodel: 'Paciente.plan_manejo_procedimientos',
                liveUpdate: true,
                value: [],
                campos: [
                    {
                        name: 'procedimiento',
                        id: 'descripcionProcedimiento',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Procedimiento',
                        tamaño: 'w-full col-span-2',
                        UpperCase: true,
                        options: CUPS,
                        opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                        seleccionarItem: (item) => {
                                pacienteStore.Formulario.Paciente.plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                                pacienteStore.Formulario.Paciente.plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                        },
                        label: 'Procedimiento CUPS'
                    },
                    {
                        name: 'dias_asignados',
                        id: 'dias_asignados',
                        typeCampo: 'Input',
                        placeholder: 'Numero de Veces',
                        tamaño: 'w-full',
                        label: 'Dias asignados'
                    },
                ],
                containerCampos: 'grid md:grid-cols-2 grid-cols-1 gap-2'
            })
            // 📌 Sección: Antecedentes
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Antecedentes (opcional)',
                buttons: [
                    { icon: 'i-lucide-plus', color: 'bg-blue-500', label: 'Personal', addItem: { descripcion: '', tipo: '' } },
                    { icon: 'i-lucide-plus', color: 'bg-blue-700', label: 'Familiar', addItem: { descripcion: '', tipo: 'Familiar' } },
                ],
                tamaño: 'w-full col-span-2',
                vmodel: 'Paciente.antecedente',
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'antecedente',
                        typeCampo: 'Input',
                        type: 'text',
                        placeholder: 'Antecedente',
                        UpperCase: true,
                        tamaño: 'w-full',
                        label: 'Antecedente'
                    },
                    {
                        name: 'tipo',
                        id: 'tipoAntecedente',
                        typeCampo: 'Select',
                        placeholder: 'Tipo Antecedente',
                        options: [
                            {
                                label: 'Personal',
                                value: 'Personal'
                            },
                            {
                                label: 'Familiar',
                                value: 'Familiar'
                            }
                        ],
                        tamaño: 'w-full',
                        label: 'Tipo'
                    },
                ],
                containerCampos: 'grid md:grid-cols-2 grid-cols-1 gap-2'
            })


    }

    return builder.build()
}