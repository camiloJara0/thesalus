<script setup>
import PDFServicio from '~/components/paginas/PDFServicio.vue'

import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { useCitaActions } from '~/composables/Entidades/Cita'
import { useMultiAutoRefresh } from '~/composables/useAutoRefresh'
import { traerCitasFiltradas, traerCitasPaginadas, traerFiltros } from '~/Core/Cita/GETCita'
import TablaScroll from '~/components/organism/Table/TablaScroll.vue'
import Restringido from '~/components/organism/NoEnviados/Restringido.vue'
import MetricasAgenda from '~/components/molecules/Calendario/MetricasAgenda.vue'

const varView = useVarView()
const { hasPermiso } = usePermisos()
const citasStore = useCitasStore();
const {showNuevaCita, showActualizarCita, showNuevaHistoria} = storeToRefs(varView)

const calendarioCitasStore = useCalendarioCitas();
const show = ref(false);
const refresh = ref(1);
const filtros = ref([])
const puedeVer = hasPermiso('Citas_view')
const puedeGet = hasPermiso('Citas_get')
const puedePost = hasPermiso('Citas_post')
const puedeVerTodosPacientes = hasPermiso('ListaPacientes')
const showMensaje = ref(false)
const infoCitas = ref({})

// Vista inicial según preferencias del usuario
const preferencias = usePreferencias()
preferencias.cargar()
varView.showEnFila = preferencias.vistaInicial === 'lista'
varView.showCalendario = true

const {
    fecha,
    meses,
    fechaActual
} = storeToRefs(calendarioCitasStore);

const { Citas } = storeToRefs(citasStore)
const citasScroll = ref([])

const {
    cancelarCita,
    activarCita,
    actualizarCita,
    showMotivoCancelacion,
    showMotivoEdicion,
    showObservacion
} = useCitaActions({
    fecha
})

async function llamadatos(cambio) {
    await citasStore.citasHoy(true, cambio);
    filtros.value = await traerFiltros()
    varView.datosActualizados()
}
const cambioEnApi = computed(() => varView.cambioEnApi)
const dummyRefresh = ref(0)

useMultiAutoRefresh([
    {
        showRef: showNuevaCita,
        fetchFn: () => llamadatos(true),
        refresh: dummyRefresh,
        cambioEnApi
    },
    {
        showRef: showActualizarCita,
        fetchFn: () => llamadatos(true),
        refresh,
        cambioEnApi
    },
    {
        showRef: showNuevaHistoria,
        fetchFn: () => llamadatos(true),
        refresh: dummyRefresh,
        cambioEnApi
    }
])

onMounted(async () => {
    await llamadatos(false)
    infoCitas.value = await citasStore.infoCitas()
    if(varView.getRol === 'Profesional') {
        showMensaje.value = true
        setTimeout(() => {
            showMensaje.value = false
        }, 3000)
    }
    // Rellenar fecha del formulario
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
});

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    show.value = true
    varView.showNuevaCita = true
};

// Funciones para manejar visibilidad de Pagina
const showFila = async() => {
    citasStore.contexto = 'Tabla'
    varView.showEnFila = !varView.showEnFila
};

const showCalendario = () => {
    varView.showCalendario = !varView.showCalendario
};

const buttonsVista = [
    { text: 'En Lista', icon: 'i-lucide-table', color: 'neutral', action: showFila },
    { text: 'Calendario', icon: 'i-lucide-calendar', color: varView.showCalendario ? 'primary' : 'neutral', action: showCalendario },
    puedePost ? { text: 'Agendar', icon: 'i-lucide-plus', color: 'primary', action: agregarCita } : '',
    { text: '', icon: 'i-lucide-cloud-sync', color: 'primary', variant: 'soft', action: () => { llamadatos(true) } },
]

const columns = [
    { accessorKey: 'id', header: 'id', ordenar: true },
    { accessorKey: 'fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'paciente.info_usuario.name', header: 'Paciente', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional' },
    { accessorKey: 'motivo', header: 'Motivo' },
    { accessorKey: 'servicio.name', header: 'Servicio',
      cell: ({ row }) => {
        const texto = row.original.servicio?.name || ''
        const limitado = texto.length > 20 ? texto.substring(0, 20) + '...' : texto
        return h('p', limitado)
      }
     },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')

            const color =
                estado === 'Realizada'
                    ? 'success'
                    : estado === 'inactiva'
                        ? 'neutral'
                        : estado === 'cancelada' ? 'error'
                            : 'neutral'

            return h(
                UBadge,
                { variant: 'subtle', color, class: 'capitalize' },
                () => estado
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
    const cita = row.original

    const acciones = [
        {
            type: 'label',
            label: 'Acciones'
        }
    ]

    if (cita.estado == 'Inactiva') {
        acciones.push(
            {
                label: 'Editar',
                onSelect() {
                    actualizarCita(cita)
                }
            },
            {
                label: 'Realizar',
                onSelect() {
                    activarCita(cita)
                }
            },
            {
                label: 'Eliminar',
                onSelect() {
                    cancelarCita(cita)
                }
            }
        )
    } else if (cita.estado == 'Realizada'){
        if (cita.id_analisis) {
            acciones.push({
                label: 'Ver historia clinica',
                icon: 'i-lucide-file-heart',
                onSelect() {
                    navigateTo(`/Historial/${cita.id_analisis}`)
                }
            })
        } else {
            acciones.push({
                label: 'Ver historia clinica',
                icon: 'i-lucide-file-heart',
                onSelect() {
                    navigateTo({ path: '/Historial', query: { paciente: cita.id_paciente } });
                }
            })
        }
        acciones.push({
            label: 'Ver Observacion',
            onSelect() {
                showObservacion(cita)
            }
        })
    } else if (cita.estado == 'cancelada'){
        acciones.push({
            label: 'Ver Observacion',
            onSelect() {
                showMotivoCancelacion(cita)
            }
        })
    }

    return acciones
}

function cargarcitasFiltradas (data) {
    citasScroll.value = JSON.parse(JSON.stringify(data))
}

const propiedadesTabla = computed(() => {
    const tabla = {
        titulo: 'Calendario de tu Agenda',
        llamadatos: llamadatos,
        data: citasScroll.value,
        agregar: puedePost ? agregarCita : null,
        cargarData: async (id, por_pagina) => {return await traerCitasPaginadas(id, por_pagina)},
        columns: columns,
        filtros: [
            { columna: 'servicio.name', placeholder: 'Servicio', options: filtros.value.servicios?.map(s => ({ label: s, value: s })), accion: 
                async(filtros) => { 
                    const data = await traerCitasFiltradas(filtros); 
                    cargarcitasFiltradas(data) 
                }
            },
            { columna: 'estado', placeholder: 'Estado', options: [{label: 'Realizada', value: 'Realizada'}, {label: 'Cancelada', value: 'cancelada'}, {label: 'Inactiva', value: 'inactiva'}], accion: async(filtros) => { const data = await traerCitasFiltradas(filtros); cargarcitasFiltradas(data) } },
            puedeVerTodosPacientes 
                ? { columna: 'profesional.info_usuario.name', placeholder: 'Profesional', options: filtros.value.medicos?.map(m => ({ label: m, value: m })), accion: async(filtros) => { const data = await traerCitasFiltradas(filtros); cargarcitasFiltradas(data) } } 
                : { columna: 'profesional.info_usuario.name', value: varView.getUser.name,  tipo: 'fixed'},

                { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes', accion: 
                async(filtros) => { 
                    const data = await traerCitasFiltradas(filtros); 
                    cargarcitasFiltradas(data)
                } 
            },
            { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año', options: filtros.value.años?.map(a => ({ text: String(a), value: a })), accion: async(filtros) => { const data = await traerCitasFiltradas(filtros); cargarcitasFiltradas(data) } },
        ],
    }
    
    if(varView.getRol === 'Profesional'){
        tabla.buttons = [
            { icon: 'lucide-table', accion: showFila, texto: 'En lista', color: 'primary', variant: 'subtle' },
        ]
    }

    return tabla
})

// console.log(propiedades)
</script>

<template>
    <div v-if="varView.getRol === 'Profesional'">
        <FondoDefault v-if="!varView.showEnFila && puedeVer" :key="refresh">
            <div class="md:pb-6 pb-4 flex md:flex-row flex-col gap-3 items-center justify-between">
                <div>
                    <h2 class="md:text-2xl text-xl font-semibold">Calendario de tu agenda</h2>
                    <div class="flex gap-2 items-center">
                        <i class="fa-solid fa-circle-info text-orange-600 dark:text-orange-200"></i>
                        <p class="text-orange-600 text-xs dark:text-orange-200 mt-1">Las citas se cargan al navegar entre los meses para mantener una experiencia rápida.</p>
                    </div>
                </div>

                <div class="flex gap-3 items-center cursor-pointer">
                    <UButton v-for="button in buttonsVista" :color="button.color" :icon="button.icon" :variant="button.variant"
                        @click="button.action">
                        <p class="hidden md:block">{{ button.text }}</p>
                    </UButton>
                </div>
            </div>

            <div :class="{
                'grid lg:grid-cols-[1.7fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-6 gap-3 h-1/2': varView.showCalendario,
                'grid grid-cols-1 gap-3': !varView.showCalendario
                }" class="my-2 mb-10">
                <MoleculesCalendarioCitas :Propiedades="{showTodas: false, citas: Citas}"></MoleculesCalendarioCitas>
                <MoleculesCalendario v-if="varView.showCalendario" :Propiedades="{citas: Citas}" :infoCitas="infoCitas"></MoleculesCalendario>
            </div>

            <div class="flex justify-end">
                <MetricasAgenda :infoCitas="infoCitas" class="w-1/2 mt-10"></MetricasAgenda>
            </div>
        </FondoDefault>
    </div>

    <FondoDefault v-if="(varView.showEnFila && puedeVer) || varView.getRol === 'Admin'">
        <TablaScroll :Propiedades="propiedadesTabla"/>
        <MetricasAgenda :infoCitas="infoCitas" class="mt-10"/>
    </FondoDefault>

    <Restringido v-if="!puedeVer"/>

    <Cita></Cita>
    <PDFServicio v-if="varView.showPDFServicio"></PDFServicio>
    <Historia v-if="varView.showNuevaHistoria" />
    <Transition v-if="showMensaje" name="fade-slide">
        <div 

        class="fixed top-9 left-8 z-50 flex items-center gap-3 px-4 py-2 
                rounded-lg shadow-lg bg-white dark:bg-gray-800 border 
                border-gray-200 dark:border-gray-700 animate-fadeIn"
        >
        <i class="fa-solid fa-info text-blue-500"></i>
        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
            Tienes: <span class="font-bold">{{ infoCitas?.citas_pendientes }}</span> citas pendientes
        </span>
        </div>
    </Transition>
</template>