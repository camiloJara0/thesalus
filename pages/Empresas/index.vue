<script setup>
import { useServicioBuilder } from '~/build/Empresa/useServicioBuilder';
import { ref, onMounted } from 'vue';
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import TablaNuxt from '~/components/organism/Table/TablaNuxt.vue';
import { useServicioStore } from '~/stores/Entidades/Servicio';
import { storeToRefs } from 'pinia';
import Form from '~/components/organism/Forms/Form.vue';
import { useCodigosActions } from '~/composables/Entidades/Codigos';
import { useCie10Store } from '~/stores/Entidades/Cie10';
import { useCie10Builder } from '~/build/Codigos/useCie10Builder';
import { useVadecumStore } from '~/stores/Entidades/Vadecum';
import { useVadecumActions } from '~/composables/Usuarios/Vadecum';
import { useVadecumBuilder } from '~/build/Codigos/useVadecumBuilder';
import { useVerPlantillas } from '~/build/Historial/useVerPlantillas';
import Restringido from '~/components/organism/NoEnviados/Restringido.vue';

const storeServicio = useServicioStore()
const storeCie10 = useCie10Store()
const storeVademecum = useVadecumStore()
const varView = useVarView();
const notificaciones = useNotificacionesStore();
const apiRest = useApiRest();

const { Servicios, showNuevoServicio, showModificarServicio } = storeToRefs(storeServicio)
const { Cie10, showNuevoCie10, showModificarCie10 } = storeToRefs(storeCie10)
const { Vadecum, showNuevoVadecum, showModificarVadecum } = storeToRefs(storeVademecum)
const { showNuevaHistoria } = storeToRefs(varView)

const refresh = ref(1)

const puedeVer = varView.getPermisos.includes('Datos_view');
const puedeGet = varView.getPermisos.includes('Datos_get');
const puedePost = varView.getPermisos.includes('Datos_post');
const puedePut = varView.getPermisos.includes('Datos_put');
const puedeDelete = varView.getPermisos.includes('Datos_delete');

async function llamadatosServicio(cambio) {
    await storeServicio.traer(true, cambio)
    varView.datosActualizados()
}

async function llamadatosCie10(cambio) {
    await storeCie10.traer(true, cambio)
    varView.datosActualizados()
}

async function llamadatosVadecum(cambio) {
    await storeVademecum.traer(true, cambio)
    varView.datosActualizados()
}

onMounted(async () => {
    await llamadatosServicio()
    await llamadatosCie10()
    await llamadatosVadecum()
});

const {
    agregarCie10,
    verCie10,
    cerrarCie10,
    eliminarCie10,
    nuevoServicio,
    actualizarServicio,
    cerrarServicio,
    eliminarServicio,
} = useCodigosActions({
    notificaciones
})

const {
    agregarVadecum,
    verVadecum,
    cerrarVadecum,
    eliminarVadecums
} = useVadecumActions({
    vadecumStore: storeVademecum,
    varView,
    notificaciones,
    show: showNuevoVadecum,
    showVer: showModificarVadecum,
    llamadatos: llamadatosVadecum
});

const columns = [
    { accessorKey: "plantilla", header: "Plantilla" },
    { accessorKey: "name", header: "Nombre", ordenar: true },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')

            const color =
                estado === 1
                    ? 'success'
                    : estado === 0
                        ? 'neutral'
                        : 'warning'

            return h(
                UBadge,
                { variant: 'subtle', color, class: 'capitalize' },
                () => estado === 1 ? 'Activo' : estado === 0 ? 'Inactivo' : 'Desconocido'
            )
        }
    },
    {
        id: 'actions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: { align: 'end' },
                        items: getRowItems(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost'
                        })
                )
            )
    },
]

function getRowItems(row) {
    const servicio = row.original

    return [
        {
            type: 'label',
            label: 'Acciones'
        },
        {
            label: 'Editar',
            onSelect() {
                actualizarServicio(servicio)
            },
            disabled: !puedePut
        },
        {
            label: 'Ver Plantilla',
            onSelect() {
                varView.tipoConsulta = servicio
                varView.showNuevaHistoria = true
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarServicio(servicio)
            },
            disabled: !puedeDelete
        }
    ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Servicios',
        llamadatos: llamadatosServicio,
        agregar: puedePost ? nuevoServicio : null,
        data: Servicios,
        columns: columns,
        filtros: [
            { columna: 'plantilla', placeholder: 'Plantilla' },
        ],
        excel: true,
    }
})

const columnsCie10 = [
    { accessorKey: "codigo", header: "Codigo" },
    { accessorKey: "nombre", header: "Nombre", ordenar: true },
    {
        id: 'actions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: { align: 'end' },
                        items: getRowItemsCie10(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost'
                        })
                )
            )
    },
]

function getRowItemsCie10(row) {
    const codigo = row.original

    return [
        {
            type: 'label',
            label: 'Acciones'
        },
        {
            label: 'Editar',
            onSelect() {
                verCie10(codigo)
            },
            disabled: !puedePut
        },
        {
            type: 'separator'
        },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarCie10(codigo)
            },
            disabled: puedeDelete
        }
    ]
}

const columnsVadecums = [
    { accessorKey: "codigo", header: "Codigo" },
    { accessorKey: "nombre", header: "Nombre", ordenar: true },
    {
        id: 'actions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: { align: 'end' },
                        items: getRowItemsVadecums(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost'
                        })
                )
            )
    },
]

function getRowItemsVadecums(row) {
    const codigo = row.original

    return [
        {
            type: 'label',
            label: 'Acciones'
        },
        {
            label: 'Editar',
            onSelect() {
                verVadecum(codigo)
            },
            disabled: !puedePut
        },
        {
            type: 'separator'
        },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarVadecums(codigo)
            },
            disabled: !puedeDelete
        }
    ]
}

const propiedadesTablaVadecums = computed(() => {
    return {
        titulo: 'Gestión de codigos Vadecums',
        llamadatos: llamadatosVadecum,
        agregar: puedePost ? agregarVadecum : null,
        data: Vadecum,
        columns: columnsVadecums,
        excel: true,
    }
})

const propiedadesTablaCie10 = computed(() => {
    return {
        titulo: 'Gestión de Servicios',
        llamadatos: llamadatosCie10,
        agregar: puedePost ? agregarCie10 : null,
        data: Cie10,
        columns: columnsCie10,
        excel: true,
    }
})

const propiedadesServicio = puedePost
    ? computed(() => {
        return useServicioBuilder({
            storeId: 'Servicio',
            storePinia: 'Servicio',
            actualizar: false,
            showModificarServicio: showNuevoServicio,
            cerrar: cerrarServicio,
            eliminar: false
        })
    })
    : null;

const propiedadesVerServicio = puedePut
    ? computed(() => {
        return useServicioBuilder({
            storeId: 'ActualizarServicio',
            storePinia: 'Servicio',
            actualizar: true,
            showModificarServicio: showModificarServicio,
            cerrar: cerrarServicio,
            eliminar: eliminarServicio
        })
    })
    : null;

const propiedadesVerCie10 = puedePut
    ? computed(() => {
        return useCie10Builder({
            storeId: 'ModificarCie10',
            storePinia: 'Cie10',
            cerrarModal: cerrarCie10,
            show: showModificarCie10,
            tipoFormulario: 'Form',
            verUser: true,
            eliminar: eliminarCie10,
            soloVer: varView.soloVer,
        })
    })
    : null;

const propiedadesCie10 = puedePost
    ? computed(() => {
        return useCie10Builder({
            storeId: 'NuevoCie10',
            storePinia: 'Cie10',
            cerrarModal: cerrarCie10,
            show: showNuevoCie10,
            tipoFormulario: 'Form',
        })
    })
    : null;

const propiedadesVerVadecum = puedePut
    ? useVadecumBuilder({
        storeId: 'ModificarVadecum',
        storePinia: 'Vadecum',
        cerrarModal: cerrarVadecum,
        show: showNuevoVadecum,
        tipoFormulario: 'Wizard',
        verUser: true,
        eliminar: eliminarVadecums,
        soloVer: varView.soloVer,
    })
    : null;

const propiedadesVadecum = puedePost
    ? useVadecumBuilder({
        storeId: 'NuevoVadecum',
        storePinia: 'Vadecum',
        cerrarModal: cerrarVadecum,
        show: showModificarVadecum,
        tipoFormulario: 'Wizard',
    })
    : null;

const builderPlantillas = computed(() => {
    return useVerPlantillas({
        storeId: '',
        storePinia: 'Historias',
        cerrarModal: () => { varView.showNuevaHistoria = false },
        show: showNuevaHistoria,
    });
})

const tabsIntegrados = [
    {
        label: 'Servicios',
        slot: 'servicios',
        icon: 'i-lucide-briefcase'
    },
    {
        label: 'CIE 10',
        slot: 'cie10',
        icon: 'i-lucide-file-text'
    },
    {
        label: 'Vademecums',
        slot: 'vademecums',
        icon: 'i-lucide-file-text'
    }
]

// console.log(propiedades)
</script>

<template>
    <Form v-if="propiedadesServicio" :Propiedades="propiedadesServicio"></Form>
    <Form v-if="propiedadesVerServicio" :Propiedades="propiedadesVerServicio"></Form>
    <Form v-if="propiedadesVerCie10" :Propiedades="propiedadesVerCie10"></Form>
    <Form v-if="propiedadesCie10" :Propiedades="propiedadesCie10"></Form>
    <Form v-if="propiedadesVadecum" :Propiedades="propiedadesVadecum"></Form>
    <Form v-if="propiedadesVerVadecum" :Propiedades="propiedadesVerVadecum"></Form>
    <Form v-if="builderPlantillas" :Propiedades="builderPlantillas"></Form>

    <FondoDefault v-if="puedeVer">
        <UTabs :items="tabsIntegrados">
            <template #servicios>
                <div class="md:p-6 pb-0">
                    <TablaNuxt :Propiedades="propiedadesTabla" />
                </div>
            </template>

            <template #cie10>
                <div class="md:p-6 pb-0">
                    <TablaNuxt :Propiedades="propiedadesTablaCie10" />
                </div>
            </template>

            <template #vademecums>
                <div class="md:p-6 pb-0">
                    <TablaNuxt :Propiedades="propiedadesTablaVadecums" />
                </div>
            </template>
        </UTabs>
    </FondoDefault>

    <Restringido v-else/>
</template>