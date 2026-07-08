<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import ImportarCSV from '~/components/paginas/ImportarCSV.vue'
import TimelineMovimientos from '~/components/organism/Inventario/TimelineMovimientos.vue'

import { ref, onMounted, computed, h } from 'vue'
import { useInsumosBuilder } from '~/build/Historial/useInsumosBuilder'
import { useInsumoStore } from "~/stores/Entidades/Insumo";
import { useProfesionalStore } from '~/stores/Entidades/Profesional'
import { usePacientesStore } from "~/stores/Entidades/Paciente"
import { UBadge, UButton, UDropdownMenu } from '#components'
import { useInsumoActions } from "~/composables/Entidades/Insumo";
import { storeToRefs } from "pinia";
import { useMovimientoBuilder } from "~/build/Historial/useMovimientoBuilder";
import { usePlanesBuilder } from "~/build/Historial/usePlanesBuilder";

const varView = useVarView()
const notificaciones = useNotificacionesStore()
const apiRest = useApiRest()

const insumoStore = useInsumoStore()
const storeNoEnviados = useNoEnviados()
const refresh = ref(1)
const medicosStore = useProfesionalStore()
const medicosList = ref([])
const pacientesStore = usePacientesStore()
const pacientesList = ref([])
const movimientos = ref([])
const optionsInsumosDevueltos = ref([])
const optionsEquiposSeriales = ref([])
const tiposEquipos = ref([])
const insumos = ref([])
const medicamentos = ref([])

const puedeVer = varView.getPermisos.includes('Insumos_view')
const puedeGet = varView.getPermisos.includes('Insumos_get')
const puedePost = varView.getPermisos.includes('Insumos_post')
const puedePut = varView.getPermisos.includes('Insumos_put')

const { Insumos, Movimientos, Prestaciones, NoEnviados, showNuevoInsumo, showModificarInsumo, showMovimiento, showModificarMovimiento } = storeToRefs(insumoStore)
const { importacion } = storeToRefs(storeNoEnviados)
const { showItem, Pacientes } = storeToRefs(pacientesStore)

const {
    descargarNoEnviados,
    importarNoEnviados
} = storeNoEnviados

async function sincronizarDatos() {
    await insumoStore.sincronizar()
}

// 📊 COLUMNS PARA TABLA DE INSUMOS
const columns = [
    { accessorKey: "nombre", header: "Nombre", ordenar: true },
    {
        accessorKey: "es_prestable",
        header: "Prestable",
        cell: ({ row }) => {
            const prestable = row.getValue('es_prestable')

            return prestable == 0 ? 'No' : 'Si'
        }
    },
    { accessorKey: "categoria", header: "Tipo", ordenar: true },
    {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
            const estado = row.getValue('stock')
            const color = estado > 9 ? 'neutral' : estado > 1 && estado < 10 ? 'warning' : 'error'
            return h(UBadge, { variant: 'subtle', color, class: 'capitalize' }, () => estado)
        }
    },
    {
        id: 'actions',
        cell: ({ row }) =>
            h('div', { class: 'text-right' },
                h(UDropdownMenu, {
                    content: { align: 'end' },
                    items: getRowItemsInsumos(row)
                }, () =>
                    h(UButton, {
                        icon: 'i-lucide-ellipsis-vertical',
                        color: 'neutral',
                        variant: 'ghost'
                    })
                )
            )
    },
]

// 🎯 ACCIONES PARA INSUMOS
function getRowItemsInsumos(row) {
    const insumo = row.original
    return [
        { type: 'label', label: 'Acciones' },
        {
            label: 'Ver Insumo',
            onSelect() { verInsumo(insumo) }
        },
        {
            label: 'Agregar Movimiento',
            onSelect() { agregarMovimiento(insumo) }
        },
        { type: 'separator' },
        {
            label: 'Eliminar',
            onSelect() { eliminarInsumo(insumo) }
        }
    ]
}

// 📋 FUNCIONES DE DATOS
async function llamadatos(cambio) {
    await insumoStore.traer(true, cambio)
    await insumoStore.traerNoEnviados()
    await llamaInsumos()
    varView.datosActualizados()
}

async function llamadatosMovimiento(cambio) {
    await insumoStore.traer(true, cambio)
    await insumoStore.traerMovimiento(true, cambio)
    await insumoStore.traerNoEnviados()
    await llamaInsumos()
    varView.datosActualizados()
}

async function llamadatosPrestados(cambio) {
    await insumoStore.traerPrestaciones(true, cambio)
    await insumoStore.traerNoEnviados()
    varView.datosActualizados()
}

async function llamaInsumos() {
    insumos.value = Insumos.value.filter(i => i.es_prestable && i.stock > 0).map(i => {
        return { label: `${i.nombre} - ${i.categoria}`, value: i.id }
    })
    medicamentos.value = Insumos.value.filter(i => !i.es_prestable && i.stock > 0).map(i => {
        return { label: `${i.nombre} - ${i.categoria}`, value: i.id }
    })
}

// 📋 FUNCIONES DE FORMULARIOS
const {
    agregarInsumo,
    agregarMovimiento,
    verInsumo,
    cerrar,
    eliminarInsumo,
    verMovimiento,
    eliminarMovimiento,
    columnsMovimiento
} = useInsumoActions({
    notificaciones
})

// 👁️ WATCHERS
watch(() => showNuevoInsumo.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true)
            refresh.value++
        }
    }
)

watch(() => showModificarInsumo.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true)
            refresh.value++
        }
    }
)

watch(() => showMovimiento.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatosMovimiento(true)
            refresh.value++
        }
    }
)

watch(() => showItem.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatosMovimiento(true)
            await insumoStore.traerPrestaciones(true, true)
            refresh.value++
        }
    }
)

// 📌 ONMOUNTED
onMounted(async () => {
    await llamadatos()
    await llamadatosMovimiento()
    await llamadatosPrestados()
    await llamaInsumos()
    const medicos = await medicosStore.traer(true)
    medicosList.value = medicos.map(m => { return { label: `${m.info_usuario.name} - ${m.info_usuario.No_document}`, value: m.id } })
    const pacientes = await pacientesStore.traer(true)
    pacientesList.value = pacientes.map(m => { return { label: `${m.info_usuario.name} - ${m.info_usuario.No_document}`, value: m.id } })
    const tiposEquiposData = await apiRest.getData('', 'tipoEquipos')
    tiposEquipos.value = tiposEquiposData.map(tipo => ({ label: tipo.nombre, value: tipo.id }))
})

// 📦 PROPIEDADES DE FORMULARIOS
const propiedadesFormularioInsumo = puedePost
    ? computed(() => {
        return useInsumosBuilder({
            storeId: "NuevoInsumo",
            storePinia: "Insumos",
            show: showNuevoInsumo,
            cerrarModal: () => { showNuevoInsumo.value = false },
            tiposEquipos: tiposEquipos.value
        })
    })
    : null

const propiedadesFormularioVerInsumo = puedePut
    ? computed(() => {
        return useInsumosBuilder({
            storeId: "ActualizarInsumo",
            storePinia: "Insumos",
            show: showModificarInsumo,
            soloVer: varView.soloVer,
            actulizarDatos: true,
            eliminarDato: eliminarInsumo,
            cerrarModal: () => { showModificarInsumo.value = false },
            movimientos: movimientos.value,
            tiposEquipos: tiposEquipos.value
        })
    })
    : null

const propiedadesFormularioMovimiento = puedePut
    ? computed(() => {
        return useMovimientoBuilder({
            storeId: "NuevoMovimiento",
            storePinia: "Insumos",
            show: showMovimiento.value,
            insumos: Insumos.value.map(i => {
                return { label: `${i.nombre} - ${i.categoria}`, value: i.id }
            }),
            medicosList: medicosList.value,
            pacientesList: pacientesList.value,
            optionsInsumos: optionsInsumosDevueltos,
            optionsEquiposSeriales: optionsEquiposSeriales.value,
            cerrarModal: () => { showMovimiento.value = false }
        })
    })
    : null

const propiedadesFormularioVerMovimiento = puedePut
    ? computed(() => {
        return useMovimientoBuilder({
            storeId: "ModificarMovimiento",
            storePinia: "Insumos",
            show: showModificarMovimiento.value,
            insumos: Insumos.value.map(i => {
                return { label: `${i.nombre} - ${i.categoria}`, value: i.id }
            }),
            medicosList: medicosList.value,
            pacientesList: pacientesList.value,
            optionsInsumos: optionsInsumosDevueltos,
            optionsEquiposSeriales: optionsEquiposSeriales.value,
            cerrarModal: () => { showModificarMovimiento.value = false }
        })
    })
    : null

const propiedadesItemHistoria = computed(() => {
    return usePlanesBuilder({
        storeId: 'AgregarPlan',
        storePinia: 'Historias',
        cerrarModal: () => {
            showItem.value = false
        },
        formularioItem: 'Medicamento',
        show: showItem.value,
        medicamentos: medicamentos.value,
        insumos: insumos.value,
        profesionales: medicosList.value,
        pacientes: pacientesList.value,
        showPacientes: true
    })
})

// Tabs integrados
const tabsIntegrados = [
    {
        label: 'Inventario',
        slot: 'inventario',
        icon: 'i-lucide-box'
    },
    {
        label: 'Movimientos',
        slot: 'movimientos',
        icon: 'i-lucide-repeat'
    },
    {
        label: 'Prestaciones',
        slot: 'prestaciones',
        icon: 'i-lucide-user-check'
    }
]


// 📊 PROPIEDADES DE TABLAS
const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Inventario',
        llamadatos: llamadatos,
        agregar: puedePost ? agregarInsumo : null,
        data: Insumos,
        columns: columns,
        filtros: [
            { columna: 'categoria', placeholder: 'Tipo' },
            { columna: 'ubicacion', placeholder: 'Ubicacion' },
        ],
        excel: true,
    }
})

const propiedadesTablaMovimiento = computed(() => {
    return {
        titulo: "Movimientos relacionados a pacientes",
        buscador: true,
        agregar: agregarMovimiento,
        excel: true,
        filtros: [
            { columna: 'tipoMovimiento', placeholder: 'Tipo' },
            { columna: 'insumo.categoria', placeholder: 'Categoria' },
        ],
        llamadatos: llamadatosMovimiento,
        data: Movimientos,
        columns: columnsMovimiento,
    }
})

</script>

<template>
    <Form v-if="puedePost" :Propiedades="propiedadesFormularioInsumo"></Form>
    <Form v-if="puedePut" :Propiedades="propiedadesFormularioVerInsumo"></Form>
    <Form v-if="puedePost" :Propiedades="propiedadesFormularioMovimiento"></Form>
    <Form v-if="puedePut" :Propiedades="propiedadesFormularioVerMovimiento"></Form>
    <Form v-if="puedePut" :Propiedades="propiedadesItemHistoria"></Form>


    <FondoDefault>
        <!-- Sección de Datos No Enviados -->

        <!-- Sección Integrada (Tabs) -->
        <UTabs :items="tabsIntegrados" class="mb-6">
            <template #inventario>
                <div class="p-6">
                    <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
                </div>
            </template>

            <template #movimientos>
                <div class="p-6">
                    <TablaNuxt :Propiedades="propiedadesTablaMovimiento" />
                </div>
            </template>

            <template #prestaciones>
                <div class="p-6">
                    <TimelineMovimientos :movimientos="Prestaciones" @agregar-movimiento="() => { agregarMovimiento() }"
                        @recargar="() => llamadatosPrestados(true)" />
                </div>
            </template>

        </UTabs>
    </FondoDefault>

    <!-- Importar CSV -->
    <ImportarCSV v-if="varView.importarArchivo" :cerrar="cerrar" />
</template>
