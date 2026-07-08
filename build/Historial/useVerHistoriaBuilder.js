// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { CUPS } from '~/data/CUPS'
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'

export function useVerHistoriaBuilder({
    storeId,
    storePinia,
    cerrarModal,
    formularioItem,
    actualizar,
    show,
}) {
    const builder = new FormularioBuilder()
    const historiaStore = useHistoriasStore()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('XS')
        .setFormularioShow(show)
        .setSoloVer(!actualizar.value)
        .setEditarFormulario(actualizar.value)
        .setFormularioTipo('solo')
    if (actualizar.value) {
        builder
            .setBotones([
                { text: 'Actualizar', color: 'primary', type: 'enviar' },
                { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cancelar' },
            ])
    } else {
        builder
            .setBotones([
                { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cancelar' },
            ])
    }
    // 📌 Sección: Datos
    if (formularioItem.value === 'Medicamento') {
        builder
            // 📌 Sección: Diagnósticos
            .nuevaSeccion('Medicamento')

        if (!actualizar.value) {
            builder
                // --- Select: Tipo de Análisis ---
                .addCampo({
                    component: 'Select',
                    vmodel: 'Analisis.tipoAnalisis',
                    id: 'rehabilitacion',
                    name: 'rehabilitacion',
                    placeholder: 'Tipo de Análisis',
                    tamaño: 'w-full md:col-span-1 col-span-2',
                    options: [
                        { label: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                        { label: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                        { label: 'Cambios críticos', value: 'Cambios criticos' },
                        { label: 'Estado inhabilitado', value: '' }
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
        }

        builder
            .addCampo({
                component: 'Label',
                forLabel: 'Medicamento',
                text: '<i class="fa-solid fa-prescription-bottle-medical text-blue-500 mr-1"></i>Medicamento',
                tamaño: 'col-span-2 w-full'
            })

            .addCampo({
                component: 'Input',
                label: 'Medicamento',
                vmodel: 'Analisis.Plan_manejo_medicamentos.medicamento',
                type: 'text',
                id: 'nombre',
                name: 'nombre',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Dosis',
                vmodel: 'Analisis.Plan_manejo_medicamentos.dosis',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 2
            })
            .addCampo({
                component: 'Input',
                label: 'Cantidad de dias',
                vmodel: 'Analisis.Plan_manejo_medicamentos.cantidad',
                type: 'text',
                id: 'cantidad',
                name: 'cantidad',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 1
            })
    }
    else if (formularioItem.value === 'Tratamientos') {
        builder
            .nuevaSeccion('Tratamientos')

            .addCampo({
                component: 'Label',
                forLabel: 'rehabilitacion',
                text: '<i class="fa-solid fa-kit-medical text-blue-500 mr-1"></i>Tratamiento',
                tamaño: 'col-span-2 w-full'
            })
            .addCampo({
                component: 'SelectSearchOld',
                name: 'procedimiento',
                id: 'descripcionProcedimiento',
                placeholder: 'Procedimiento',
                tamaño: 'w-full md:col-span-2',
                UpperCase: true,
                options: CUPS,
                opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                vmodel: 'Analisis.Plan_manejo_procedimientos.procedimiento',
                seleccionarItem: (item) => {
                    historiaStore.Formulario.Analisis.Plan_manejo_procedimientos.procedimiento = item.DESCRIPCION
                    historiaStore.Formulario.Analisis.Plan_manejo_procedimientos.codigo = item.CODIGO
                },
            })
            .addCampo({
                component: 'Input',
                label: 'Codigo',
                vmodel: 'Analisis.Plan_manejo_procedimientos.codigo',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Dias asignados',
                vmodel: 'Analisis.Plan_manejo_procedimientos.dias_asignados',
                id: 'rehabilitacion',
                name: 'rehabilitacion',
                placeholder: '0',
                tamaño: 'w-full md:col-span-1 col-span-2',
            })
    }
    else if (formularioItem.value === 'Consulta') {
        builder
            .nuevaSeccion('Consulta')

        builder
            .addCampo({
                component: 'Label',
                forLabel: 'motivo',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Consulta'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.motivo',
                id: 'motivo',
                name: 'motivo',
                placeholder: 'Describa el motivo principal de la consulta...',
                tamaño: 'w-full md:col-span-2'
            })
            .addCampo({
                component: 'Label',
                forLabel: 'observacion',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-clock text-red-300 mr-1"></i>Observacion'
            })
            .addCampo({
                component: 'Input',
                label: 'Observacion',
                vmodel: 'Analisis.observacion',
                id: 'observacion',
                name: 'observacion',
                tamaño: 'w-full'
            })
            .addCampo({
                component: 'Select',
                label: 'Tipo analisis',
                vmodel: 'Analisis.tipoAnalisis',
                id: 'tipoAnalisis',
                name: 'tipoAnalisis',
                tamaño: 'w-full',
                options: [
                    { label: 'Estado clínico sin cambios', value: 'Estado clinico sin cambios' },
                    { label: 'Recomendaciones Adicionales', value: 'Recomendaciones Adicionales' },
                    { label: 'Cambios críticos', value: 'Cambios criticos' },
                ]
            })
            .addCampo({
                component: 'Input',
                label: 'Analisis/Tratamiento',
                vmodel: 'Analisis.analisis',
                id: 'observacion',
                name: 'observacion',
                tamaño: 'w-full md:col-span-2'
            })
            .addCampo({
                component: 'Select',
                label: 'Tratamiento',
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

        if (!actualizar.value) {
            builder
                .addCampo({
                    component: 'Label',
                    forLabel: 'motivo',
                    text: '<i class="fa-solid fa-heart-pulse text-blue-500 mr-1"></i>Signos Vitales',
                    tamaño: 'w-full col-span-2'
                })

                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.signosVitales.ta',
                    type: 'text',
                    id: 'ta',
                    name: 'ta',
                    placeholder: 'TA',
                    tamaño: 'w-full',
                    slot: {
                        tooltip: `<div id="error-ta" class="text-red-300 text-xs mt-1"></div>`
                    },
                })

                // --- Input: FC ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.signosVitales.fc',
                    type: 'number',
                    id: 'fc',
                    name: 'fc',
                    placeholder: 'FC',
                    max: 100,
                    tamaño: 'w-full',
                })

                // --- Input: FR ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.signosVitales.fr',
                    type: 'number',
                    id: 'fr',
                    name: 'fr',
                    placeholder: 'FR',
                    max: 250,
                    tamaño: 'w-full',
                })

                // --- Input: Temperatura (Tº) ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.signosVitales.t',
                    type: 'number',
                    id: 't',
                    name: 't',
                    placeholder: 'Tº',
                    max: 50,
                    tamaño: 'w-full',
                })

                // --- Input: Saturación O2 ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.signosVitales.SATo2',
                    type: 'number',
                    id: 'sat',
                    name: 'sat',
                    placeholder: 'Sat O2',
                    max: 100,
                    tamaño: 'w-full col-span-1',
                })

                // --- Label: Medidas Antropométricas ---
                .addCampo({
                    component: 'Label',
                    forLabel: 'peso',
                    text: '<i class="fa-solid fa-weight-hanging text-blue-600 mr-1"></i>Medidas Antropométricas',
                    tamaño: 'w-full col-span-2'
                })

                // --- Input: Otros ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.otros',
                    type: 'text',
                    id: 'otros',
                    name: 'otros',
                    placeholder: 'Otros (opcional)',
                    tamaño: 'w-full col-span-1'
                })

                // --- Input: Peso ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.peso',
                    type: 'number',
                    id: 'peso',
                    name: 'peso',
                    placeholder: 'Peso (KG)',
                    tamaño: 'w-full col-span-1'
                })

                // --- Input: Altura ---
                .addCampo({
                    component: 'Input',
                    vmodel: 'Analisis.examen_fisico.altura',
                    type: 'number',
                    id: 'altura',
                    name: 'altura',
                    placeholder: 'Altura (CM)',
                    tamaño: 'w-full col-span-1'
                })
        }

    }
    else if (formularioItem.value === 'Evolucion') {
        builder
            .nuevaSeccion('Evolucion')
            .addCampo({
                component: 'Label',
                forLabel: 'motivo',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Consulta'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.motivo',
                id: 'motivo',
                name: 'motivo',
                placeholder: 'Describa el motivo principal de la consulta...',
                tamaño: 'w-full md:col-span-2'
            })
            .addCampo({
                component: 'Label',
                forLabel: 'observacion',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-clock text-red-300 mr-1"></i>Recomendaciones'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.analisis',
                id: 'observacion',
                name: 'observacion',
                tamaño: 'w-full md:col-span-2'
            })
    }
    else if (formularioItem.value === 'Terapia') {
        builder
            .nuevaSeccion('Terapia')
            // --- Label: Sesión ---
            .addCampo({
                component: 'Label',
                forLabel: 'sesion',
                text: '<i class="fa-solid fa-list-ol text-blue-500 mr-1"></i>Número de sesión',
                tamaño: 'w-full'
            })

            // --- Input: Sesión ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.terapia.sesion',
                type: 'number',
                id: 'sesion',
                name: 'sesion',
                placeholder: 'Ej: 1, 2, 3...',
                tamaño: 'w-full',
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
                vmodel: 'Analisis.terapia.hora',
                type: 'time',
                id: 'horaTerapia',
                name: 'horaTerapia',
                placeholder: 'Selecciona la hora',
                tamaño: 'w-full',
            })

            // --- Input: Fecha ---
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.terapia.fecha',
                type: 'date',
                id: 'fechaTerapia',
                name: 'fechaTerapia',
                placeholder: 'Selecciona la fecha',
                tamaño: 'w-full',
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
                vmodel: 'Analisis.terapia.objetivos',
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
                vmodel: 'Analisis.terapia.evolucion',
                id: 'evolucion',
                name: 'evolucion',
                placeholder: 'Describe de manera clara la evolución del paciente durante la sesión',
                tamaño: 'w-full col-span-2'
            })
    }
    else if (formularioItem.value === 'TrabajoSocial') {
        builder
            .nuevaSeccion('Trabajo Social')
            .addCampo({
                component: 'Label',
                forLabel: 'motivo',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Consulta'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.motivo',
                id: 'motivo',
                name: 'motivo',
                placeholder: 'Describa el motivo principal de la consulta...',
                tamaño: 'w-full md:col-span-2'
            })
            .addCampo({
                component: 'Label',
                forLabel: 'Analisis',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-clock text-red-300 mr-1"></i>Recomendaciones'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Analisis.analisis',
                id: 'observacion',
                name: 'observacion',
                tamaño: 'w-full md:col-span-2'
            })
    }
    else if (formularioItem.value === 'Nota') {
        builder
            .nuevaSeccion('Nota')
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Fecha y Ubicacion',
                forLabel: 'departamento',
                tamaño: 'md:col-span-2 w-full'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.nota.fecha_nota',
                type: 'date',
                id: 'fecha_nota',
                name: 'fecha_nota',
                placeholder: 'Fecha',
                tamaño: 'w-full',
                slot: '<input v-model="Nota.fecha_nota" type="date" class="w-5">'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.nota.hora_nota',
                type: 'time',
                id: 'hora_nota',
                name: 'hora_nota',
                placeholder: 'Hora (00:00)',
                tamaño: 'w-full',
                slot: '<input v-model="Analisis.nota.hora_nota" type="time" class="w-5">'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Analisis.nota.direccion',
                type: 'text',
                id: 'direccion',
                name: 'direccion',
                placeholder: 'Dirección',
                tamaño: 'w-full',
                disabled: 'props.verNota'
            })

            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-file text-blue-500 mr-1"></i>Diagnosticos',
                forLabel: 'tipo',
                tamaño: 'md:col-span-2 w-full'
            })
            .addCampo({
                component: 'Select',
                vmodel: 'Analisis.nota.tipoAnalisis',
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
                component: 'Label',
                icon: 'fa-solid fa-comment text-blue-500',
                text: 'Nota',
                forLabel: 'departamento',
                tamaño: 'md:col-span-2 w-full'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Subjetivo',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'subjetivo' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.nota.subjetivo',
                ocultarEliminar: true,
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
                        label: 'Descripcion'
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Objetivos',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'objetivo' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.nota.objetivo',
                ocultarEliminar: true,
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
                        label: 'Descripcion'
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Actividades',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'actividades' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.nota.actividades',
                ocultarEliminar: true,
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
                        label: 'Descripcion'
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Plan',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'plan' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.nota.plan',
                ocultarEliminar: true,
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
                        label: 'Descripcion'
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Intervencion',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'intervencion' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.nota.intervencion',
                ocultarEliminar: true,
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
                        label: 'Descripcion'
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Evaluacion',
                buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { hora: '', descripcion: '', tipo: 'evaluacion' } }],
                tamaño: 'w-full col-span-2',
                vmodel: 'Analisis.nota.evaluacion',
                ocultarEliminar: true,
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
                        label: 'Descripcion'
                    },
                ],
                containerCampos: 'flex flex-col gap-1'
            })
    }
    else if (formularioItem.value === 'Historial_cambios_sonda') {
        builder
            .nuevaSeccion('Historial cambios sonda')
            .addCampo({
                component: 'Label',
                forLabel: 'fecha_cambio',
                size: 'text-sm',
                tamaño: 'w-full md:col-span-2',
                text: '<i class="fa-solid fa-comment text-blue-500 mr-1"></i>Registro'
            })
            .addCampo({
                component: 'Input',
                vmodel: 'Historial_cambios_sonda.fecha_cambio',
                id: 'fecha_cambio',
                name: 'fecha_cambio',
                placeholder: 'Describa la fecha de cambio...',
                tamaño: 'w-full md:col-span-2'
            })
            .addCampo({
                component: 'Textarea',
                vmodel: 'Historial_cambios_sonda.observacion',
                id: 'observacion',
                name: 'observacion',
                tamaño: 'w-full md:col-span-2'
            })
    }
    else {
        builder
            .nuevaSeccion('No se encontro el Item')
    }


    return builder.build()
}