// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'

export function useVerPlantillas({
    storeId,
    storePinia,
    cerrarModal,
    show,
}) {

    const CIF = []
    const CUPS = []
    const CIE10 = []
    const medicamentos = []
    const puedePostAnalisis = true
    const id_paciente = 0
    const historiaStore = useHistoriasStore()
    const varView = useVarView()

    function seleccionarCIE_10(code) {
    }

    function seleccionarVadecum(item) {
    }

    function validarCampo(event) {

    }

    async function buscarMedicamentos(event) {

    }

    const builder = new FormularioBuilder()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('LG')
        .setFormularioTituloFormulario('Registrar Consulta')
        .setFormularioShow(show)
        .setFormularioSoloVer(true)
        .setFormularioTipo('Wizard')
        .setBotones([
            { text: 'Siguiente', color: 'primary', type: 'enviar' },
            { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cerrar' },
        ])


    // Tipo terapia
    if (varView.tipoConsulta?.plantilla === 'Terapia') {
        builder
            // 📌 Sección: Datos
            .nuevaSeccion('Datos usuarios')
            .addCampo({
                component: 'Label',
                forLabel: 'nombre',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente'
            })
            // --- Nombre Paciente ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.name_paciente',
                id: 'nombre',
                name: 'nombre',
                placeholder: 'Nombre del paciente',
                tamaño: 'w-full md:col-span-2',
                disabled: true
            })

            // --- Numero de documento ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.historia.No_document_paciente',
                id: 'documento',
                name: 'documento',
                placeholder: 'Numero de documento',
                tamaño: 'w-full',
                label: 'Número de documento',
                disabled: true
            })

            // --- Tipo de documento ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.historia.type_doc_paciente',
                id: 'tipoDocumento',
                name: 'tipoDocumento',
                placeholder: 'Tipo de documento',
                tamaño: 'w-full md:col-span-2',
                options: [
                    { label: 'Cedula de ciudadania', value: 'cedula' },
                    { label: 'Cedula Extranjera', value: 'extranjera' },
                    { label: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
                label: 'Tipo de documento',
                disabled: true
            })
            // --- Label: Sesión ---
            .addCampo({
                component: 'Label',
                forLabel: 'sesion',
                text: '<i class="fa-solid fa-list-ol text-blue-500 mr-1"></i>Número de sesión',
                tamaño: 'w-full md:mt-5'
            })

            // --- Input: Sesión ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.Terapia.sesion',
                type: 'number',
                id: 'sesion',
                name: 'sesion',
                placeholder: 'Ej: 1, 2, 3...',
                tamaño: 'w-full md:mt-5',
            })

            //--- Label: Fecha ---
            .addCampo({
                component: 'Label',
                forLabel: 'fechaTerapia',
                text: '<i class="fa-solid fa-calendar-day text-blue-500 mr-1"></i>Fecha de la sesión',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Input: Hora ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.Terapia.hora',
                type: 'time',
                id: 'horaTerapia',
                name: 'horaTerapia',
                placeholder: 'Selecciona la hora',
                tamaño: 'w-full',
            })

            // --- Input: Fecha ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.Terapia.fecha',
                type: 'date',
                id: 'fechaTerapia',
                name: 'fechaTerapia',
                placeholder: 'Selecciona la fecha',
                tamaño: 'w-full',
            })


            .nuevaSeccion(varView.tipoConsulta.name)

            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Diagnosticos (CIE-10)',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Diagnosticos',
                liveUpdate: true,
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Diagnostico',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                    {
                        name: 'codigo',
                        id: 'cie-10',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'CIE-10',
                        upperCase: true,
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'code' }, { text: 'Descripcion: ', value: 'description' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })

            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Analisis.Diagnosticos Relacionados (CIF)',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'DiagnosticosCIF',
                liveUpdate: true,
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Diagnostico Relacionado',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIF,
                        opciones: [{ value: 'nombre' }, { text: 'Codigo', value: 'codigo' }],
                        seleccionarItem: (item) => {
                            historiaStore.Formulario.DiagnosticosCIF.at(-1).codigo = item.codigo
                            historiaStore.Formulario.DiagnosticosCIF.at(-1).descripcion = item.nombre
                        },
                    },
                    {
                        name: 'codigo',
                        id: 'codigo',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'CIF',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIF,
                        opciones: [{ value: 'codigo' }, { text: 'Nombre: ', value: 'nombre' }],
                        seleccionarItem: (item) => {
                            historiaStore.Formulario.DiagnosticosCIF.at(-1).codigo = item.codigo
                            historiaStore.Formulario.DiagnosticosCIF.at(-1).descripcion = item.nombre
                        },
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-1'
            })

            // --- Label: Objetivos ---
            .addCampo({
                component: 'Label',
                forLabel: 'objetivos',
                text: '<i class="fa-solid fa-bullseye text-blue-500 mr-1"></i>Objetivos de la intervención terapéutica',
                tamaño: 'w-full col-span-2 mt-3'
            })

            // --- Input: Objetivos ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.Terapia.objetivos',
                type: 'text',
                id: 'objetivos',
                name: 'objetivos',
                placeholder: 'Describe el objetivo de la sesión terapéutica',
                tamaño: 'w-full col-span-2',
            })

            // --- Label: Evolución ---
            .addCampo({
                component: 'Label',
                forLabel: 'evolucion',
                text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Evolución de la sesión',
                tamaño: 'w-full col-span-2'
            })

            // --- TextArea: Evolución ---
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.Terapia.evolucion',
                id: 'evolucion',
                name: 'evolucion',
                placeholder: 'Describe de manera clara la evolución del paciente durante la sesión',
                tamaño: 'w-full col-span-2'
            })

    } else if (varView.tipoConsulta?.plantilla === 'Evolucion') {
        builder
            // 📌 Sección: Datos
            .nuevaSeccion('Datos usuarios')
            .addCampo({
                component: 'Label',
                forLabel: 'nombre',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente'
            })
            // --- Nombre Paciente ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.name_paciente',
                id: 'nombre',
                name: 'nombre',
                placeholder: 'Nombre del paciente',
                tamaño: 'md:col-span-2 w-full',
                disable: true
            })

            // --- Numero de documento ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.No_document_paciente',
                id: 'documento',
                name: 'documento',
                placeholder: 'Numero de documento',
                tamaño: 'w-full',
                label: 'Número de documento',
                disabled: true
            })

            // --- Tipo de documento ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.historia.type_doc_paciente',
                id: 'tipoDocumento',
                name: 'tipoDocumento',
                placeholder: 'Tipo de documento',
                tamaño: 'w-full',
                options: [
                    { label: 'Cedula de ciudadania', value: 'cedula' },
                    { label: 'Cedula Extranjera', value: 'extranjera' },
                    { label: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
                label: 'Tipo de documento',
                disabled: true
            })

            // --- Label Acompañante ---
            .addCampo({
                component: 'Label',
                forLabel: 'nombreAcompañante',
                size: 'text-sm',
                text: '<i class="fa-solid fa-users text-blue-700 mr-1"></i>Cuidador (Opcional)',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Nombre Acompañante ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.acompañante',
                type: 'text',
                id: 'nombreAcompañante',
                name: 'nombreAcompañante',
                placeholder: 'Nombre completo del cuidador',
                tamaño: 'w-full'
            })

            // --- Parentesco Acompañante ---
            .addCampo({
                component: 'Select',
                id: 'parentesco',
                name: 'parentesco',
                placeholder: 'Seleccione el parentesco',
                tamaño: 'w-full',
                options: [
                    { label: 'Padre', value: 'Padre' },
                    { label: 'Madre', value: 'Madre' },
                    { label: 'Hijo', value: 'Hijo' },
                    { label: 'Conyuge', value: 'Conyuge' },
                    { label: 'Hermano/a', value: 'Hermano/a' }
                ]
            })

            .nuevaSeccion('Examen Fisico')
            .addCampo({
                component: 'Label',
                forLabel: 'ta',
                text: '<i class="fa-solid fa-heart-pulse text-blue-500 mr-1"></i>Signos Vitales',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Input: TA ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.ta',
                type: 'text',
                id: 'ta',
                name: 'ta',
                placeholder: 'TA (90-140/60-90 mmHg)',
                tamaño: 'w-full col-span-0.5',
                slot: {
                    tooltip: `<div id="error-ta" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                },
            })

            // --- Input: FC ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.fc',
                type: 'number',
                id: 'fc',
                name: 'fc',
                placeholder: 'FC (60-100 lpm)',
                max: 100,
                tamaño: 'w-full col-span-0.5',
                slot: {
                    tooltip: `<div id="error-fc" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })

            // --- Input: FR ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.fr',
                type: 'number',
                id: 'fr',
                name: 'fr',
                placeholder: 'FR (12-20 rpm)',
                max: 250,
                tamaño: 'w-full',
                slot: {
                    tooltip: `<div id="error-fr" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })

            // --- Input: Temperatura (Tº) ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.t',
                type: 'number',
                id: 't',
                name: 't',
                placeholder: 'Tº (36.1-37.2°C)',
                max: 50,
                tamaño: 'w-full',
                slot: {
                    tooltip: `<div id="error-t" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })

            // --- Input: Saturación O2 ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.SATo2',
                type: 'number',
                id: 'sat',
                name: 'sat',
                placeholder: 'Sat O2 (90% - 100%)',
                max: 100,
                tamaño: 'w-full col-span-1',
                slot: {
                    tooltip: `<div id="error-sat" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })
            // --- Input: Otros ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.otros',
                type: 'text',
                id: 'otros',
                name: 'otros',
                placeholder: 'Otros (opcional)',
                tamaño: 'w-full col-span-1'
            })

            // --- Label: Medidas Antropométricas ---
            .addCampo({
                component: 'Label',
                forLabel: 'altura',
                text: '<i class="fa-solid fa-weight-hanging text-blue-600 mr-1"></i>Medidas Antropométricas',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Input: Peso ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.peso',
                type: 'number',
                id: 'peso',
                name: 'peso',
                placeholder: 'Peso (KG)',
                tamaño: 'w-full col-span-1'
            })

            // --- Input: Altura ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.altura',
                type: 'number',
                id: 'altura',
                name: 'altura',
                placeholder: 'Altura (CM)',
                tamaño: 'w-full col-span-1'
            })

            .addCampo({
                component: 'Label',
                forLabel: 'motivo',
                size: 'text-sm',
                tamaño: 'w-full col-span-2',
                text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Consulta'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.motivo',
                id: 'motivo',
                name: 'motivo',
                placeholder: 'Describa el motivo principal de la consulta...',
                tamaño: 'w-full col-span-2'
            })

            .nuevaSeccion(varView.tipoConsulta.name)
            // --- Diagnosticos ---
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Diagnosticos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Diagnosticos',
                liveUpdate: true,
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Diagnostico',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                    {
                        name: 'codigo',
                        id: 'cie-10',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'CIE-10',
                        upperCase: true,
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'code' }, { text: 'Descripcion: ', value: 'description' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-1'
            })

            // --- Label: Evolución ---
            .addCampo({
                component: 'Label',
                forLabel: 'evolucion',
                text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Recomendaciones',
                tamaño: 'w-full md:col-span-2'
            })

            // --- TextArea: Evolución ---
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.analisis',
                id: 'evolucionNutricional',
                name: 'evolucionNutricional',
                placeholder: 'Describe de manera clara la evolución del paciente durante la sesión',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Label: Evolución ---
            .addCampo({
                component: 'Label',
                forLabel: 'medicamento',
                text: '<i class="fa-solid fa-pills text-blue-500 mr-1"></i>Plan de manejo',
                tamaño: 'w-full md:col-span-2'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Medicamentos (opcional)',
                buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { medicamento: '', codigo: '', dosis: '', cantidad: '', id_paciente: id_paciente, observacion: '' } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Analisis.Plan_manejo_medicamentos',
                value: [],
                campos: [
                    {
                        name: 'medicamento',
                        id: 'Medicamento',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Medicamento',
                        tamaño: 'w-full lg:col-span-2',
                        upperCase: true,
                        options: medicamentos.value,
                        opciones: [{ value: 'producto' }, { text: 'Activo', value: 'principioactivo' }, { text: 'Expediente CUM', value: 'expedientecum' }],
                        seleccionarItem: seleccionarVadecum,
                        ocultarError: true,
                        events: {
                            onInput: buscarMedicamentos
                        }
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidad',
                        typeCampo: 'Input',
                        type: 'text',
                        placeholder: 'Cantidad',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'dosis',
                        id: 'dosis',
                        typeCampo: 'Input',
                        placeholder: 'Dosis - Via de Administracion',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'observacion',
                        id: 'observacion',
                        typeCampo: 'Input',
                        placeholder: 'Registrar Observacion...',
                        tamaño: 'w-full lg:col-span-2',
                    }
                ],
                containerCampos: 'grid lg:grid-cols-2 gap-2'
            })

    } else if (varView.tipoConsulta?.plantilla === 'Trabajo Social') {
        builder
            // 📌 Sección: Datos
            .nuevaSeccion('Datos usuarios')
            .addCampo({
                component: 'Label',
                forLabel: 'nombre',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente'
            })
            // --- Nombre Paciente ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.name_paciente',
                id: 'nombre',
                name: 'nombre',
                placeholder: 'Nombre del paciente',
                tamaño: 'w-full md:col-span-2',
            })

            // --- Numero de documento ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.No_document_paciente',
                id: 'documento',
                name: 'documento',
                placeholder: 'Numero de documento',
                tamaño: 'w-full',
                label: 'Número de documento',
                disabled: true
            })

            // --- Tipo de documento ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.historia.type_doc_paciente',
                id: 'tipoDocumento',
                name: 'tipoDocumento',
                placeholder: 'Tipo de documento',
                tamaño: 'w-full',
                options: [
                    { label: 'Cedula de ciudadania', value: 'cedula' },
                    { label: 'Cedula Extranjera', value: 'extranjera' },
                    { label: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
                label: 'Tipo de documento',
                disabled: true
            })

            // --- Label Acompañante ---
            .addCampo({
                component: 'Label',
                forLabel: 'nombreAcompañante',
                size: 'text-sm',
                text: '<i class="fa-solid fa-users text-blue-700 mr-1"></i>Cuidador (Opcional)',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Nombre Acompañante ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.acompañante',
                type: 'text',
                id: 'nombreAcompañante',
                name: 'nombreAcompañante',
                placeholder: 'Nombre completo del cuidador',
                tamaño: 'w-full'
            })

            // --- Parentesco Acompañante ---
            .addCampo({
                component: 'Select',
                id: 'parentesco',
                name: 'parentesco',
                placeholder: 'Seleccione el parentesco',
                tamaño: 'w-full',
                options: [
                    { label: 'Padre', value: 'Padre' },
                    { label: 'Madre', value: 'Madre' },
                    { label: 'Hijo', value: 'Hijo' },
                    { label: 'Conyuge', value: 'Conyuge' },
                    { label: 'Hermano/a', value: 'Hermano/a' }
                ]
            })

            .nuevaSeccion(varView.tipoConsulta.name)
            // --- Diagnosticos ---
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Diagnosticos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Diagnosticos',
                liveUpdate: true,
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Diagnostico',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                    {
                        name: 'codigo',
                        id: 'cie-10',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'CIE-10',
                        upperCase: true,
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'code' }, { text: 'Descripcion: ', value: 'description' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-1'
            })

            .addCampo({
                component: 'Label',
                forLabel: 'motivo',
                size: 'text-sm',
                tamaño: 'w-full col-span-2',
                text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Consulta'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.motivo',
                id: 'motivo',
                name: 'motivo',
                placeholder: 'Describa el motivo principal de la consulta...',
                tamaño: 'w-full col-span-2'
            })

            // --- Label: Tratamiento ---
            .addCampo({
                component: 'Label',
                forLabel: 'rehabilitacion',
                text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Analisis y Tratamiento',
                tamaño: 'w-full col-span-2',
            })

            // --- Select: Tipo de Análisis ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.tipoAnalisis',
                id: 'tipoAnalisis',
                name: 'tipoAnalisis',
                placeholder: 'Tipo de Análisis',
                tamaño: 'w-full md:col-span-1 col-span-2',
                options: [
                    { label: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                    { label: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                    { label: 'Cambios críticos', value: 'Cambios criticos' }
                ]
            })

            // --- Input: Observación ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.observacion',
                type: 'text',
                id: 'observacion',
                name: 'observacion',
                placeholder: 'Observación',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 5
            })

            // --- Textarea: Análisis ---
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.analisis',
                id: 'analisis',
                name: 'analisis',
                placeholder: 'Análisis',
                tamaño: 'w-full col-span-2',
                minlength: 10
            })

            .addCampo({
                component: 'Label',
                forLabel: '',
                text: '<i class="fa-solid fa-file-medical text-purple-500 mr-1"></i>Plan de Manejo',
                tamaño: 'w-full col-span-2',
            })
            // --- Select: Condición de rehabilitación ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.tratamiento',
                id: 'rehabilitacion',
                name: 'rehabilitacion',
                placeholder: 'Condición de rehabilitación',
                tamaño: 'w-full md:col-span-2',
                options: [
                    { label: 'Total o Parcial', value: 'Total o Parcial' },
                    { label: 'Sin potencial de rehabilitación', value: 'Sin potencial de rehabilitacion' },
                    { label: 'Cuidados paliativos o de mantenimiento', value: 'Cuidados paliativos o de mantenimiento' }
                ]
            })

            // --- Botones: Medicinas, Servicios, Insumos, Equipos ---

            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Medicamentos (opcional)',
                buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { medicamento: '', codigo: '', dosis: '', cantidad: '', id_paciente: id_paciente, observacion: '' } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Analisis.Plan_manejo_medicamentos',
                value: [],
                campos: [
                    {
                        name: 'medicamento',
                        id: 'Medicamento',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Medicamento',
                        tamaño: 'w-full lg:col-span-2',
                        upperCase: true,
                        options: medicamentos,
                        opciones: [{ value: 'producto' }, { text: 'Activo', value: 'principioactivo' }, { text: 'Expediente CUM', value: 'expedientecum' }],
                        seleccionarItem: (item) => seleccionarVadecum,
                        events: {
                            onInput: buscarMedicamentos
                        },
                        ocultarError: true,
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidad',
                        typeCampo: 'Input',
                        type: 'text',
                        placeholder: 'Cantidad',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'dosis',
                        id: 'dosis',
                        typeCampo: 'Input',
                        placeholder: 'Dosis - Via de Administracion',
                        tamaño: 'w-full',
                    },
                    {
                        name: 'observacion',
                        id: 'observacion',
                        typeCampo: 'Input',
                        placeholder: 'Registrar Observacion...',
                        tamaño: 'w-full lg:col-span-2',
                    }
                ],
                containerCampos: 'grid lg:grid-cols-2 gap-2'
            })



    } else if (varView.tipoConsulta?.plantilla === 'Nota') {
        builder
            // 📌 Sección: Datos
            .nuevaSeccion('Datos usuarios')
            .addCampo({
                component: 'Label',
                forLabel: 'nombre',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente'
            })
            // --- Nombre Paciente ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.name_paciente',
                id: 'nombre',
                name: 'nombre',
                placeholder: 'Nombre del paciente',
                tamaño: 'w-full',
                disabled: true
            })

            // --- Numero de documento ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.No_document_paciente',
                id: 'documento',
                name: 'documento',
                placeholder: 'Numero de documento',
                tamaño: 'w-full',
                label: 'Número de documento',
                disabled: true
            })

            // --- Tipo de documento ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.historia.type_doc_paciente',
                id: 'tipoDocumento',
                name: 'tipoDocumento',
                placeholder: 'Tipo de documento',
                tamaño: 'w-full',
                options: [
                    { label: 'Cedula de ciudadania', value: 'cedula' },
                    { label: 'Cedula Extranjera', value: 'extranjera' },
                    { label: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
                label: 'Tipo de documento',
                disabled: true
            })

            .nuevaSeccion(varView.tipoConsulta.name)
            // --- Label: Sesión ---
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Fecha y Ubicacion',
                forLabel: 'departamento',
                tamaño: 'md:col-span-2 w-full'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.Nota.fecha_nota',
                type: 'date',
                id: 'fecha_nota',
                name: 'fecha_nota',
                placeholder: 'Fecha',
                tamaño: 'w-full',
                slot: '<input v-model="Nota.fecha_nota" type="date" class="w-5">'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.Nota.hora_nota',
                type: 'time',
                id: 'hora_nota',
                name: 'hora_nota',
                placeholder: 'Hora (00:00)',
                tamaño: 'w-full',
                slot: '<input v-model="Nota.hora_nota" type="time" class="w-7.5">'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.Nota.direccion',
                type: 'text',
                id: 'direccion',
                name: 'direccion',
                placeholder: 'Dirección',
                tamaño: 'w-full',
            })


            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Diagnosticos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Diagnosticos',
                liveUpdate: true,
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'Diagnostico',
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                    {
                        name: 'codigo',
                        id: 'cie-10',
                        typeCampo: 'SelectSearchOld',
                        placeholder: 'CIE-10',
                        upperCase: true,
                        tamaño: 'w-full md:col-span-1 col-span-2',
                        options: CIE10,
                        opciones: [{ value: 'code' }, { text: 'Descripcion: ', value: 'description' }],
                        seleccionarItem: seleccionarCIE_10,
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-1'
            })
            .addCampo({
                component: 'Label',
                icon: 'fa-solid fa-comment text-blue-500',
                text: '<i class="fa-solid fa-file text-blue-500 mr-1"></i>Diagnosticos',
                forLabel: 'departamento',
                tamaño: 'md:col-span-2 w-full'
            })
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.Nota.tipoAnalisis',
                id: 'rehabilitacion',
                name: 'rehabilitacion',
                placeholder: 'Tipo de Análisis',
                tamaño: 'w-full md:col-span-2',
                options: [
                    { label: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                    { label: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                    { label: 'Cambios críticos', value: 'Cambios criticos' }
                ]
            })
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-note-sticky text-blue-500 mr-1"></i>Notas de enfermeria',
                forLabel: 'tipo',
                tamaño: 'md:col-span-2 w-full'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Subjetivo',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'subjetivo' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Nota.subjetivo',
                value: [],
                campos: [
                    {
                        name: 'hora',
                        id: 'hora',
                        typeCampo: 'Input',
                        type: 'time',
                        placeholder: 'Hora del registro',
                        tamaño: 'w-full mt-1',
                        label: 'Hora del registro'
                    },
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'Textarea',
                        placeholder: 'Registre lo manifestado por el paciente o familiar (dolor, molestias, percepción)',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Objetivos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'objetivo' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Nota.objetivo',
                value: [],
                campos: [
                    {
                        name: 'hora',
                        id: 'hora',
                        typeCampo: 'Input',
                        type: 'time',
                        placeholder: 'Hora del registro',
                        tamaño: 'w-full',
                        label: 'Hora del registro'
                    },
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'Textarea',
                        placeholder: 'Registre el objetivo del cuidado de enfermería para el paciente',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Actividades',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'actividades' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Nota.actividades',
                value: [],
                campos: [
                    {
                        name: 'hora',
                        id: 'hora',
                        typeCampo: 'Input',
                        type: 'time',
                        placeholder: 'Hora del registro',
                        tamaño: 'w-full',
                        label: 'Hora del registro'
                    },
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'Textarea',
                        placeholder: 'Detalle las actividades de enfermería realizadas durante el turno',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Plan',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'plan' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Nota.plan',
                value: [],
                campos: [
                    {
                        name: 'hora',
                        id: 'hora',
                        typeCampo: 'Input',
                        type: 'time',
                        placeholder: 'Hora del registro',
                        tamaño: 'w-full',
                        label: 'Hora del registro'
                    },
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'Textarea',
                        placeholder: 'Indique el plan de cuidado a seguir según la valoración del paciente',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Intervencion',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'intervencion' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Nota.intervencion',
                value: [],
                campos: [
                    {
                        name: 'hora',
                        id: 'hora',
                        typeCampo: 'Input',
                        type: 'time',
                        placeholder: 'Hora del registro',
                        tamaño: 'w-full',
                        label: 'Hora del registro'
                    },
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'Textarea',
                        placeholder: 'Describa la intervención realizada (procedimiento, cuidado o acción aplicada)',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Evaluacion',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'evaluacion' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Nota.evaluacion',
                value: [],
                campos: [
                    {
                        name: 'hora',
                        id: 'hora',
                        typeCampo: 'Input',
                        type: 'time',
                        placeholder: 'Hora del registro',
                        tamaño: 'w-full',
                        label: 'Hora del registro'
                    },
                    {
                        name: 'descripcion',
                        id: 'descripcion',
                        typeCampo: 'Textarea',
                        placeholder: 'Registre la valoración del paciente (signos, síntomas, estado general)',
                        tamaño: 'w-full',
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
    } else if (varView.tipoConsulta?.plantilla === 'Medicina') {
        builder
            // 📌 Sección: Datos
            .nuevaSeccion('Datos usuarios')
            .addCampo({
                component: 'Label',
                forLabel: 'nombre',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente'
            })
            // --- Nombre Paciente ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.name_paciente',
                id: 'nombre',
                name: 'nombre',
                placeholder: 'Nombre del paciente',
                tamaño: 'w-full md:col-span-2',
                disabled: true
            })

            // --- Numero de documento ---
            .addCampo({
                component: 'SelectSearch',
                vmodel: 'Analisis.historia.No_document_paciente',
                id: 'documento',
                name: 'documento',
                placeholder: 'Numero de documento',
                tamaño: 'w-full',
                label: 'Número de documento',
                disabled: true
            })

            // --- Tipo de documento ---
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.historia.type_doc_paciente',
                id: 'tipoDocumento',
                name: 'tipoDocumento',
                placeholder: 'Tipo de documento',
                tamaño: 'w-full',
                options: [
                    { label: 'Cedula de ciudadania', value: 'cedula' },
                    { label: 'Cedula Extranjera', value: 'extranjera' },
                    { label: 'Tarjeta de Identidad', value: 'Tarjeta de identidad' }
                ],
                label: 'Tipo de documento',
                disabled: true
            })

            // --- Label Acompañante ---
            .addCampo({
                component: 'Label',
                forLabel: 'nombreAcompañante',
                size: 'text-sm',
                text: '<i class="fa-solid fa-users text-blue-700 mr-1"></i>Acompañante (Opcional)',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Nombre Acompañante ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.acompañante',
                type: 'text',
                id: 'nombreAcompañante',
                name: 'nombreAcompañante',
                placeholder: 'Nombre completo del acompañante',
                tamaño: 'w-full'
            })

            // --- Parentesco Acompañante ---
            .addCampo({
                component: 'Select',
                id: 'parentesco',
                name: 'parentesco',
                placeholder: 'Seleccione el parentesco',
                tamaño: 'w-full',
                options: [
                    { label: 'Padre', value: 'Padre' },
                    { label: 'Madre', value: 'Madre' },
                    { label: 'Hijo', value: 'Hijo' },
                    { label: 'Conyuge', value: 'Conyuge' },
                    { label: 'Hermano/a', value: 'Hermano/a' }
                ]
            })
            .nuevaSeccion('Consulta')
            .addCampo({
                component: 'Label',
                forLabel: 'motivo',
                size: 'text-sm',
                tamaño: 'w-full col-span-2',
                text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Consulta',
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.motivo',
                id: 'motivo',
                name: 'motivo',
                placeholder: 'Describa el motivo principal de la consulta...',
                tamaño: 'w-full col-span-2',
                minlength: 10,
            })
            .addCampo({
                component: 'Label',
                forLabel: 'enfermedad',
                size: 'text-sm',
                tamaño: 'w-full col-span-2',
                text: '<i class="fa-solid fa-clock text-red-300 mr-1"></i>Enfermedad Actual'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.Enfermedad.valor',
                id: 'enfermedad',
                name: 'enfermedad',
                placeholder: 'Describa la evolucion de la enfermedad actual, sintomas, duracion, factores, desencadenantes...',
                tamaño: 'w-full col-span-2',
                minlength: 10,
            })
            .addCampo({
                component: 'GroupCampos',
                type: 'Input',
                labelGroup: 'Antecedentes',
                buttons: [
                    { icon: 'fa-solid fa-plus', color: 'bg-blue-500', label: 'Personal', addItem: { descripcion: '', tipo: 'Personal' } },
                    { icon: 'fa-solid fa-plus', color: 'bg-blue-700', label: 'Familiar', addItem: { descripcion: '', tipo: 'Familiar' } },
                ],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.Antecedentes',
                value: [],
                campos: [
                    { name: 'descripcion', id: 'antecedente', typeCampo: 'Input', placeholder: 'Antecedente', tamaño: 'w-full' },
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
                        tamaño: 'w-full'
                    },
                ],
                containerCampos: 'grid md:grid-cols-2 grid-cols-1 gap-2'
            })
        if (!puedePostAnalisis.value) {
            builder
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.observacion',
                    type: 'text',
                    id: 'observacion',
                    name: 'observacion',
                    placeholder: 'Observación',
                    tamaño: 'w-full col-span-2',
                    minlength: 5
                })
        }

        builder
            .nuevaSeccion('Examen Fisico')
            .addCampo({
                component: 'Label',
                forLabel: 'ta',
                text: '<i class="fa-solid fa-heart-pulse text-blue-500 mr-1"></i>Signos Vitales',
                tamaño: 'w-full md:col-span-2'
            })

            // --- Input: TA ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.ta',
                type: 'text',
                id: 'ta',
                name: 'ta',
                placeholder: 'TA (90-140/60-90 mmHg)',
                tamaño: 'w-full',
                slot: {
                    tooltip: `<div id="error-ta" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                },
            })

            // --- Input: FC ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.fc',
                type: 'number',
                id: 'fc',
                name: 'fc',
                placeholder: 'FC (60-100 lpm)',
                max: 100,
                tamaño: 'w-full',
                slot: {
                    tooltip: `<div id="error-fc" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })

            // --- Input: FR ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.fr',
                type: 'number',
                id: 'fr',
                name: 'fr',
                placeholder: 'FR (12-20 rpm)',
                max: 250,
                tamaño: 'w-full',
                slot: {
                    tooltip: `<div id="error-fr" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })

            // --- Input: Temperatura (Tº) ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.t',
                type: 'number',
                id: 't',
                name: 't',
                placeholder: 'Tº (36.1-37.2°C)',
                max: 50,
                tamaño: 'w-full',
                slot: {
                    tooltip: `<div id="error-t" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })
            // --- Input: Saturación O2 ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.signosVitales.SATo2',
                type: 'number',
                id: 'sat',
                name: 'sat',
                placeholder: 'Sat O2 (90% - 100%)',
                max: 100,
                tamaño: 'w-full col-span-1',
                slot: {
                    tooltip: `<div id="error-sat" class="text-red-300 text-xs mt-1"></div>`
                },
                events: {
                    onChange: validarCampo
                }
            })

            // --- Input: Otros ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.otros',
                type: 'text',
                id: 'otros',
                name: 'otros',
                placeholder: 'Otros (opcional)',
                tamaño: 'w-full col-span-1'
            })

            // --- Label: Medidas Antropométricas ---
            .addCampo({
                component: 'Label',
                forLabel: 'altura',
                text: '<i class="fa-solid fa-weight-hanging text-blue-600 mr-1"></i>Medidas Antropométricas',
                tamaño: 'w-full md:col-span-2'
            })
            // --- Input: Peso ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.peso',
                type: 'number',
                id: 'peso',
                name: 'peso',
                placeholder: 'Peso (KG)',
                tamaño: 'w-full col-span-1'
            })

            // --- Input: Altura ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.ExamenFisico.altura',
                type: 'number',
                id: 'altura',
                name: 'altura',
                placeholder: 'Altura (CM)',
                tamaño: 'w-full col-span-1'
            })

        if (puedePostAnalisis.value) {
            builder
                .nuevaSeccion('Analisis')
                // 📌 Sección: Diagnósticos

                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Diagnosticos',
                    buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', codigo: '', id_paciente: id_paciente } }],
                    tamaño: 'w-full col-span-2',
                    vmodel: 'Analisis.Diagnosticos',
                    liveUpdate: true,
                    value: [],
                    campos: [
                        {
                            name: 'descripcion',
                            id: 'descripcion',
                            typeCampo: 'SelectSearchOld',
                            placeholder: 'Diagnostico',
                            tamaño: 'w-full md:col-span-1 col-span-2',
                            options: CIE10,
                            opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                            seleccionarItem: seleccionarCIE_10,
                        },
                        {
                            name: 'codigo',
                            id: 'cie-10',
                            typeCampo: 'SelectSearchOld',
                            placeholder: 'CIE-10',
                            upperCase: true,
                            tamaño: 'w-full md:col-span-1 col-span-2',
                            options: CIE10,
                            opciones: [{ value: 'code' }, { text: 'Descripcion:', value: 'description' }],
                            seleccionarItem: seleccionarCIE_10,
                        },
                    ],
                    containerCampos: 'grid grid-cols-2 gap-1'
                })

                // --- Select: Tipo de Análisis ---
                .addCampo({
                    component: 'Select',
                    vmodel: 'Analisis.tipoAnalisis',
                    id: 'tipoAnalisis',
                    name: 'tipoAnalisis',
                    placeholder: 'Tipo de Análisis',
                    tamaño: 'w-full md:col-span-1 col-span-2',
                    options: [
                        { label: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                        { label: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                        { label: 'Cambios críticos', value: 'Cambios criticos' }
                    ]
                })

                // --- Input: Observación ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.observacion',
                    type: 'text',
                    id: 'observacion',
                    name: 'observacion',
                    placeholder: 'Observación',
                    tamaño: 'w-full md:col-span-1 col-span-2',
                    minlength: 5
                })

                // --- Label: Tratamiento ---
                .addCampo({
                    component: 'Label',
                    forLabel: 'rehabilitacion',
                    text: '<i class="fa-solid fa-notes-medical text-blue-500 mr-1"></i>Tratamiento',
                    tamaño: 'w-full col-span-2',
                })

                // --- Textarea: Análisis ---
                .addCampo({
                    component: 'Textarea',
                    vmodel: 'Analisis.analisis',
                    id: 'analisis',
                    name: 'analisis',
                    placeholder: 'Análisis',
                    tamaño: 'w-full col-span-2',
                    minlength: 10
                })

                .addCampo({
                    component: 'Label',
                    forLabel: '',
                    text: '<i class="fa-solid fa-file-medical text-purple-500 mr-1"></i>Plan de Manejo',
                    tamaño: 'w-full col-span-2',
                })
                // --- Select: Condición de rehabilitación ---
                .addCampo({
                    component: 'Select',
                    vmodel: 'Analisis.tratamiento',
                    id: 'rehabilitacion',
                    name: 'rehabilitacion',
                    placeholder: 'Condición de rehabilitación',
                    tamaño: 'w-full md:col-span-2',
                    options: [
                        { label: 'Total o Parcial', value: 'Total o Parcial' },
                        { label: 'Sin potencial de rehabilitación', value: 'Sin potencial de rehabilitacion' },
                        { label: 'Cuidados paliativos o de mantenimiento', value: 'Cuidados paliativos o de mantenimiento' }
                    ]
                })
                // --- Botones: Medicinas, Servicios, Insumos, Equipos ---
                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Procedimientos (opcional)',
                    buttons: [{ icon: 'fa-solid fa-kit-medical', label: 'Agregar', color: 'bg-green-500', addItem: { procedimiento: '', codigo: '', dias_asignados: '', id_paciente: id_paciente, observacion: '' } },],
                    tamaño: 'w-full md:col-span-2 mb-5',
                    vmodel: 'Analisis.Plan_manejo_procedimientos',
                    liveUpdate: true,
                    value: [],
                    campos: [
                        {
                            name: 'procedimiento',
                            id: 'descripcionProcedimiento',
                            typeCampo: 'SelectSearchOld',
                            placeholder: 'Procedimiento',
                            tamaño: 'w-full',
                            upperCase: true,
                            options: CUPS,
                            opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                            seleccionarItem: (item) => {
                                historiaStore.Formulario.Analisis.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                                historiaStore.Formulario.Analisis.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                            },
                        },
                        {
                            name: 'dias_asignados',
                            id: 'dias_asignados',
                            typeCampo: 'Input',
                            placeholder: 'Numero de Veces',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'observacion',
                            id: 'observacion',
                            typeCampo: 'Input',
                            placeholder: 'Registrar Observacion...',
                            tamaño: 'w-full col-span-2',
                        }

                    ],
                    containerCampos: 'grid md:grid-cols-2 grid-cols-1 gap-2'
                })

                .addCampo({
                    component: 'GroupCampos',
                    labelGroup: 'Medicamentos (opcional)',
                    buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { medicamento: '', codigo: '', dosis: '', cantidad: '', id_paciente: id_paciente, observacion: '' } },],
                    tamaño: 'w-full md:col-span-2',
                    vmodel: 'Analisis.Plan_manejo_medicamentos',
                    value: [],
                    liveUpdate: true,
                    campos: [
                        {
                            name: 'medicamento',
                            id: 'Medicamento',
                            typeCampo: 'SelectSearchOld',
                            placeholder: 'Producto',
                            tamaño: 'w-full lg:col-span-2',
                            upperCase: true,
                            options: medicamentos,
                            opciones: [{ value: 'producto' }, { text: 'Activo', value: 'principioactivo' }, { text: 'Expediente CUM', value: 'expedientecum' }],
                            seleccionarItem: seleccionarVadecum,
                            events: {
                                onInput: buscarMedicamentos
                            },
                            ocultarError: true,
                        },
                        {
                            name: 'dosis',
                            id: 'dosis',
                            typeCampo: 'Input',
                            placeholder: 'Dosis - Via de Administracion',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'cantidad',
                            id: 'cantidad',
                            typeCampo: 'Input',
                            type: 'text',
                            placeholder: 'Cantidad',
                            tamaño: 'w-full',
                        },
                        {
                            name: 'observacion',
                            id: 'observacion',
                            typeCampo: 'Input',
                            placeholder: 'Registrar Observacion...',
                            tamaño: 'w-full lg:col-span-2',
                        }
                    ],
                    containerCampos: 'grid lg:grid-cols-2 gap-2'
                })

        }
    }

    return builder.build()
}