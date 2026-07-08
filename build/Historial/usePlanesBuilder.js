// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { CUPS } from '~/data/CUPS'
import { usePacientesStore } from '~/stores/Entidades/Paciente';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia'
import { useInsumosStore } from '~/stores/Formularios/insumos/Insumos';

export function usePlanesBuilder({
    storeId,
    storePinia,
    cerrarModal,
    formularioItem,
    show,
    medicamentos,
    insumos,
    profesionales,
    pacientes,
    showPacientes
}) {

    const builder = new FormularioBuilder()
    const varView = useVarView()
    const historiaStore = useHistoriasStore()

    function seleccionarInventario(item) {
        console.log(item)
    }

    function seleccionarPaciente(event){
        const id = event
        const pacienteStore = usePacientesStore()
        pacienteStore.PacienteSeleccionado = id
        console.log(pacienteStore.PacienteSeleccionado)
    }
    
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormulariotamaño('XS')
        .setFormularioShow(show)
        .setFormularioTipo('solo')
        .setBotones([
            { text: 'Agregar', color: 'primary', type: 'enviar' },
            { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cerrar' },
        ])
    // 📌 Sección: Datos
    if (formularioItem === 'Medicamento') {
        builder
            // 📌 Sección: Diagnósticos
            .nuevaSeccion('Asignar productos')
        builder
            .addCampo({
                component: 'Label',
                forLabel: 'medicamento',
                text: '<i class="fa-solid fa-prescription-bottle-medical text-blue-500 mr-1"></i>Item de Inventario',
                tamaño: 'col-span-2 w-full'
            })
            if(showPacientes){
                builder
                .addCampo({
                    component: 'SelectSearch',
                    name: 'paciente',
                    id: 'paciente',
                    label: 'Selecciona el paciente al que se le asigna',
                    placeholder: 'paciente',
                    tamaño: 'w-full md:col-span-2',
                    options: pacientes,
                    vmodel: 'id_paciente',
                    events: {
                        onChange: seleccionarPaciente
                    },
                }) 
            }
            if(varView.getRol == 'Admin'){
                builder
                .addCampo({
                    component: 'SelectSearch',
                    name: 'profesional',
                    id: 'profesional',
                    label: 'Selecciona el profesional que autoriza',
                    placeholder: 'Profesional',
                    tamaño: 'w-full md:col-span-2',
                    options: profesionales,
                    vmodel: 'id_profesional',
                })
            }
            builder
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Insumos (opcional)',
                buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { id_insumo: '', dosis: '', cantidad: '', observacion: '', fecha_desde: '', fecha_hasta: '' } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Plan_manejo_medicamentos',
                value: [],
                campos: [
                    {
                        name: 'id_insumo',
                        id: 'Medicamento',
                        typeCampo: 'SelectSearch',
                        placeholder: 'Insumo',
                        tamaño: 'w-full md:col-span-2',
                        upperCase: true,
                        options: medicamentos,
                        events: {
                            onChange: seleccionarInventario
                        },
                        label: 'Producto'
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidad',
                        typeCampo: 'Input',
                        type: 'number',
                        placeholder: 'Cantidad',
                        tamaño: 'w-full',
                        label: 'Cantidad'
                    },
                    {
                        name: 'observacion',
                        id: 'observacion',
                        typeCampo: 'Input',
                        placeholder: 'Registrar Observacion / Autorizacion',
                        tamaño: 'w-ful md:col-span-2l',
                        label: 'Observacion'
                    },
                ],
                containerCampos: 'grid grid-cols-2 gap-2'
            })
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Insumos o Equipos Medicos Prestables (opcional)',
                buttons: [{ icon: 'fa-solid fa-capsules', label: 'Agregar', color: 'bg-blue-500', addItem: { id_insumo: '', cantidad: '', observacion: '', fecha_desde: '', fecha_hasta: '' } },],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Plan_manejo_insumos',
                value: [],
                campos: [
                    {
                        name: 'id_insumo',
                        id: 'Medicamento',
                        typeCampo: 'SelectSearch',
                        placeholder: 'Insumo',
                        tamaño: 'w-full col-span-2',
                        upperCase: true,
                        options: insumos,
                        events: {
                            onChange: seleccionarInventario
                        },
                        label: 'Producto'
                    },
                    {
                        name: 'cantidad',
                        id: 'cantidad',
                        typeCampo: 'Input',
                        type: 'number',
                        placeholder: 'Cantidad',
                        tamaño: 'w-full',
                        label: 'Cantidad'
                    },
                    {
                        name: 'observacion',
                        id: 'observacion',
                        typeCampo: 'Input',
                        placeholder: 'Registrar Observacion / Autorizacion',
                        tamaño: 'w-full',
                        label: 'Observacion'
                    },
                    {
                        name: 'fecha_desde',
                        id: 'fecha_desde',
                        typeCampo: 'Input',
                        type: 'date',
                        label: 'Fecha desde',
                        tamaño: 'w-full',
                        label: 'Fecha desde'
                    },
                    {
                        name: 'fecha_hasta',
                        id: 'fecha_hasta',
                        typeCampo: 'Input',
                        type: 'date',
                        label: 'Fecha hasta',
                        tamaño: 'w-full',
                        label: 'Fecha Hasta'
                    }
                ],
                containerCampos: 'grid grid-cols-2 gap-2'
            })
    }
    else if (formularioItem === 'Tratamientos') {
        builder
            .nuevaSeccion('Tratamientos')

            .addCampo({
                component: 'Label',
                forLabel: 'rehabilitacion',
                text: '<i class="fa-solid fa-kit-medical text-blue-500 mr-1"></i>Tratamiento',
                tamaño: 'col-span-2 w-full'
            })
            .addCampo({
                component: 'SelectSearch',
                name: 'procedimiento',
                id: 'descripcionProcedimiento',
                placeholder: 'Procedimiento',
                tamaño: 'w-full md:col-span-2',
                UpperCase: true,
                options: CUPS,
                opciones: [{ value: 'DESCRIPCION' }, { text: 'Codigo', value: 'CODIGO' }],
                vmodel: 'Plan_manejo_procedimientos.procedimiento',
                seleccionarItem: (item) => {
                    historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).procedimiento = item.DESCRIPCION
                    historiaStore.Formulario.Plan_manejo_procedimientos.at(-1).codigo = item.CODIGO
                },
            })
            .addCampo({
                component: 'Input',
                label: 'Codigo',
                vmodel: 'Plan_manejo_procedimientos.codigo',
                type: 'text',
                id: 'presetacion',
                name: 'presetacion',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 5
            })
            .addCampo({
                component: 'Input',
                label: 'Dias asignados',
                vmodel: 'Plan_manejo_procedimientos.dias_asignados',
                id: 'rehabilitacion',
                name: 'rehabilitacion',
                placeholder: '0',
                tamaño: 'w-full md:col-span-1 col-span-2',
            })
    }
    else {
        builder
            .nuevaSeccion('No se encontro el Item')
    }

    return builder.build()
}