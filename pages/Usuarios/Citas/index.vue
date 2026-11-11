<script setup>
import PDFServicio from '~/components/paginas/PDFServicio.vue'

import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { useCitaActions } from '~/composables/Entidades/Cita'
import { useMultiAutoRefresh } from '~/composables/useAutoRefresh'
import { traerCitasFiltradas, traerCitasPaginadas, traerFiltros } from '~/Core/Cita/GETCita'
import { badgeEstado } from '~/data/estadosCita'
import TablaScroll from '~/components/organism/Table/TablaScroll.vue'
import Restringido from '~/components/organism/NoEnviados/Restringido.vue'
import EncabezadoAgenda from '~/components/molecules/Calendario/EncabezadoAgenda.vue'
import CitasScroll from '~/components/molecules/Calendario/CitasScroll.vue'
import MiniCalendario from '~/components/molecules/Calendario/MiniCalendario.vue'

const varView = useVarView()
const { hasPermiso } = usePermisos()
const citasStore = useCitasStore()
const { showNuevaCita, showActualizarCita, showNuevaHistoria } = storeToRefs(varView)

const calendarioCitasStore = useCalendarioCitas()
const refresh = ref(1)
const tablaKey = ref(0)
const filtros = ref([])
const puedeVer = hasPermiso('Citas_view')
const puedePost = hasPermiso('Citas_post')
const puedeVerTodosPacientes = hasPermiso('ListaPacientes')
const showMensaje = ref(false)
const infoCitas = ref({})

// Vista inicial según preferencias del usuario
const preferencias = usePreferencias()
preferencias.cargar()

const esAdmin = computed(() => varView.getRol === 'Admin')

function resolverVistaInicial() {
    if (varView.getRol === 'Admin') return 'tabla'
    const guardada = preferencias.vistaInicial
    if (guardada === 'lista' || guardada === 'tabla') return 'tabla'
    if (guardada === 'calendario') return 'calendario'
    return 'scroll'
}

// ── Vista activa: scroll | calendario | tabla ──
const vista = ref(resolverVistaInicial())

// Cada vista se monta una sola vez; luego se alterna con v-show (0 llamadas, scroll y filtros intactos)
const montadas = reactive({ scroll: false, calendario: false, tabla: false })

// Scroll por vista: se guarda/restaura al alternar (el scroll lo maneja FondoDefault)
const fondoRef = ref(null)
const posicionesScroll = {}

watch(vista, (nueva, vieja) => {
    montadas[nueva] = true
    // Flags globales que consumen otros componentes (compatibilidad)
    varView.showEnFila = nueva === 'tabla'
    varView.showCalendario = nueva === 'calendario'

    const el = fondoRef.value?.$el
    if (el && vieja) posicionesScroll[vieja] = el.scrollTop
    if (el) {
        nextTick(() => {
            el.scrollTop = posicionesScroll[nueva] ?? 0
        })
    }
}, { immediate: true })

function cambiarVista(nueva) {
    if (esAdmin.value) return
    vista.value = nueva
    preferencias.set('agenda.vistaInicial', nueva)
}

// Mini calendario: filtro por día en la vista Scroll
const fechaSel = ref(null)      // ISO 'YYYY-MM-DD' | null
const miniAbierto = ref(false)  // acordeón móvil

function seleccionarDia(fechaISO) {
    fechaSel.value = fechaISO
}

function limpiarDia() {
    fechaSel.value = null
}

const fechaSelFormateada = computed(() => {
    if (!fechaSel.value) return ''
    const [a, m, d] = fechaSel.value.split('-')
    return `${d}/${m}/${a}`
})

// Citas de un día puntual (para la lista Scroll cuando hay día seleccionado)
async function citasDelDiaISO(iso) {
    const todas = await citasStore.citasPorRango(iso, iso)
    if (!Array.isArray(todas)) return []
    return todas.filter((cita) => {
        if (!cita.fecha) return false
        const inicio = cita.fecha
        const fin = cita.fechaHasta || cita.fecha
        if (cita.estado === 'Inactiva' && fin > inicio) {
            return iso >= inicio && iso <= fin
        }
        return inicio === iso
    })
}

const { fecha } = storeToRefs(calendarioCitasStore)
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

// Carga base: datos + catálogos (promesa compartida) + métricas (1 vez; solo tras CRUD se fuerza)
async function llamadatos(cambio) {
    await citasStore.citasHoy(true, cambio)
    filtros.value = await traerFiltros()
    infoCitas.value = await citasStore.infoCitas(!!cambio)
    tablaKey.value++
    varView.datosActualizados()
}
const cambioEnApi = computed(() => varView.cambioEnApi)

// Tras crear/editar/crear historia: refresca datos y métricas sin loader a pantalla completa
useMultiAutoRefresh([
    { showRef: showNuevaCita, fetchFn: () => llamadatos(true), refresh, cambioEnApi },
    { showRef: showActualizarCita, fetchFn: () => llamadatos(true), refresh, cambioEnApi },
    { showRef: showNuevaHistoria, fetchFn: () => llamadatos(true), refresh, cambioEnApi },
], { loader: 'suave' })

onMounted(async () => {
    if (puedeVer) {
        await llamadatos(false)
    }
    if (varView.getRol === 'Profesional') {
        showMensaje.value = true
        setTimeout(() => {
            showMensaje.value = false
        }, 3000)
    }
    // Rellenar fecha del formulario
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
});

const agregarCita = () => {
    varView.showNuevaCita = true
};

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
            const b = badgeEstado(row.original)
            return h(
                UBadge,
                { variant: b.variant, color: b.color, class: 'capitalize' },
                () => b.label
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
    return {
        titulo: 'Registro de citas',
        // llamadatos: llamadatos,
        data: citasScroll.value,
        // agregar: puedePost ? agregarCita : null,
        cargarData: async (id, por_pagina) => {return await traerCitasPaginadas(id, por_pagina)},
        refresco: refresh.value,
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
})
</script>

<template>
    <FondoDefault ref="fondoRef" v-if="puedeVer">
        <EncabezadoAgenda :vista="vista" :info-citas="infoCitas" :puede-agendar="puedePost"
            :puede-ver-selector="!esAdmin" :actualizando="varView.actualizando" @update:vista="cambiarVista"
            @agendar="agregarCita" @actualizar="llamadatos(true)" />

        <!-- ═══ Vista SCROLL: mini calendario + lista de citas ═══ -->
        <div v-if="montadas.scroll" v-show="vista === 'scroll'" class="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
            <div class="lg:sticky lg:top-4">
                <div class="lg:hidden mb-2">
                    <UButton block color="neutral" variant="soft" size="sm"
                        :icon="miniAbierto ? 'i-lucide-calendar-off' : 'i-lucide-calendar-days'"
                        :label="miniAbierto ? 'Ocultar calendario' : 'Mostrar calendario'"
                        @click="miniAbierto = !miniAbierto" />
                </div>
                <div :class="miniAbierto ? '' : 'hidden lg:block'">
                    <MiniCalendario @seleccion="seleccionarDia" />
                </div>
            </div>

            <div class="min-w-0">
                <div v-if="fechaSel" class="mb-2 flex items-center gap-2">
                    <UBadge color="primary" variant="soft" icon="i-lucide-calendar-check">
                        Citas del {{ fechaSelFormateada }}
                    </UBadge>
                    <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-x" label="Ver todas"
                        @click="limpiarDia" />
                </div>

                <CitasScroll :Propiedades="propiedadesTabla" :propiedadesCard="{ showTodas: false, citas: Citas }"
                    :tabla="false" :fecha-sel="fechaSel" :cargar-rango="citasDelDiaISO" @limpiar="limpiarDia" />
            </div>
        </div>

        <!-- ═══ Vista CALENDARIO: calendario protagonista + citas como contexto ═══ -->
        <div v-if="montadas.calendario" v-show="vista === 'calendario'"
            class="grid lg:grid-cols-[1.6fr_1fr] md:grid-cols-2 grid-cols-1 gap-4 items-start">
            <MoleculesCalendario :Propiedades="{ citas: Citas }" :infoCitas="infoCitas" />
            <MoleculesCalendarioCitas :Propiedades="{ showTodas: false, citas: Citas }" />
        </div>

        <!-- ═══ Vista TABLA: consulta administrativa ═══ -->
        <div v-if="montadas.tabla" v-show="vista === 'tabla'">
            <TablaScroll :key="tablaKey" :Propiedades="propiedadesTabla" />
        </div>

    </FondoDefault>

    <Restringido v-if="!puedeVer" />

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
