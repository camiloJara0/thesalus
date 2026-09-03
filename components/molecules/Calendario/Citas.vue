<script setup>
import { useCalendarioCitas } from '~/stores/Calendario.js'
import { computed, ref } from 'vue';
import { nombresMeses } from '~/data/Fechas.js'
import { storeToRefs } from 'pinia';
import Card from './Card.vue';
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { useOrdenamiento } from "~/composables/Tabla/useDatosOrdenadosTabla";
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';

const props = defineProps({
    citas: {
        type: Array,
        default: () => []
    },
    Propiedades: {
        type: [Array, Object],
        default: () => []
    }
});

const varView = useVarView();
const citasStore = useCitasStore()
const calendarioCitasStore = useCalendarioCitas();
const showFiltros = ref(false)

const { Citas } = storeToRefs(citasStore)

const {
    fechaActual,
    fecha,
    dias,
    meses,
} = storeToRefs(calendarioCitasStore);

const columnas = [
    { columna: 'servicio.name', placeholder: 'Servicio',},
    { columna: 'estado', placeholder: 'Estado' },
    { columna: 'profesional.info_usuario.name', placeholder: 'Profesional',},
    { columna: 'paciente.info_usuario.name', placeholder: 'Paciente',},
    { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
    { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año', },
]

const columnasPendientes = [
    { columna: 'servicio.name', placeholder: 'Servicio' },
    { columna: 'profesional.info_usuario.name', placeholder: 'Profesional' },
    { columna: 'paciente.info_usuario.name', placeholder: 'Paciente' },
]

const columns = [
    { accessorKey: 'id', header: 'id', ordenar: true },
    { accessorKey: 'fecha', header: 'Fecha', ordenar: true },
    { accessorKey: 'paciente.info_usuario.name', header: 'Paciente', ordenar: true },
    { accessorKey: 'profesional.info_usuario.name', header: 'Profesional' },
    { accessorKey: 'motivo', header: 'Motivo' },
    { accessorKey: 'servicio.name', header: 'Servicio' },
    {
        accessorKey: 'estado',
        header: 'Estado',
    }
]

// Citas filtradas segun dia seleccionado
const citasFiltradas = computed(() => {
    const citas = JSON.parse(JSON.stringify(Citas.value))
    return citas?.filter(cita => {
        if (!cita.fecha || cita.estado === 'cancelada') return false;

        const fechaInicio = new Date(cita.fecha);
        const fechaFin = cita.fechaHasta ? new Date(cita.fechaHasta) : null;
        const fechaSeleccionada = new Date(fecha.value.split('/').reverse().join('-'));

        if (fechaFin) {
            if (cita.estado === 'Inactiva' && fecha.value === fechaActual.value) {
                return fechaSeleccionada >= fechaInicio && fechaSeleccionada <= fechaFin;
            } else {
                return fechaSeleccionada.getTime() === fechaInicio.getTime();
            }
        } else {
            return fechaSeleccionada.getTime() === fechaInicio.getTime();
        }
    });
});

// Pendientes
const pendientes = computed(() => {
    return Citas.value?.filter(cita => {
        if (!cita.fecha) return false;
        const fechaInicio = new Date(cita.fecha);
        const fechaActualDate = new Date(fechaActual.value.split('/').reverse().join('-'));
        return fechaInicio < fechaActualDate && cita.estado === 'Inactiva';
    }) ?? [];
});

// Nombre del mes
const mes = computed(() => {
    const [dia, mes, anio] = fecha.value.split('/').map(Number);
    return nombresMeses[mes - 1]
});

// Ordenamiento para citas del dia
const {
    busqueda,
    filtros,
    filtrosConOpciones,
    sortedItems,
    datosOrdenados,
    columnaOrden,
    menorAMayor,
    borrarFiltros
} = useOrdenamiento(citasFiltradas || ref([]), columnas, [], columns);

// Ordenamiento para pendientes
const {
    busqueda: busquedaPendientes,
    filtros: filtrosPendientes,
    filtrosConOpciones: filtrosConOpcionesPendientes,
    datosOrdenados: datosPendientes,
    columnaOrden: columnaOrdenPendientes,
    borrarFiltros: borrarFiltrosPendientes
} = useOrdenamiento(pendientes || ref([]), columnasPendientes, [], columns);

const hayFiltrosActivos = computed(() =>
    busqueda.value !== '' || Object.values(filtros.value).some(v => v !== '') || columnaOrden.value
);

const hayFiltrosActivosPendientes = computed(() =>
    busquedaPendientes.value !== '' || Object.values(filtrosPendientes.value).some(v => v !== '') || columnaOrdenPendientes.value
);

</script>

<template>

    <!--Citas  -->
    <div ref="contenedorCitas" :class="props.Propiedades.estilos"
        class="pb-5 flex flex-col gap-3 shadow-md rounded-xl md:h-[64vh] h-[50vh] overflow-y-auto bg-white dark:bg-gray-700 scrollForm relative">
        <div v-if="!props.Propiedades.showTodas"
            class="flex justify-between items-center px-6 py-3 sticky top-0 bg-white dark:bg-gray-700 shadow-xs z-3">
            <p class="text-xl font-semibold">
                {{ calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}
            </p>

            <UButton icon="i-lucide-filter" :color="showFiltros? 'primary': 'neutral'" variant="soft" @click="showFiltros = !showFiltros">Filtrar</UButton>
        </div>

        <UTabs v-if="fecha === fechaActual" class="px-4" :items="[
            {
                label: 'Actuales',
                slot: 'actuales',
                icon: 'i-lucide-calendar-clock'
            },
            {
                label: 'Pendientes ' + pendientes.length.toLocaleString('es-ES'),
                slot: 'pendientes',
                icon: 'i-lucide-clock'
            }
        ]">

            <template #actuales>
                <div v-if="showFiltros" class="w-full pt-3 pb-1 flex justify-between md:flex-row flex-col">
                    <!-- Buscador y acciones -->
                    <div class="flex items-center gap-2">
                        <UInput v-model="busqueda" placeholder="Buscar por paciente, servicio..." icon="lucide-search"
                            variant="outline" size="sm" class="flex-1" />
                        <UButton size="sm" icon="i-lucide-x" variant="soft" color="error" v-if="hayFiltrosActivos" @click="borrarFiltros" />
                    </div>

                    <!-- Filtros por columna -->
                    <div class="flex flex-wrap gap-2">
                        <USelect v-for="(filtro, key) in filtrosConOpciones.slice(0, 3)" :key="key"
                            v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                            :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos]"
                            size="sm" class="w-full sm:w-auto sm:min-w-35" />
                    </div>
                </div>

                <div class="grid gap-2 mt-2"
                    :class="{ 'xl:grid-cols-3 lg:grid-cols-2': varView.showEnFila || !varView.showCalendario, 'xl:grid-cols-2 lg:grid-cols-1': !varView.showEnFila }">
                    <!-- Card Citas -->

                    <template v-if="!unref(props.Propiedades.citas)">
                        <div v-for="i in 2" :key="i" :class="Propiedades.tamaño"
                            class="w-full p-4 shadow-md bg-white dark:bg-gray-700 flex flex-col gap-4 animate-pulse">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <div class="flex flex-col gap-2">
                                    <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    <div class="w-20 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <div class="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                <div class="w-3/4 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                            </div>
                            <div class="flex gap-2 pt-2">
                                <div class="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                <div class="w-16 h-6 bg-gray-200 dark:bg-gray-500 rounded-full"></div>
                            </div>
                        </div>
                    </template>

                    <Card v-for="cita in datosOrdenados" :cita="cita" :Propiedades="props.Propiedades"></Card>
                </div>
            </template>

            <template #pendientes>
                <!-- Buscador y acciones pendientes -->
                <div v-if="showFiltros" class="w-full pt-3 pb-1 flex justify-between md:flex-row flex-col">
                    <div class="flex items-center gap-2">
                        <UInput v-model="busquedaPendientes" placeholder="Buscar pendiente..." icon="lucide-search"
                            variant="outline" size="sm" class="flex-1" />
                        <UButton size="sm" icon="i-lucide-x" variant="soft" color="error" v-if="hayFiltrosActivos" @click="borrarFiltros" />
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <USelect v-for="(filtro, key) in filtrosConOpcionesPendientes" :key="key"
                            v-model="filtrosPendientes[filtro.columna]" :placeholder="filtro.placeholder"
                            :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos]"
                            size="sm" class="w-full sm:w-auto sm:min-w-35" />
                    </div>
                </div>

                <!-- Citas Pendientes -->
                <div class="grid gap-2 mt-2"
                    :class="{ 'xl:grid-cols-3 lg:grid-cols-2': varView.showEnFila || !varView.showCalendario, 'xl:grid-cols-2 lg:grid-cols-1': !varView.showEnFila }">
                    <Card v-for="cita in datosPendientes" :cita="cita" :Propiedades="props.Propiedades"></Card>
                </div>

                <div v-if="!datosPendientes?.length" class="w-full py-8 flex justify-center">
                    <p class="text-sm text-gray-400 dark:text-gray-500">No hay citas pendientes.</p>
                </div>
            </template>

        </UTabs>

        <div v-else class="grid gap-2 p-4"
            :class="{ 'xl:grid-cols-3 lg:grid-cols-2': varView.showEnFila || !varView.showCalendario, 'xl:grid-cols-2 lg:grid-cols-1': !varView.showEnFila }">
            <Card v-for="cita in datosOrdenados" :cita="cita" :Propiedades="props.Propiedades"></Card>
        </div>

        <div v-if="datosOrdenados?.length < 1 && fecha === fechaActual" class="w-full py-8 flex justify-center">
            <h2 class="text-lg text-gray-500">No hay citas programadas.</h2>
        </div>

    </div>

</template>