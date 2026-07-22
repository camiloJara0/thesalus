<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import ChartComponent from '~/components/molecules/Charts/ChartComponent.vue';
import Form from '~/components/organism/Forms/Form.vue';
import { onMounted, ref, computed } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { usePacientesStore } from '~/stores/Entidades/Paciente';
import { traerDashboard } from '~/Core/Empresa/Dashboard/GetDashboard';
import { usePermisosProfesionalBuilder } from '~/build/Empresa/usePermisosProfesional';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { useAutoRefresh } from '~/composables/useAutoRefresh';

const citasStore = useCitasStore();
const varView = useVarView();
const apiRest = useApiRest();
const storeProfesion = useDatosProfesionStore();
const pacienteStore = usePacientesStore()

const rol = ref(null);
const usuario = ref(null);
const Citas = ref([]);
const servicios = ref([]);
const ultimosPacientes = ref([]);
const pacientesList = ref([]);
const medicosList = ref([]);
const profesional = ref([]);
const dashboardData = ref({});
const showCita = ref(false);
const refresh = ref(1);
const secciones = ref([]);
const addPermisos = ref(false);
const notificaciones = ref([]);
const nombreProfesion = ref('');
const router = useRouter()

const chartData = ref([]);
const chartConfig = {
    categories: { Consultas: 'consultas', 'Pacientes Nuevos': 'pacientes' },
    index: 'dia',
    type: 'smooth',
    height: 200,
    xLabel: 'Día',
    yLabel: 'Cantidad',
};

const fechaActual = computed(() => {
    return new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});

const totalNotificaciones = computed(() => notificaciones.value.length);

useAutoRefresh({
    showRef: showCita,
    cambioEnApi: computed(() => varView.cambioEnApi),
    refresh,
    fetchFn: async () => {
        await apiRest.getData('Cita', 'citas');
    }
});

onMounted(async () => {
    varView.cargando = true;
    sessionStorage.removeItem('activeButton');
    sessionStorage.removeItem('seccionIdActivo');

    rol.value = varView.getRol;
    usuario.value = varView.getUser;

    let citas = [];
    let Historias = [];

    servicios.value = await apiRest.getData('Servicio', 'servicios');

    if (rol.value === 'Admin') {
        const historiaStore = useHistoriasStore();
        Historias = await historiaStore.ultimasHistorias();
        citas = await citasStore.listCitasHoy();

        const pacientesStore = usePacientesStore();
        pacientesList.value = await pacientesStore.traer();

        const profesionalesStore = useProfesionalStore();
        const profesionales = await profesionalesStore.traer();
        medicosList.value = profesionales;

        dashboardData.value = await traerDashboard();

        ultimosPacientes.value = Historias;
        Citas.value = citas;

        chartData.value = generarDatosGrafica();
        notificaciones.value = generarNotificacionesAdmin();
    } else if (rol.value === 'Profesional') {
        const pacientesStore = usePacientesStore();
        pacientesList.value = await pacientesStore.traer(true, true);

        const seccionesApp = await storeProfesion.traerSecciones();
        const permisos = await storeProfesion.traerPermisos(profesional.value.id_profesion);

        secciones.value = seccionesApp.filter(s => {
            return !permisos.includes(s.nombre) && !s.text.includes("Visualizar") && !s.text.includes("Ver");
        });

        const listCitas = await citasStore.listCitas();

        Citas.value = listCitas
            .filter((cita) => {
                return (
                    cita.id_medico === usuario.value.id_profesional &&
                    cita.estado === 'Inactiva'
                );
            })
            .slice(0, 5);

        notificaciones.value = generarNotificacionesProfesional();

        const store = useIndexedDBStore();
        store.almacen = 'Profesion';
        const profesiones = await store.leerdatos();
        const mapa = profesiones.reduce((acc, p) => { acc[p.id] = p.nombre; return acc; }, {});
        nombreProfesion.value = mapa[usuario.value.id_profesion] || '';
    }

    varView.cargando = false;
});

function generarDatosGrafica() {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return dias.map(dia => ({
        dia,
        consultas: Math.floor(Math.random() * 20) + 5,
        pacientes: Math.floor(Math.random() * 15) + 2,
    }));
}

function generarNotificacionesAdmin() {
    const notifs = [];
    const historiaStore = useHistoriasStore();
    const citasNotifStore = useCitasStore();
    const pacientesNotifStore = usePacientesStore();
    const profesionalesNotifStore = useProfesionalStore();

    if (historiaStore.NoEnviados?.length > 0) {
        notifs.push({
            tipo: 'warning',
            icono: 'fa-solid fa-cloud-arrow-up',
            mensaje: `${historiaStore.NoEnviados.length} historias clínicas pendientes de sincronización`,
        });
    }
    if (citasNotifStore.NoEnviados?.length > 0) {
        notifs.push({
            tipo: 'warning',
            icono: 'fa-solid fa-calendar-xmark',
            mensaje: `${citasNotifStore.NoEnviados.length} citas pendientes de sincronización`,
        });
    }
    if (pacientesNotifStore.NoEnviados?.length > 0) {
        notifs.push({
            tipo: 'warning',
            icono: 'fa-solid fa-user-clock',
            mensaje: `${pacientesNotifStore.NoEnviados.length} pacientes pendientes de sincronización`,
        });
    }
    if (profesionalesNotifStore.NoEnviados?.length > 0) {
        notifs.push({
            tipo: 'warning',
            icono: 'fa-solid fa-user-nurse',
            mensaje: `${profesionalesNotifStore.NoEnviados.length} profesionales pendientes de sincronización`,
        });
    }
    if (notifs.length === 0) {
        notifs.push({
            tipo: 'success',
            icono: 'fa-solid fa-circle-check',
            mensaje: 'Todos los datos están sincronizados correctamente',
        });
    }
    return notifs;
}

function generarNotificacionesProfesional() {
    const notifs = [];
    const historiaStore = useHistoriasStore();
    const citasNotifStore = useCitasStore();
    const pacientesNotifStore = usePacientesStore();

    if (historiaStore.NoEnviados?.length > 0) {
        notifs.push({
            tipo: 'warning',
            icono: 'fa-solid fa-cloud-arrow-up',
            mensaje: `${historiaStore.NoEnviados.length} historias clínicas pendientes de sincronización`,
        });
    }
    if (citasNotifStore.NoEnviados?.length > 0) {
        notifs.push({
            tipo: 'warning',
            icono: 'fa-solid fa-calendar-xmark',
            mensaje: `${citasNotifStore.NoEnviados.length} citas pendientes de sincronización`,
        });
    }
    if (pacientesNotifStore.NoEnviados?.length > 0) {
        notifs.push({
            tipo: 'warning',
            icono: 'fa-solid fa-user-clock',
            mensaje: `${pacientesNotifStore.NoEnviados.length} pacientes pendientes de sincronización`,
        });
    }
    if (notifs.length === 0) {
        notifs.push({
            tipo: 'success',
            icono: 'fa-solid fa-circle-check',
            mensaje: 'Todo sincronizado correctamente',
        });
    }
    return notifs;
}

function getNotifColor(tipo) {
    const colors = {
        warning: 'text-amber-500',
        danger: 'text-red-500',
        success: 'text-green-500',
        info: 'text-blue-500',
    };
    return colors[tipo] || 'text-gray-500';
}

function getVariacionColor(variacion) {
    if (variacion > 0) return 'text-green-600 dark:text-green-400';
    if (variacion < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500';
}

function getVariacionIcon(variacion) {
    if (variacion > 0) return 'fa-solid fa-arrow-up';
    if (variacion < 0) return 'fa-solid fa-arrow-down';
    return 'fa-solid fa-minus';
}

function formatHora(hora) {
    if (!hora || hora === '00:00:00') return '';
    return hora.substring(0, 5);
}

function formatearFechaCita(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}`;
    return fecha;
}

function nuevoPaciente() {
    pacienteStore.showNuevoPaciente = true;
}

function nuevaCita() {
    showCita.value = true;
    varView.showNuevaCita = true;
}

function buscarHistoria() {
    router.push('/Historial')
}

function irACitas() {
    router.push('/Usuarios/Citas')
}

function irAHistorial() {
    router.push('/Historial')
}

async function actualizarPermisos() {
    storeProfesion.Formulario.Profesion.id_profesional = profesional.value.id_profesional;
    addPermisos.value = true;
}

function cerrarPermisos() {
    addPermisos.value = false;
}

const propiedadesPermisos = computed(() => {
    if (rol.value !== 'Profesional') return null;
    return usePermisosProfesionalBuilder({
        storeId: 'AgregarPermisos',
        storePinia: 'Profesion',
        permisos: secciones.value,
        show: addPermisos,
        cerrar: cerrarPermisos,
    });
});
</script>

<template>
    <FondoDefault v-if="rol">
        <div class="dashboard-grid animate-fadeIn">

            <!-- MAIN CONTENT -->
            <div class="dashboard-main">

                <!-- WELCOME HEADER (Admin) -->
                <div v-if="rol === 'Admin'" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                            Bienvenido, {{ usuario?.name }}
                        </h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">{{ fechaActual }}</p>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 max-w-md">
                        Panel de administración del sistema de historias clínicas.
                    </p>
                </div>

                <!-- WELCOME BANNER (Profesional) -->
                <div v-if="rol === 'Profesional'">
                    <UCard>
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 class="text-xl font-bold">
                                    Bienvenid@, {{ usuario?.name?.toLowerCase() }}
                                </h1>
                                <p class="text-sm text-blue-900">
                                    Aquí encontrarás información acerca de tu agenda y pacientes
                                </p>
                            </div>
                            <UBadge
                                v-if="nombreProfesion"
                                color="primary"
                                variant="subtle"
                                icon="fa-solid fa-user-doctor"
                                class="w-fit"
                            >
                                {{ nombreProfesion }}
                            </UBadge>
                        </div>
                    </UCard>
                </div>

                <!-- KPI CARDS (Admin) -->
                <div v-if="rol === 'Admin'" class="dashboard-kpi">
                    <UCard class="hover:shadow-md transition-shadow duration-200">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                    Pacientes totales
                                </p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {{ (dashboardData?.pacientes?.total ?? 0).toLocaleString() }}
                                </p>
                                <div class="flex items-center gap-1 mt-2">
                                    <i
                                        :class="[getVariacionIcon(dashboardData?.pacientes?.variacion ?? 0), getVariacionColor(dashboardData?.pacientes?.variacion ?? 0)]"
                                        class="text-xs"
                                    />
                                    <span
                                        :class="getVariacionColor(dashboardData?.pacientes?.variacion ?? 0)"
                                        class="text-xs font-medium"
                                    >
                                        {{ Math.abs(dashboardData?.pacientes?.variacion ?? 0) }}%
                                    </span>
                                    <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">vs. mes anterior</span>
                                </div>
                            </div>
                            <div class="shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-users text-blue-600 dark:text-blue-400 text-lg" />
                            </div>
                        </div>
                    </UCard>

                    <UCard class="hover:shadow-md transition-shadow duration-200">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                    Consultas hoy
                                </p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {{ (dashboardData?.consultas?.total ?? 0).toLocaleString() }}
                                </p>
                                <div class="flex items-center gap-1 mt-2">
                                    <i
                                        :class="[getVariacionIcon(dashboardData?.consultas?.variacion ?? 0), getVariacionColor(dashboardData?.consultas?.variacion ?? 0)]"
                                        class="text-xs"
                                    />
                                    <span
                                        :class="getVariacionColor(dashboardData?.consultas?.variacion ?? 0)"
                                        class="text-xs font-medium"
                                    >
                                        {{ Math.abs(dashboardData?.consultas?.variacion ?? 0) }}%
                                    </span>
                                    <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">vs. mes anterior</span>
                                </div>
                            </div>
                            <div class="shrink-0 w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-file-medical text-green-600 dark:text-green-400 text-lg" />
                            </div>
                        </div>
                    </UCard>

                    <UCard class="hover:shadow-md transition-shadow duration-200">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                    Citas programadas
                                </p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {{ (dashboardData?.citas_programadas?.total ?? 0).toLocaleString() }}
                                </p>
                                <div class="flex items-center gap-1 mt-2">
                                    <i
                                        :class="[getVariacionIcon(dashboardData?.citas_programadas?.variacion ?? 0), getVariacionColor(dashboardData?.citas_programadas?.variacion ?? 0)]"
                                        class="text-xs"
                                    />
                                    <span
                                        :class="getVariacionColor(dashboardData?.citas_programadas?.variacion ?? 0)"
                                        class="text-xs font-medium"
                                    >
                                        {{ Math.abs(dashboardData?.citas_programadas?.variacion ?? 0) }}%
                                    </span>
                                    <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">vs. mes anterior</span>
                                </div>
                            </div>
                            <div class="shrink-0 w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-calendar-check text-primary-600 dark:text-primary-400 text-lg" />
                            </div>
                        </div>
                    </UCard>

                    <UCard class="hover:shadow-md transition-shadow duration-200">
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                    RIPS pendientes
                                </p>
                                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">7</p>
                                <div class="flex items-center gap-1 mt-2">
                                    <i class="fa-solid fa-arrow-down text-red-600 dark:text-red-400 text-xs" />
                                    <span class="text-xs font-medium text-red-600 dark:text-red-400">6%</span>
                                    <span class="text-xs text-gray-400 dark:text-gray-500 ml-1">vs. mes anterior</span>
                                </div>
                            </div>
                            <div class="shrink-0 w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-file-export text-amber-600 dark:text-amber-400 text-lg" />
                            </div>
                        </div>
                    </UCard>
                </div>

                <!-- CHART + CITAS (Admin) -->
                <div v-if="rol === 'Admin'" class="dashboard-chart-and-citas">
                    <!-- Próximas Citas -->
                    <UCard>
                        <template #header>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                                    Próximas Citas
                                </h3>
                                <UButton
                                    label="Ver Agenda"
                                    variant="link"
                                    size="xs"
                                    color="primary"
                                    @click="irACitas"
                                />
                            </div>
                        </template>
                        <div v-if="Citas.length" class="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 -mt-1">
                            <div
                                v-for="(cita, i) in Citas"
                                :key="i"
                                class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div class="shrink-0 w-14 text-center">
                                    <p class="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {{ formatHora(cita.hora) || (cita.fechaHasta ? cita.fechaHasta.substring(5, 11) : '') }}
                                    </p>
                                    <p class="text-[10px] text-gray-400">
                                        {{ formatearFechaCita(cita.fecha) }}
                                    </p>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {{ cita.paciente.info_usuario.name }}
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {{ cita.servicio.name }}
                                    </p>
                                </div>
                                <UBadge
                                    v-if="cita.motivo"
                                    color="blue"
                                    variant="subtle"
                                    size="xs"
                                    class="shrink-0"
                                >
                                    {{ cita.motivo.length > 15 ? cita.motivo.substring(0, 15) + '...' : cita.motivo }}
                                </UBadge>
                            </div>
                        </div>
                        <div v-else class="py-8 text-center text-gray-400 text-sm">
                            <i class="fa-regular fa-calendar-check text-2xl mb-2 block" />
                            No hay citas programadas
                        </div>
                    </UCard>
                    <!-- Activity Chart -->
                    <UCard>
                        <template #header>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                                    Tendencia de Actividad
                                </h3>
                                <span class="text-xs text-gray-400">Últimos 7 días</span>
                            </div>
                        </template>
                        <ChartComponent
                            v-if="chartData.length"
                            class="mt-10"
                            :Propiedades="{
                                datos: chartData,
                                title: '',
                                configuracion: chartConfig,
                            }"
                        />
                        <div v-else class="h-50 flex items-center justify-center text-gray-400 text-sm">
                            Cargando gráfica...
                        </div>
                    </UCard>

                </div>

                <!-- QUICK ACTIONS (Admin) -->
                <div v-if="rol === 'Admin'">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Acciones Rápidas
                    </h3>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button
                            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                            @click="nuevoPaciente"
                        >
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-user-plus text-blue-600 dark:text-blue-400 text-sm" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">Nuevo Paciente</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">Registrar paciente</p>
                            </div>
                        </button>

                        <button
                            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                            @click="buscarHistoria"
                        >
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-magnifying-glass text-green-600 dark:text-green-400 text-sm" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">Buscar Historia</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">Historia clínica</p>
                            </div>
                        </button>

                        <button
                            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                            @click="nuevaCita"
                        >
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-calendar-plus text-primary-600 dark:text-primary-400 text-sm" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">Agendar Cita</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">Nueva consulta</p>
                            </div>
                        </button>

                        <button
                            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                        >
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-download text-amber-600 dark:text-amber-400 text-sm" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">Exportar RIPS</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">Generar reporte</p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- AGENDA HOY (Profesional) -->
                <div v-if="rol === 'Profesional'">
                    <UCard>
                        <template #header>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                                    Agenda de Hoy
                                </h3>
                                <UBadge color="blue" variant="subtle" size="sm">
                                    {{ Citas.length }} citas
                                </UBadge>
                            </div>
                        </template>
                        <div v-if="Citas.length" class="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 -mt-1">
                            <div
                                v-for="(cita, i) in Citas"
                                :key="i"
                                class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div class="shrink-0 w-14 text-center">
                                    <p class="text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {{ formatHora(cita.hora) || (cita.fechaHasta ? cita.fechaHasta.substring(5, 11) : '') }}
                                    </p>
                                    <p class="text-[10px] text-gray-400">
                                        {{ formatearFechaCita(cita.fecha) }}
                                    </p>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {{ cita.paciente.info_usuario.name }}
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {{ cita.servicio.name }}
                                    </p>
                                </div>
                                <UBadge
                                    v-if="cita.motivo"
                                    color="blue"
                                    variant="subtle"
                                    size="xs"
                                    class="shrink-0"
                                >
                                    {{ cita.motivo.length > 15 ? cita.motivo.substring(0, 15) + '...' : cita.motivo }}
                                </UBadge>
                            </div>
                        </div>
                        <div v-else class="py-8 text-center text-gray-400 text-sm">
                            <i class="fa-regular fa-calendar-check text-2xl mb-2 block" />
                            No tienes citas programadas para hoy
                        </div>
                    </UCard>
                </div>

                <!-- QUICK ACTIONS (Profesional) -->
                <div v-if="rol === 'Profesional'">
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Acciones Rápidas
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                            @click="nuevaCita"
                        >
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-calendar-plus text-blue-600 dark:text-blue-400 text-sm" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">Agendar Cita</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">Nueva consulta médica</p>
                            </div>
                        </button>

                        <button
                            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                            @click="buscarHistoria"
                        >
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-users text-green-600 dark:text-green-400 text-sm" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">Pacientes</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">Información de pacientes</p>
                            </div>
                        </button>

                        <button
                            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
                            @click="actualizarPermisos"
                        >
                            <div class="shrink-0 w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                <i class="fa-solid fa-file-shield text-amber-600 dark:text-amber-400 text-sm" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">Solicitar Permisos</p>
                                <p class="text-xs text-gray-400 dark:text-gray-500 truncate">Permisos temporales</p>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- PACIENTES RECIENTES (Admin) -->
                <div v-if="rol === 'Admin'">
                    <UCard>
                        <template #header>
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                                    Pacientes Recientes
                                </h3>
                                <UButton
                                    label="Ver Todos"
                                    variant="link"
                                    size="xs"
                                    color="primary"
                                    @click="irAHistorial"
                                />
                            </div>
                        </template>
                        <div v-if="ultimosPacientes.length" class="flex flex-col divide-y divide-gray-100 dark:divide-gray-700 -mt-1">
                            <div
                                v-for="(paciente, i) in ultimosPacientes"
                                :key="i"
                                class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                            >
                                <div class="shrink-0 w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                    <i class="fa-solid fa-user text-blue-600 dark:text-blue-400 text-xs" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {{ paciente.paciente }}
                                    </p>
                                    <p class="text-xs text-gray-400 dark:text-gray-500">
                                        {{ paciente.cedula }}
                                    </p>
                                </div>
                                <span class="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                    {{ paciente.fecha_historia }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="py-8 text-center text-gray-400 text-sm">
                            <i class="fa-regular fa-user text-2xl mb-2 block" />
                            No hay pacientes recientes
                        </div>
                    </UCard>
                </div>
            </div>

        </div>

        <!-- MODALS / FORMS -->
        <Paciente/>
        <Cita v-if="varView.showNuevaCita" />
        <Form v-if="propiedadesPermisos" :Propiedades="propiedadesPermisos" />
    </FondoDefault>
</template>
