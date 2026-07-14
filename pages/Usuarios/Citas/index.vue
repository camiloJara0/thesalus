<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'
import PDFServicio from '~/components/paginas/PDFServicio.vue'

import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/CalendarioBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { ref, onMounted } from 'vue'
import { CardBuilder } from '~/build/Constructores/CardBuilder'
import { storeToRefs } from 'pinia'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import TablaNuxt from '~/components/organism/Table/TablaNuxt.vue'
import { useCitaActions } from '~/composables/Entidades/Cita'
import { traerCitasPaginadas, traerFiltros } from '~/Core/Cita/GETCita'
import { useInfiniteScroll } from '@vueuse/core'
import TablaScroll from '~/components/organism/Table/TablaScroll.vue'
import Restringido from '~/components/organism/NoEnviados/Restringido.vue'

const varView = useVarView()
const citasStore = useCitasStore();

const calendarioCitasStore = useCalendarioCitas();
const show = ref(false);
const refresh = ref(1);
const filtros = ref([])
const puedeVer = varView.getPermisos.includes('Citas_view');
const puedeGet = varView.getPermisos.includes('Citas_get');
const puedePost = varView.getPermisos.includes('Citas_post')

const {
    fecha,
    meses,
    fechaActual
} = storeToRefs(calendarioCitasStore);

const { Citas } = storeToRefs(citasStore)

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
// Watch para actualizar citas al agregar nueva
watch(() => varView.showNuevaCita,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
        }
    }
);

watch(() => varView.showActualizarCita,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
            refresh.value++;
        }
    }
);

watch(() => varView.showNuevaHistoria,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
        }
    }
);

onMounted(async () => {
    await citasStore.citasHoy(false)
    filtros.value = await traerFiltros()
    // Rellenar fecha del formulario
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
});

// Funciones para manejar la visibilidad de los formularios
const agregarCita = () => {
    show.value = true
    varView.showNuevaCita = true
};

// Funciones para manejar visibilidad de Pagina
const showFila = () => {
    citasStore.contexto = 'Tabla'
    varView.showEnFila = !varView.showEnFila
};

const showCalendario = () => {
    varView.showCalendario = !varView.showCalendario
};

// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {

    const builderCitas = new CitasBuilder()
    const pagina = new ComponenteBuilder()

    if (!puedeVer && !puedePost && !puedeGet) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
                .setCards(
                    [
                        {
                            header: {
                                html: `<div class="flex flex-col items-center justify-center h-full text-gray-500">
                                <i class="fa-solid fa-user-lock text-6xl mb-4"></i>
                                <h2 class="text-lg font-semibold">Acceso restringido</h2>
                                <p class="text-sm text-center">
                                    No tienes permisos para acceder a este módulo.
                                </p>
                                </div>`,
                            },
                        },
                        {

                        },
                        {

                        }
                    ]
                )
                .setcontenedorCards('flex flex-col')
                .setContenedor('w-full')
                .setTamaño('flex sm:flex-row justify-center items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Agenda de citas.')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }


    pagina
        .setFondo('FondoDefault')
    if (!varView.showEnFila) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de tu Agenda',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'En Lista', icon: 'i-lucide-table', color: 'neutral', action: showFila },
                    { text: 'Calendario', icon: 'i-lucide-calendar', color: varView.showCalendario ? 'primary' : 'neutral', action: showCalendario },
                    puedePost ? { text: 'Agendar', icon: 'i-lucide-plus', color: 'primary', action: agregarCita } : '',
                    { text: '', icon: 'i-lucide-cloud-sync', color: 'primary', variant: 'soft', action: () => { llamadatos(true) } },
                ]
            })
            .addComponente('Citas', builderCitas
                .setCitas(Citas)
                .setShowTodas(false)
                .setFiltros([
                    { columna: 'servicio', placeholder: 'Servicio', },
                    { columna: 'estado', placeholder: 'Estado', },
                    { columna: 'fecha', placeholder: 'Mes', tipo: 'mes' }
                ])
            )
        if (varView.showCalendario) {
            pagina
                .setContenedor('grid lg:grid-cols-[1.7fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-6 gap-3')
                .addComponente('Calendario', builderCalendario
                    .setCitas(Citas)
                )
        } else {
            pagina
                .setContenedor('grid grid-cols-1 gap-3')
        }
    }

    return pagina.build()
})

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

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Calendario de tu Agenda',
        llamadatos: llamadatos,
        data: Citas,
        agregar: puedePost ? agregarCita : null,
        cargarData: traerCitasPaginadas,
        columns: columns,
        filtros: [
            { columna: 'servicio.name', placeholder: 'Servicio', options: filtros.value.servicios?.map(s => ({ label: s, value: s })), accion: async(filtros) => { await citasStore.citasFiltradas(filtros) } },
            { columna: 'estado', placeholder: 'Estado', accion: async(filtros) => { await citasStore.citasFiltradas(filtros) } },
            { columna: 'profesional.info_usuario.name', placeholder: 'Profesional', options: filtros.value.medicos?.map(m => ({ label: m, value: m })), accion: async(filtros) => { await citasStore.citasFiltradas(filtros) } },
            { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes', accion: async(filtros) => { await citasStore.citasFiltradas(filtros)} },
            { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año', options: filtros.value.años?.map(a => ({ text: String(a), value: a })), accion: async(filtros) => { await citasStore.citasFiltradas(filtros) } },
        ],
        buttons: [
            { icon: 'lucide-table', accion: showFila, texto: 'En lista', color: 'primary', variant: 'subtle' },
        ],
    }
})

// console.log(propiedades)
</script>

<template>
    <Pagina v-if="!varView.showEnFila && puedeVer" :Propiedades="propiedades" :key="refresh" />
    <FondoDefault v-show="varView.showEnFila && puedeVer">
        <TablaScroll :Propiedades="propiedadesTabla"/>
    </FondoDefault>
    <Restringido v-if="!puedeVer"/>
    <Cita></Cita>
    <PDFServicio v-if="varView.showPDFServicio"></PDFServicio>
    <Historia v-if="varView.showNuevaHistoria" />
</template>