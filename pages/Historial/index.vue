<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import ExportarPDFs from '~/components/paginas/ExportarPDFs.vue';
import ChartComponent from '~/components/molecules/Charts/ChartComponent.vue';
import TablaNuxt from '~/components/organism/Table/TablaNuxt.vue';
import Form from '~/components/organism/Forms/Form.vue';
import { ref, onMounted, computed } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useVarView } from "~/stores/varview.js";
import { usePacientesStore } from "~/stores/Entidades/Paciente";
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { useNotasStore } from '~/stores/Formularios/historias/Notas';
import { historialManejoModales } from '~/composables/Historias/historialManejoModales';
import { usePDFExporter } from '~/composables/Historias/exportarServicioPDF';
import { formatDate } from '~/composables/Formulario/FormatearFecha';
import { useConsultasTable } from '~/composables/Entidades/useConsultasTable';
import { useDiagnosticosTable } from '~/composables/Entidades/useDiagnosticosTable';
import { useEvolucionesTable } from '~/composables/Entidades/useEvolucionesTable';
import { useNotasTable } from '~/composables/Entidades/useNotasTable';
import { useTratamientosTable } from '~/composables/Entidades/useTratamientosTable';
import { useMedicacionTable } from '~/composables/Entidades/useMedicacionTable';
import { useNutricionTable } from '~/composables/Entidades/useNutricionTable';
import { useTrabajoSocialTable } from '~/composables/Entidades/useTrabajoSocialTable';
import { useKardexTable } from '~/composables/Entidades/useKardexTable';
import { storeToRefs } from 'pinia';
import { useCitaActions } from '~/composables/Entidades/Cita';
import { useVerHistoriaBuilder } from '~/build/Historial/useVerHistoriaBuilder';
import { useInsumoStore } from '~/stores/Entidades/Insumo';
import { useInsumoActions } from '~/composables/Entidades/Insumo';
import { useMovimientoBuilder } from '~/build/Historial/useMovimientoBuilder';
import { traerAnalisisPaginado, traerFiltrosHistoria } from '~/Core/Historial/Historia/GetHistoria';
import TablaScroll from '~/components/organism/Table/TablaScroll.vue';
import { useAutoRefresh } from '~/composables/useAutoRefresh';

// ============ STORES Y COMPOSABLES ============
const varView = useVarView();
const notificaciones = useNotificacionesStore()
const historiasStore = useHistoriasStore();
const notasStore = useNotasStore();
const apiRest = useApiRest();
const medicosStore = useProfesionalStore();
const pacientesStore = usePacientesStore();
const insumoStore = useInsumoStore()
const store = useIndexedDBStore();
const formularioItem = ref('')
const actualizar = ref(false)
const filtros = ref({})
const { exportar } = usePDFExporter();

const { NoEnviados, showActualizarRegistro } = storeToRefs(historiasStore)
const { showModificarMovimiento } = storeToRefs(insumoStore)

// ============ PERMISOS ============
const { hasPermiso } = usePermisos()
const permisos = computed(() => ({
    ver: hasPermiso('Historias_view'),
    get: hasPermiso('Historias_get'),
    notas_ver: hasPermiso('Notas_view'),
    notas_put: hasPermiso('Notas_put'),
    notas_delete: hasPermiso('Notas_delete'),
    evoluciones_ver: hasPermiso('Evoluciones_view'),
    evoluciones_put: hasPermiso('Evoluciones_put'),
    evoluciones_delete: hasPermiso('Evoluciones_delete'),
    terapias_ver: hasPermiso('Terapias_view'),
    terapias_put: hasPermiso('Terapias_put'),
    terapias_delete: hasPermiso('Terapias_delete'),
    diagnosticos_ver: hasPermiso('Diagnosticos_view'),
    tratamientos_ver: hasPermiso('Tratamientos_view'),
    tratamientos_put: hasPermiso('Tratamientos_put'),
    tratamientos_delete: hasPermiso('Tratamientos_delete'),
    medicacion_ver: hasPermiso('Medicacion_view'),
    medicacion_put: hasPermiso('Medicacion_put'),
    medicacion_delete: hasPermiso('Medicacion_delete'),
    medicina_ver: hasPermiso('MedicinaGeneral_view'),
    medicina_put: hasPermiso('MedicinaGeneral_put'),
    medicina_delete: hasPermiso('MedicinaGeneral_delete'),
    trabajo_ver: hasPermiso('TrabajoSocial_view'),
    trabajo_put: hasPermiso('TrabajoSocial_put'),
    trabajo_delete: hasPermiso('TrabajoSocial_delete'),
}));

// ============ ESTADO DEL COMPONENTE ============
const historiasList = ref([]);
const pacienteSeleccionado = ref(null);
const notas = ref([]);
const analisis = ref([]);
const tratamientos = ref([]);
const medicinas = ref([]);
const evoluciones = ref([]);
const nutricion = ref([]);
const diagnosticos = ref([]);
const trabajosSocial = ref([]);
const kardex = ref({});
const historialCambioSonda = ref([])
const examenesFisicos = ref([])
const inventario = ref([])
const id_paciente = ref('')

const notasPendientes = ref([{ servicio: 'nose' }]);
const medicos = ref([]);

// ============ MODALES Y VISIBILITY ============
const showHistorialCompleto = ref(false);
const showTablas = ref(true)
const showGraficas = ref(false)
const showInventario = ref(false)
const showItem = ref(false);
const showPanel = ref(true)
const refreshKey = ref(0);

// ============ CARGAR DATOS INICIALES ============
onMounted(async () => {
    medicos.value = await medicosStore.traer();
    await pacientesStore.traer(false)
    await cargarHistorias();
    await historiasStore.traerNoEnviados()
    filtros.value = await traerFiltrosHistoria()
    varView.datosActualizados();
});

// ============ CARGAR HISTORIAS ============
async function cargarHistorias(cambio) {
    try {
        historiasList.value = await historiasStore.datosHistoria;
        await historiasStore.analisisInicial();
        await historiasStore.traerNoEnviados()
    } catch (error) {
        console.error('Error cargando historias:', error);
    }
}

// ============ SELECCIONAR Y CARGAR PACIENTE ============
async function seleccionarPaciente(historial) {
    historiasStore.analisisPaciente(historial.id)
    pacienteSeleccionado.value = historial;
    historiasStore.Formulario.Analisis.historia.name_paciente = historial.paciente;
    historiasStore.Formulario.Analisis.historia.No_document_paciente = historial.cedula;
    historiasStore.Formulario.Analisis.historia.id_paciente = historial.id;

    await cargarDatosPaciente(historial.id);
    showHistorialCompleto.value = true;
}

async function cambiarAGraficos() {
    showTablas.value = false
    showInventario.value = false
    showGraficas.value = true
}

function cambiarTablas() {
    showGraficas.value = false
    showInventario.value = false
    showTablas.value = true
}

async function cambiarInventario() {
    showGraficas.value = false
    showTablas.value = false

    inventario.value = await insumoStore.traerInventarioAsignado(historiasStore.Formulario.Analisis.historia.id_paciente)
    showInventario.value = true
}


// ============ CARGAR DATOS DEL PACIENTE ============
async function cargarDatosPaciente(id) {
    // varView.cargando = true;
    try {
        // Reiniciar arrays
        notas.value = [];
        analisis.value = [];
        tratamientos.value = [];
        medicinas.value = [];
        evoluciones.value = [];
        nutricion.value = [];
        diagnosticos.value = [];
        trabajosSocial.value = [];
        examenesFisicos.value = [];
        id_paciente.value = id

        const allAnalisis = await store.listDatos(id, 'Analisis', 'historia.id_paciente') || [];

        // Clasificar análisis por tipo
        for (const a of allAnalisis) {
            if (a.servicio?.plantilla === 'Evolucion') {
                nutricion.value.push({ ...a, fecha: formatDate(a.created_at) });
            } else if (a.servicio?.plantilla === 'Trabajo Social') {
                trabajosSocial.value.push({ ...a, fecha: formatDate(a.created_at) });
            } else if (a.servicio?.plantilla === 'Medicina') {
                analisis.value.push({ ...a, fecha: formatDate(a.created_at) });
            } else if (a.servicio?.plantilla === 'Nota') {
                notas.value.push({ ...a });
            } else if (a.servicio?.plantilla === 'Terapia') {
                evoluciones.value.push({ ...a });
            }

            let tratamiento = await store.listDatos(a.id, 'Plan_manejo_procedimientos', 'id_analisis') || [];
            tratamiento.map(t => {
                tratamientos.value.push({
                    ...t,
                    ...a,
                    id: t.id,
                    fecha: formatDate(a.created_at)
                })
            })

            let medicina = await store.listDatos(a.id, 'Plan_manejo_medicamentos', 'id_analisis') || [];
            medicina.map(m => {
                medicinas.value.push({
                    ...m,
                    ...a,
                    id: m.id,
                    fecha: formatDate(a.created_at)
                })
            })

            let diagnostico = await store.listDatos(a.id, 'Diagnosticos', 'id_analisis') || [];
            diagnostico.map(d => {
                diagnosticos.value.push({
                    ...d,
                    ...a,
                    fecha: formatDate(a.created_at)
                })
            })

            if (a.examen_fisico) {
                // Convertir altura a metros
                const alturaMetros = a.examen_fisico.altura / 100;

                // Calcular IMC
                const imcPaciente = a.examen_fisico.peso / (alturaMetros ** 2);
                const IMC = parseFloat(imcPaciente.toFixed(2))

                // Formatear fecha
                const fechaFormateada = new Date(a.examen_fisico.created_at)
                    .toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });

                // Agregar al arreglo con IMC y fecha formateada
                examenesFisicos.value.push({
                    x: fechaFormateada.split('/').reverse().join('-'),
                    y: IMC,
                    IMC,
                    fecha: fechaFormateada.split('/').reverse().join('-')
                });
            }
        }
        // Insumos
        inventario.value = await insumoStore.traerInventarioAsignado(id)

        // Ordenar por fecha descendente
        notas.value.sort((a, b) => new Date(b.fecha_nota) - new Date(a.fecha_nota));
        analisis.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        nutricion.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        trabajosSocial.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    } catch (error) {
        console.error('Error cargando datos del paciente:', error);
    } finally {
        varView.datosActualizados()
    }
}

async function cargarAlmacen(tabla, datos) {
    if (tabla == 'Notas') {
        const mapa = new Map(notas.value.map(a => [a.id, a]))

        for (const item of datos) {
            mapa.set(item.id, item)
        }
        notas.value = Array.from(mapa.values())
    } else if( tabla == 'Consultas') {
        analisis.value = datos
    } else if(tabla == 'Terapias') {
        tratamientos.value = datos
    } else if(tabla == 'Evoluciones'){
        evoluciones.value = datos
    } else if(tabla == 'Trabajos'){
        trabajosSocial.value = datos
    }
}

// ============ MANEJADOR DE MODALES ============
const { loadItem } = historialManejoModales({
    historiasStore,
    showItem,
    formularioItem,
    varView,
    actualizar,
});

const { actualizarHistoria } = useCitaActions({
    fecha: null
})

function exportarServicio(servicio) {
    varView.showExportarPDFs = true
    varView.onlyPaciente = true
    varView.id_pacientePDF = historiasStore.Formulario.Analisis.historia.id_paciente
    varView.servicioPDF = servicio
}

useAutoRefresh({
    showRef: showItem,
    cambioEnApi: computed(() => varView.cambioEnApi),
    refresh: refreshKey,
    fetchFn: async () => {
        historiasStore.Formulario.Analisis.historia.id_paciente = id_paciente.value
        await historiasStore.analisisFiltrados({ plantilla: varView.tipoHistoria === 'Medicina' ? 'Medicina' : varView.tipoHistoria === 'Evolucion' ? 'Evolucion' : varView.tipoHistoria === 'Trabajo Social' ? 'Trabajo Social' : varView.tipoHistoria === 'Nota' ? 'Nota' : varView.tipoHistoria === 'Terapia' ? 'Terapia' : varView.tipoHistoria === 'Tratamientos' ? 'Medicina' : 'Medicina' })
        cargarDatosPaciente(id_paciente.value)
    }
});

// ============ CONFIGURACIONES DE TABLAS ============
const consultasConfig = computed(() => {
    const config = useConsultasTable(loadItem, exportar, exportarServicio, permisos.value.medicina_put, permisos.value.medicina_delete);
    return {
        ...config.headerConfig, columns: config.columns, acciones: config.acciones, card: config.card, rowActions: config.getRowItems, filtros: [
            { columna: 'servicio.name', placeholder: 'Servicio', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Medicina'})
                    cargarAlmacen('Consultas', data)
                } },
            { columna: 'profesional.info_usuario.name', placeholder: 'Profesional', options: filtros.value.profesionales, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Medicina'})
                    cargarAlmacen('Consultas', data)
                } },
            { columna: 'fecha_mes', columnaReal: 'terapia.fecha', placeholder: 'Mes', tipo: 'mes', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Medicina'})
                    cargarAlmacen('Consultas', data)
                } },
            { columna: 'fecha_año', columnaReal: 'terapia.fecha', placeholder: 'Año', tipo: 'año', options: filtros.value.años, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Medicina'})
                    cargarAlmacen('Consultas', data)
                } }
        ]
    };
});

const diagnosticosConfig = computed(() => {
    const config = useDiagnosticosTable();
    return { ...config.headerConfig, card: config.card, columns: config.columns };
});

const evolucionesConfig = computed(() => {
    const config = useEvolucionesTable(loadItem, exportar, exportarServicio, permisos.value.terapias_put, permisos.value.terapias_delete);
    return {
        ...config.headerConfig, columns: config.columns, acciones: config.acciones, card: config.card, filtros: [
            { columna: 'servicio.name', placeholder: 'Servicio', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Terapia'})
                    cargarAlmacen('Terapias', data)
                } },
            { columna: 'profesional.info_usuario.name', placeholder: 'Profesional', options: filtros.value.profesionales, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Terapia'})
                    cargarAlmacen('Terapias', data)
                } },
            { columna: 'fecha_mes', columnaReal: 'terapia.fecha', placeholder: 'Mes', tipo: 'mes', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Terapia'})
                    cargarAlmacen('Terapias', data)
                } },
            { columna: 'fecha_año', columnaReal: 'terapia.fecha', placeholder: 'Año', tipo: 'año', options: filtros.value.años, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Terapia'})
                    cargarAlmacen('Terapias', data)
                } }
        ]
    };
});

const notasConfig = computed(() => {
    const config = useNotasTable(loadItem, exportar, exportarServicio, permisos.value.notas_put, permisos.value.notas_delete);
    return {
        ...config.headerConfig, columns: config.columns, acciones: config.acciones, card: config.card, rowActions: config.getRowItemsNota, filtros: [
            { columna: 'servicio.name', placeholder: 'Servicio', accion: async(filtros) => { const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Nota'}); cargarAlmacen('Notas', data) } },
            { columna: 'profesional.info_usuario.name', placeholder: 'Profesional', options: filtros.value.profesionales, accion: async(filtros) => { const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Nota'}); cargarAlmacen('Notas', data) } },
            { columna: 'fecha_mes', columnaReal: 'nota.fecha_nota', placeholder: 'Mes', tipo: 'mes', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Nota'})
                    cargarAlmacen('Notas', data)
                }
            },
            { 
                columna: 'fecha_año', columnaReal: 'created_at', placeholder: 'Año', tipo: 'año', options: filtros.value.años, accion: async(filtros) => 
                {
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Nota'})
                    cargarAlmacen('Notas', data)
                } 
            }
        ]
    };
});

const tratamientosConfig = computed(() => {
    const config = useTratamientosTable(loadItem, exportar, exportarServicio, permisos.value.tratamientos_put, permisos.value.tratamientos_delete);
    return {
        ...config.headerConfig, columns: config.columns, card: config.card, rowActions: config.getRowItemsTratamiento, acciones: config.acciones
    };
});

const medicacionConfig = computed(() => {
    const config = useMedicacionTable(loadItem, exportar, permisos.value.medicacion_put, permisos.value.medicacion_delete);
    return { ...config.headerConfig, columns: config.columns, card: config.card, rowActions: config.getRowItemsMedicacion, acciones: config.acciones };
});

const nutricionConfig = computed(() => {
    const config = useNutricionTable(loadItem, exportar, exportarServicio, permisos.value.evoluciones_put, permisos.value.evoluciones_delete);
    return {
        ...config.headerConfig, columns: config.columns, acciones: config.acciones, card: config.card, rowActions: config.getRowItemsEvolucion, filtros: [
            { columna: 'servicio.name', placeholder: 'Servicio', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Evolucion'})
                    cargarAlmacen('Evoluciones', data)
                } },
            { columna: 'profesional.info_usuario.name', placeholder: 'Profesional', options: filtros.value.profesionales, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Evolucion'})
                    cargarAlmacen('Evoluciones', data)
                } },
            { columna: 'fecha_mes', columnaReal: 'terapia.fecha', placeholder: 'Mes', tipo: 'mes', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Evolucion'})
                    cargarAlmacen('Evoluciones', data)
                } },
            { columna: 'fecha_año', columnaReal: 'terapia.fecha', placeholder: 'Año', tipo: 'año', options: filtros.value.años, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Evolucion'})
                    cargarAlmacen('Evoluciones', data)
                } }
        ]
    };
});

const trabajoSocialConfig = computed(() => {
    const config = useTrabajoSocialTable(loadItem, exportar, exportarServicio, permisos.value.trabajo_put, permisos.value.trabajo_delete);
    return {
        ...config.headerConfig, columns: config.columns, card: config.card, rowActions: config.getRowItemsTrabajoSocial, filtros: [
            { columna: 'servicio.name', placeholder: 'Servicio', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Trabajo Social'})
                    cargarAlmacen('Trabajos', data)
                } },
            { columna: 'profesional.info_usuario.name', placeholder: 'Profesional', options: filtros.value.profesionales, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Trabajo Social'})
                    cargarAlmacen('Trabajos', data)
                } },
            { columna: 'fecha_mes', columnaReal: 'terapia.fecha', placeholder: 'Mes', tipo: 'mes', accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Trabajo Social'})
                    cargarAlmacen('Trabajos', data)
                } },
            { columna: 'fecha_año', columnaReal: 'terapia.fecha', placeholder: 'Año', tipo: 'año', options: filtros.value.años, accion: async(filtros) => 
                { 
                    const data = await historiasStore.analisisFiltrados({...filtros, plantilla: 'Trabajo Social'})
                    cargarAlmacen('Trabajos', data)
                } }
        ]
    };
});

const kardexConfig = computed(() => {
    const config = useKardexTable(loadItem);
    return { ...config.headerConfig, columns: config.columns };
});

const {
    columnsMovimiento
} = useInsumoActions({ notificaciones })

const propiedadesTablaMovimiento = computed(() => {
    return {
        titulo: "Movimientos relacionados a pacientes",
        buscador: true,
        excel: true,
        data: inventario,
        columns: columnsMovimiento,
    }
})

const propiedadesFormularioVerMovimiento = computed(() => {
    return useMovimientoBuilder({
        storeId: "ModificarMovimiento",
        storePinia: "Insumos",
        show: showModificarMovimiento.value,
        medicosList: [],
        pacientesList: [],
        optionsInsumosDevueltos: [],
        optionsEquiposSeriales: [],
        cerrarModal: () => { showModificarMovimiento.value = false }
    })
})

// ============ COLUMNAS TABLA HISTORIAS ============
const columnasHistorias = [
    { accessorKey: "cedula", header: "Documento", ordenar: true },
    { accessorKey: "paciente", header: "Nombre", ordenar: true },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado');
            const color = estado === 'Creada' ? 'success' : estado === 'Nueva' ? 'neutral' : 'warning';
            return h(UBadge, { variant: 'subtle', color, class: 'capitalize' }, () => estado);
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => h('div', { class: 'text-right' }, h(UButton, {
            icon: 'i-lucide-arrow-right',
            color: 'primary',
            variant: 'ghost',
            onClick: () => seleccionarPaciente(row.original)
        }))
    },
];

const propiedadesTablaPrincipal = computed(() => ({
    titulo: 'Historias Clínicas',
    data: historiasList,
    columns: columnasHistorias,
    filtros: [{ columna: 'estado', placeholder: 'Estado' }],
    buttons: [
        {
            icon: 'lucide-file-down', accion: () => {
                varView.showExportarPDFs = true
                varView.onlyPaciente = false
                varView.id_pacientePDF = ''
                varView.servicioPDF = ''
            }, texto: 'Exportar', color: 'primary', variant: 'subtle'
        }
    ],
    card: {
        header: ['paciente', 'cedula'],
        headerBadge: {
            activeValue: 'Creada',
            field: 'estado',
            activeLabel: 'Creada',
            inactiveLabel: 'Nueva'
        },
    },
    rowActions: (row) => {
        const data = row.original || row
        return [
            { label: 'Seleccionar', icon: 'i-lucide-arrow-right', onSelect: () => seleccionarPaciente(data) }
        ]
    }
}));

function cerrarModalVer() {
    showItem.value = false
}

const propiedadesItemHistoria = computed(() => {
    return useVerHistoriaBuilder({
        storeId: 'ActualizarHistorias',
        storePinia: 'Historias',
        cerrarModal: cerrarModalVer,
        formularioItem,
        actualizar,
        show: showItem,
    })
})

</script>

<template>
    <FondoDefault>
        <Form :Propiedades="propiedadesItemHistoria" />
        <Form v-if="hasPermiso('Insumos_put')" :Propiedades="propiedadesFormularioVerMovimiento" />
        <!-- VISTA INICIAL - LISTA DE PACIENTES -->
        <div v-if="!showHistorialCompleto && (permisos.ver || permisos.get)" class="space-y-4">
            <!-- Módulo: Notas Pendientes -->
            <UCard v-if="NoEnviados.length > 0">
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-exclamation-triangle text-(--color-warning)"></i>
                            <h2 class="text-lg font-semibold">Registros Médicos No Enviados</h2>
                        </div>
                        <UBadge color="warning">{{ NoEnviados?.length }}</UBadge>
                    </div>
                </template>

                <div class="space-y-2">
                    <div v-for="nota in NoEnviados" :key="nota.id"
                        class="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-start justify-between">
                        <div class="flex-1">
                            <p class="font-medium text-sm">{{ nota.servicio || 'Sin título' }} - <span
                                    class="font-medium text-sm">{{
                                        nota.Cita.paciente.info_usuario.name }}</span></p>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ nota.historia.fecha_historia }}
                            </p>
                            <p class="font-medium text-sm"><i class="fa-solid fa-user-doctor mr-1"></i>{{
                                nota.Cita.profesional.info_usuario.name }}</p>
                        </div>
                        <UButton size="xs" color="warning" @click="actualizarHistoria(nota)">
                            Enviar
                        </UButton>
                    </div>
                </div>
            </UCard>
            <!-- Tabla de Historias -->
            <TablaNuxt :Propiedades="propiedadesTablaPrincipal" />
        </div>

        <!-- VISTA DETALLADA - HISTORIAL COMPLETO DEL PACIENTE -->
        <div v-else-if="showHistorialCompleto && pacienteSeleccionado" class="space-y-4">
            <!-- Header Historial -->
            <div class="space-y-3">

                <!-- Paciente -->
                <UCard
                    class="bg-linear-to-r from-(--color-default-500) to-(--color-default-600) text-white shadow-lg border-0">

                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <!-- Datos -->
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <div
                                    class="size-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <i class="fa-solid fa-user text-sm"></i>
                                </div>

                                <div>
                                    <h2 class="font-semibold text-sm md:text-base truncate">
                                        {{ pacienteSeleccionado.paciente }}
                                    </h2>

                                    <p class="text-xs text-white/80">
                                        Documento: {{ pacienteSeleccionado.cedula }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <UButton :icon="showPanel ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" color="white"
                                variant="soft" @click="showPanel = !showPanel">
                                {{ showPanel ? 'Ocultar' : 'Mostrar' }}
                            </UButton>
                            <!-- Botón volver -->
                            <UButton icon="i-lucide-arrow-left" color="white" variant="soft"
                                @click="showHistorialCompleto = false">
                                Regresar
                            </UButton>
                        </div>

                    </div>

                </UCard>

                <!-- Navegación de módulos -->
                <div v-if="showPanel" class="grid grid-cols-3 gap-3">

                    <!-- Registros -->
                    <UCard @click="cambiarTablas"
                        class="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        :class="showTablas
                            ? 'ring-2 ring-(--color-primary-500) border-(--color-primary-500)'
                            : ''">
                        <div class="flex items-center gap-3">
                            <div
                                class="md:size-10 h-full rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <i class="fa-solid fa-file-medical text-blue-600 dark:text-blue-300"></i>
                            </div>

                            <div class="flex-1 min-w-0">
                                <p class="font-medium  md:text-sm text-xs">
                                    Registros
                                </p>

                                <p class="hidden md:block text-xs text-gray-500">
                                    Notas médicas
                                </p>
                            </div>

                            <UBadge v-if="showTablas" class="hidden md:block" color="primary" variant="soft">
                                Activo
                            </UBadge>

                        </div>
                    </UCard>

                    <!-- Dashboard -->
                    <UCard @click="cambiarAGraficos"
                        class="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        :class="showGraficas
                            ? 'ring-2 ring-(--color-primary-500) border-(--color-primary-500)'
                            : ''">
                        <div class="flex items-center gap-3">
                            <div
                                class="md:size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                <i class="fa-solid fa-chart-line text-emerald-600 dark:text-emerald-300"></i>
                            </div>
                            <div class="flex-1">
                                <p class="font-medium  md:text-sm text-xs">
                                    Evolución
                                </p>

                                <p class="hidden md:block text-xs text-gray-500">
                                    Dashboard clínico
                                </p>
                            </div>

                            <UBadge v-if="showGraficas" color="success" variant="soft" class="hidden md:block">
                                Activo
                            </UBadge>

                        </div>
                    </UCard>

                    <!-- Inventario -->
                    <UCard @click="cambiarInventario"
                        class="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        :class="showInventario
                            ? 'ring-2 ring-(--color-primary-500) border-(--color-primary-500)'
                            : ''">
                        <div class="flex items-center gap-3">
                            <div
                                class="md:size-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                <i class="fa-solid fa-pills text-amber-600 dark:text-amber-300"></i>
                            </div>

                            <div class="flex-1">
                                <p class="font-medium md:text-sm text-xs">
                                    Inventario
                                </p>

                                <p class="hidden md:block text-xs text-gray-500">
                                    {{ inventario.length }} productos asignados
                                </p>
                            </div>

                            <UBadge v-if="showInventario" color="warning" variant="soft" class="hidden md:block">
                                Activo
                            </UBadge>

                        </div>
                    </UCard>

                </div>

            </div>

            <div v-if="showTablas">
                <!-- Secciones Principales con Tabs -->
                <UTabs :items="[
                    { slot: 'notas', label: 'Notas', icon: 'i-lucide-file-text' },
                    { slot: 'evoluciones', label: 'Evoluciones', icon: 'i-lucide-trending-up' },
                    { slot: 'terapias', label: 'Terapias', icon: 'i-lucide-heart-pulse' },
                    { slot: 'consultas', label: 'Consultas', icon: 'i-lucide-clipboard' },
                    { slot: 'trabajo-social', label: 'Social', icon: 'i-lucide-briefcase-business' },
                    { slot: 'diagnosticos', label: 'Diagnósticos', icon: 'i-lucide-activity' },
                    { slot: 'medicamentos', label: 'Medicamentos', icon: 'i-lucide-pill' },
                    { slot: 'tratamientos', label: 'Tratamientos', icon: 'i-lucide-bandage' },
                ]" class="w-full">

                    <!-- Notas -->
                    <template #notas>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.notas_ver" class="space-y-4">
                                <TablaScroll :Propiedades="{
                                    titulo: 'Notas Médicas',
                                    data: notas,
                                    cargarData: async(id, por_pagina) => {return await traerAnalisisPaginado(id, por_pagina, 'Nota', historiasStore.Formulario.Analisis.historia.id_paciente)},
                                    columns: notasConfig.columns,
                                    filtros: notasConfig.filtros,
                                    buttons: notasConfig.buttons,
                                    acciones: notasConfig.acciones,
                                    card: notasConfig.card,
                                    rowActions: notasConfig.rowActions,
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver notas" color="gray" />
                        </div>
                    </template>

                    <!-- Consultas -->
                    <template #consultas>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.medicina_ver" class="space-y-4">
                                <TablaScroll :key="`consultas-${refreshKey}`" :Propiedades="{
                                    titulo: 'Consultas y Análisis',
                                    data: analisis,
                                    columns: consultasConfig.columns,
                                    filtros: consultasConfig.filtros,
                                    buttons: consultasConfig.buttons,
                                    acciones: consultasConfig.acciones,
                                    card: consultasConfig.card,
                                    rowActions: consultasConfig.rowActions,
                                    cargarData: async(items, por_pagina) => { return await traerAnalisisPaginado(items, por_pagina, 'Medicina', historiasStore.Formulario.Analisis.historia.id_paciente) },
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver consultas" color="gray" />
                        </div>
                    </template>

                    <!-- Evoluciones -->
                    <template #evoluciones>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.evoluciones_ver" class="space-y-4">
                                <TablaScroll :key="`evoluciones-${refreshKey}`" :Propiedades="{
                                    titulo: 'Evoluciones del Paciente',
                                    data: nutricion,
                                    columns: nutricionConfig.columns,
                                    filtros: nutricionConfig.filtros,
                                    buttons: nutricionConfig.buttons,
                                    acciones: nutricionConfig.acciones,
                                    card: nutricionConfig.card,
                                    rowActions: nutricionConfig.rowActions,
                                    cargarData: async(items, por_pagina) => { return await traerAnalisisPaginado(items, por_pagina, 'Evolucion', historiasStore.Formulario.Analisis.historia.id_paciente) },
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver evoluciones" color="gray" />
                        </div>
                    </template>

                    <!-- Terapias -->
                    <template #terapias>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.terapias_ver" class="space-y-4">
                                <TablaScroll :key="`terapias-${refreshKey}`" :Propiedades="{
                                    titulo: 'Terapias y Procedimientos',
                                    data: evoluciones,
                                    columns: evolucionesConfig.columns,
                                    filtros: evolucionesConfig.filtros,
                                    buttons: evolucionesConfig.buttons,
                                    acciones: evolucionesConfig.acciones,
                                    card: evolucionesConfig.card,
                                    rowActions: evolucionesConfig.rowActions,
                                    cargarData: async(items, por_pagina) => { return await traerAnalisisPaginado(items, por_pagina, 'Terapia', historiasStore.Formulario.Analisis.historia.id_paciente) },
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver terapias" color="gray" />
                        </div>
                    </template>

                    <template #trabajo-social>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.trabajo_ver" class="space-y-4">
                                <TablaScroll :key="`trabajo-social-${refreshKey}`" :Propiedades="{
                                    titulo: 'Trabajos sociales',
                                    data: trabajosSocial,
                                    columns: trabajoSocialConfig.columns,
                                    filtros: trabajoSocialConfig.filtros,
                                    buttons: trabajosSocial.buttons,
                                    acciones: trabajoSocialConfig.acciones,
                                    card: trabajoSocialConfig.card,
                                    rowActions: trabajoSocialConfig.card,
                                    cargarData: async(items, por_pagina) => { return await traerAnalisisPaginado(items, por_pagina, 'Trabajo Social', historiasStore.Formulario.Analisis.historia.id_paciente) },
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver terapias" color="gray" />
                        </div>
                    </template>

                    <!-- Medicamentos -->
                    <template #medicamentos>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.medicacion_ver" class="space-y-4">
                                <TablaNuxt :key="`medicamentos-${refreshKey}`" :Propiedades="{
                                    titulo: 'Medicación del Paciente',
                                    data: medicinas,
                                    columns: medicacionConfig.columns,
                                    filtros: medicacionConfig.filtros,
                                    excel: true,
                                    acciones: medicacionConfig.acciones,
                                    card: medicacionConfig.card,
                                    rowActions: medicacionConfig.rowActions,
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver medicamentos" color="gray" />
                        </div>
                    </template>

                    <!-- Diagnósticos -->
                    <template #diagnosticos>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.diagnosticos_ver" class="space-y-4">
                                <TablaNuxt :key="`diagnosticos-${refreshKey}`" :Propiedades="{
                                    titulo: 'Diagnósticos del Paciente',
                                    data: diagnosticos,
                                    columns: diagnosticosConfig.columns,
                                    filtros: diagnosticosConfig.filtros,
                                    excel: true,
                                    card: diagnosticosConfig.card,
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver diagnósticos" color="gray" />
                        </div>
                    </template>

                    <!-- Tratamientos -->
                    <template #tratamientos>
                        <div class="space-y-4 pt-4">
                            <div v-if="permisos.tratamientos_ver" class="space-y-4">
                                <TablaNuxt :key="`tratamientos-${refreshKey}`" :Propiedades="{
                                    titulo: 'Tratamientos del Paciente',
                                    data: tratamientos,
                                    columns: tratamientosConfig.columns,
                                    filtros: tratamientosConfig.filtros,
                                    excel: true,
                                    acciones: tratamientosConfig.acciones,
                                    card: tratamientosConfig.card,
                                    rowActions: tratamientosConfig.rowActions,
                                }" />
                            </div>
                            <UAlert v-else icon="i-lucide-lock" title="Sin permisos"
                                description="No tienes permisos para ver tratamientos" color="gray" />
                        </div>
                    </template>
                </UTabs>
            </div>

            <div v-if="showGraficas" class="py-7">
                <ChartComponent :Propiedades="{
                    datos: examenesFisicos,
                    type: 'Line',
                    title: 'Grafico IMC del paciente',
                    height: 400,
                    configuracion: {
                        xLabel: 'Fecha',
                        yLabel: 'IMC',
                        categories: {
                            y: {
                                name: 'IMC',
                                color: '#3b82f6'
                            },
                            scales: {
                                x: {
                                    type: 'time', // eje temporal
                                    time: {
                                        unit: 'week', // puedes usar 'month' o 'week' según tu evolución
                                        tooltipFormat: 'yyyy/MM/dd'
                                    },
                                    title: {
                                        display: true,
                                        text: 'Fecha'
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'IMC'
                                    }
                                }
                            }
                        }
                    }
                }"></ChartComponent>
            </div>

            <div v-if="showInventario">
                <TablaNuxt :Propiedades="propiedadesTablaMovimiento" />
            </div>
        </div>

        <!-- SIN PERMISOS -->
        <div v-else class="flex items-center justify-center h-96">
            <UCard class="w-full max-w-md">
                <div class="text-center space-y-4">
                    <i class="fa-solid fa-lock text-6xl text-(--color-danger)"></i>
                    <h2 class="text-xl font-semibold">Acceso Restringido</h2>
                    <p class="text-gray-600 dark:text-gray-400">No tienes permisos para acceder a este módulo</p>
                    <UButton to="/Home" icon="i-lucide-home">Volver al Inicio</UButton>
                </div>
            </UCard>
        </div>

        <ExportarPDFs v-if="varView.showExportarPDFs" :datos="analisis" />
    </FondoDefault>
    <Historia v-if="varView.showNuevaHistoria" />
</template>
