<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Restringido from '~/components/organism/NoEnviados/Restringido.vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { formatDate } from '~/composables/Formulario/FormatearFecha';
import { decryptData } from '~/composables/Formulario/crypto';
import { mensajeErrorApi, descripcionErrorRed } from '~/composables/Formulario/erroresApi';
import { badgeEstado } from '~/data/estadosCita';

const route = useRoute();
const config = useRuntimeConfig();
const { hasPermiso } = usePermisos();
const puedeVer = hasPermiso('Citas_view');

const cita = ref(null);
const cargando = ref(true);
const errorCarga = ref('');
const errorTitulo = ref('');

const LABEL_ACCION = {
    creada: { texto: 'Cita creada', icono: 'i-lucide-plus-circle', color: 'text-blue-500' },
    editada: { texto: 'Cita editada', icono: 'i-lucide-pen-line', color: 'text-amber-500' },
    cancelada: { texto: 'Cita cancelada', icono: 'i-lucide-x-circle', color: 'text-red-500' },
    realizada: { texto: 'Cita realizada', icono: 'i-lucide-check-circle-2', color: 'text-green-500' },
};

const LABEL_ESTADO = {
    Inactiva: 'Pendiente',
    Realizada: 'Finalizada',
    cancelada: 'Cancelada',
};

const paciente = computed(() => cita.value?.paciente || null);
const infoPaciente = computed(() => paciente.value?.info_usuario || null);
const profesional = computed(() => cita.value?.profesional || null);
const infoProfesional = computed(() => profesional.value?.info_usuario || null);
const servicio = computed(() => cita.value?.servicio || null);
const analisis = computed(() => cita.value?.analisis || null);
const auditorias = computed(() => cita.value?.auditorias || []);

const estadoActual = computed(() => cita.value ? badgeEstado(cita.value) : null);

function calcularEdad(nacimiento) {
    if (!nacimiento) return '';
    const fecha = new Date(nacimiento);
    if (isNaN(fecha.getTime())) return '';
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
    return `${edad} años`;
}

const edadPaciente = computed(() => calcularEdad(infoPaciente.value?.nacimiento));

function formatFechaHora(dt) {
    if (!dt) return null;
    const d = new Date(dt);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

// ── Auditoría: creación y modificaciones ──
const auditoriaCreacion = computed(() => {
    const fila = auditorias.value.find(a => a.accion === 'creada');
    // Citas anteriores a la auditoría: no existe registro de usuario
    if (fila) return fila;
    return cita.value?.created_at ? { accion: 'creada', created_at: cita.value.created_at, usuario: null, detalle: null } : null;
});

const auditoriaEdicion = computed(() => {
    const ediciones = auditorias.value.filter(a => a.accion === 'editada');
    if (!ediciones.length) return null;
    return ediciones[ediciones.length - 1]; // solo se conserva el último motivo
});

const auditoriaCancelacion = computed(() => {
    const filas = auditorias.value.filter(a => a.accion === 'cancelada');
    if (!filas.length) return null;
    return filas[filas.length - 1];
});

// ── Historial de estados (fecha, hora y usuario por cambio) ──
const historialEstados = computed(() => {
    const cambios = auditorias.value
        .filter(a => a.estado_nuevo)
        .map(a => ({
            estado: a.estado_nuevo,
            fecha: a.created_at,
            usuario: a.usuario,
            detalle: a.detalle,
        }));

    if (cambios.length) return cambios;

    // Fallback para citas sin auditoría registrada (anteriores a la funcionalidad)
    if (cita.value?.estado) {
        return [{
            estado: cita.value.estado,
            fecha: cita.value.created_at || null,
            usuario: null,
            detalle: 'Sin historial de estados (registro anterior a la auditoría)',
        }];
    }

    return [];
});

async function cargarCita() {
    cargando.value = true;
    errorCarga.value = '';
    errorTitulo.value = '';
    try {
        const token = decryptData(localStorage.getItem('token'));
        const res = await fetch(
            `${config.public.api}/${config.public.citaDetalle}/${route.params.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!res.ok) {
            let errorData;
            try { errorData = await res.json(); } catch { errorData = null; }
            const { titulo, texto } = mensajeErrorApi(res.status, errorData, 'No fue posible cargar la cita. Intente nuevamente.');
            errorTitulo.value = titulo;
            errorCarga.value = texto;
            return;
        }

        const json = await res.json();
        if (json?.success && json.data) {
            cita.value = json.data;
        } else {
            errorTitulo.value = 'Cita no disponible';
            errorCarga.value = 'No fue posible cargar la cita. Intente nuevamente.';
        }
    } catch (e) {
        console.error('Error cargando detalle de cita:', e);
        const descripcion = descripcionErrorRed(e, 'la API');
        errorTitulo.value = descripcion?.titulo || 'Cita no disponible';
        errorCarga.value = descripcion?.texto || 'No fue posible cargar la cita. Intente nuevamente.';
    } finally {
        cargando.value = false;
    }
}

onMounted(cargarCita);

function irAAgenda() {
    navigateTo('/Usuarios/Citas');
}

function irAAnalisis() {
    if (!cita.value?.id_analisis) return;
    navigateTo(`/Historial/${cita.value.id_analisis}`);
}

function irAHistorialPaciente() {
    if (!cita.value?.id_paciente) return;
    navigateTo({ path: '/Historial', query: { paciente: cita.value.id_paciente } });
}
</script>

<template>
    <FondoDefault v-if="puedeVer">
        <!-- Cargando -->
        <div v-if="cargando" class="flex justify-center items-center py-20">
            <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-blue-500" />
        </div>

        <!-- Error -->
        <div v-else-if="errorCarga" class="max-w-2xl mx-auto py-16">
            <UAlert icon="i-lucide-triangle-alert" color="error" variant="subtle"
                :title="errorTitulo" :description="errorCarga">
                <template #footer>
                    <UButton color="error" variant="soft" @click="irAAgenda">
                        <i class="fa-solid fa-arrow-left mr-2"></i>Volver a la agenda
                    </UButton>
                </template>
            </UAlert>
        </div>

        <!-- Contenido -->
        <div v-else-if="cita" class="space-y-4 max-w-7xl mx-auto pb-8">

            <!-- Encabezado -->
            <UCard class="bg-linear-to-r from-(--color-default-500) to-(--color-default-600) text-white shadow-lg border-0">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <button @click="irAAgenda" title="Volver a la agenda"
                            class="mt-1 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer shrink-0">
                            <i class="fa-solid fa-arrow-left"></i>
                        </button>
                        <div>
                            <p class="text-sm/none opacity-80">Agenda</p>
                            <h1 class="text-xl font-bold">Detalle de cita</h1>
                            <p class="text-sm opacity-90 mt-1">
                                Cita #{{ cita.id }}
                                <span v-if="cita.created_at" class="opacity-80">
                                    · {{ formatDate(cita.created_at) }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <UBadge :color="estadoActual?.color" :variant="estadoActual?.variant"
                            class="capitalize text-sm">
                            {{ estadoActual?.label }}
                        </UBadge>
                    </div>
                </div>
            </UCard>

            <div class="grid lg:grid-cols-3 gap-4">

                <!-- Paciente -->
                <UCard class="lg:col-span-1">
                    <template #header>
                        <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-user text-blue-500"></i>Información del paciente
                        </h2>
                    </template>
                    <div class="space-y-2 text-sm">
                        <div>
                            <p class="text-gray-400 text-xs">Nombre</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ infoPaciente?.name || '—' }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <p class="text-gray-400 text-xs">Documento</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.No_document || '—' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Tipo</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.type_doc || '—' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Edad</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">{{ edadPaciente || '—' }}</p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Celular</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.celular || '—' }}
                                </p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <p class="text-gray-400 text-xs">Municipio</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.municipio || '—' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Barrio</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.barrio || '—' }}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">EPS</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ paciente?.eps?.nombre || '—' }}
                            </p>
                        </div>
                        <button v-if="cita.id_paciente" @click="irAHistorialPaciente"
                            class="text-xs text-blue-500 hover:text-blue-700 font-medium cursor-pointer">
                            Ver historial del paciente <i class="fa-solid fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </UCard>

                <!-- Detalle de la cita -->
                <UCard class="lg:col-span-2">
                    <template #header>
                        <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-calendar-day text-green-500"></i>Detalle de la cita
                        </h2>
                    </template>
                    <div class="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p class="text-gray-400 text-xs">Servicio</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ servicio?.name || '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Profesional</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ infoProfesional?.name || '—' }}
                            </p>
                            <p class="text-xs text-gray-400">
                                {{ infoProfesional?.No_document || '' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">ID análisis asociado</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ cita.id_analisis ? `HC-${cita.id_analisis}` : 'Sin asociar' }}
                            </p>
                        </div>

                        <div>
                            <p class="text-gray-400 text-xs">Fecha</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ cita.fecha ? formatDate(cita.fecha) : '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Hora</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ cita.hora && cita.hora !== '00:00:00' ? cita.hora : '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Fecha hasta (rango)</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ cita.fechaHasta ? formatDate(cita.fechaHasta) : 'Sin rango' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Motivo</p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                                {{ cita.motivo || '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Plantilla</p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                                {{ servicio?.plantilla || '—' }}
                            </p>
                        </div>

                        <div v-if="cita.estado === 'cancelada'" class="md:col-span-3 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                            <p class="text-gray-400 text-xs">Motivo de cancelación</p>
                            <p class="text-gray-800 dark:text-gray-100">
                                {{ cita.motivo_cancelacion || 'Sin motivo registrado' }}
                            </p>
                        </div>

                        <div v-if="cita.motivo_edicion" class="md:col-span-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                            <p class="text-gray-400 text-xs">Motivo de la última edición</p>
                            <p class="text-gray-800 dark:text-gray-100">
                                {{ cita.motivo_edicion }}
                            </p>
                            <p v-if="auditoriaEdicion" class="text-xs text-gray-400 mt-1">
                                Editada por: {{ auditoriaEdicion.usuario || '—' }} ·
                                {{ formatFechaHora(auditoriaEdicion.created_at) }}
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Realización de la cita -->
            <UCard v-if="cita.estado === 'Realizada' && cita.id_analisis">
                <template #header>
                    <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <i class="fa-solid fa-clipboard-check text-teal-500"></i>Realización de la cita
                    </h2>
                </template>

                <!-- Con análisis asociado -->
                <div class="space-y-3 text-sm">
                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <p class="text-gray-400 text-xs">Registro clínico</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">HC-{{ analisis?.id || cita.id_analisis }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Motivo del análisis</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ analisis?.motivo || '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Fecha del registro</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ analisis?.created_at ? formatDate(analisis.created_at) : '—' }}
                            </p>
                        </div>
                    </div>
                    <div v-if="analisis?.tipoAnalisis">
                        <p class="text-gray-400 text-xs">Estado clínico</p>
                        <p class="font-medium text-gray-800 dark:text-gray-100">{{ analisis.tipoAnalisis }}</p>
                    </div>
                    <UButton color="neutral" variant="soft" class="text-blue-700" @click="irAAnalisis">
                        <i class="fa-solid fa-file-heart mr-2"></i>Ver análisis realizado
                    </UButton>
                </div>

                <!-- Sin análisis asociado -->
                <!-- <UAlert v-else icon="i-lucide-info" color="warning" variant="subtle"
                    title="Cita realizada sin análisis asociado"
                    description="Esta cita fue marcada como realizada, pero no tiene un registro clínico vinculado." /> -->
            </UCard>

            <!-- Auditoría e historial de estados -->
            <div class="grid md:grid-cols-2 gap-4">

                <!-- Historial de estados -->
                <UCard>
                    <template #header>
                        <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-arrows-rotate text-purple-500"></i>Historial de estados
                        </h2>
                    </template>

                    <ol v-if="historialEstados.length" class="space-y-4 text-sm">
                        <li v-for="(cambio, i) in historialEstados" :key="i"
                            class="flex gap-3 items-start relative">
                            <div class="flex flex-col items-center">
                                <span class="w-2.5 h-2.5 rounded-full bg-(--color-default-500) mt-1.5"></span>
                                <span v-if="i < historialEstados.length - 1"
                                    class="w-px flex-1 bg-gray-200 dark:bg-gray-700 absolute top-5 -bottom-5 left-1"></span>
                            </div>
                            <div class="pb-1">
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ LABEL_ESTADO[cambio.estado] || cambio.estado }}
                                </p>
                                <p class="text-xs text-gray-400">
                                    {{ cambio.fecha ? formatFechaHora(cambio.fecha) : 'Fecha no registrada' }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    <i class="fa-solid fa-user text-[10px] mr-1"></i>
                                    {{ cambio.usuario || 'Usuario' }}
                                </p>
                            </div>
                        </li>
                    </ol>
                    <p v-else class="text-sm text-gray-400">Sin cambios de estado registrados</p>
                </UCard>

                <!-- Auditoría -->
                <UCard>
                    <template #header>
                        <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-clock-rotate-left text-gray-500"></i>Auditoría y trazabilidad
                        </h2>
                    </template>

                    <ol v-if="auditorias.length" class="space-y-4 text-sm">
                        <li v-for="(fila, i) in auditorias" :key="i" class="flex gap-3 items-start">
                            <UIcon :name="LABEL_ACCION[fila.accion]?.icono || 'i-lucide-circle'"
                                class="size-5 mt-0.5 shrink-0"
                                :class="LABEL_ACCION[fila.accion]?.color || 'text-gray-400'" />
                            <div>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ LABEL_ACCION[fila.accion]?.texto || fila.accion }}
                                </p>
                                <p class="text-xs text-gray-400">
                                    {{ fila.created_at ? formatFechaHora(fila.created_at) : '—' }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    <i class="fa-solid fa-user text-[10px] mr-1"></i>
                                    {{ fila.usuario || 'Usuario no registrado' }}
                                </p>
                                <p v-if="fila.detalle" class="text-xs text-gray-600 dark:text-gray-300 mt-1 bg-gray-50 dark:bg-gray-800/60 rounded px-2 py-1">
                                    {{ fila.detalle }}
                                </p>
                            </div>
                        </li>
                    </ol>

                    <!-- Fallback para citas sin auditoría -->
                    <div v-else class="space-y-3 text-sm">
                        <p class="text-xs text-gray-400 italic">
                            Sin auditoría registrada (cita anterior a la activación de trazabilidad)
                        </p>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <p class="text-gray-400 text-xs">Creación (fecha de registro)</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ cita.created_at ? formatFechaHora(cita.created_at) : '—' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Última modificación</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ cita.updated_at ? formatFechaHora(cita.updated_at) : '—' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>

        </div>
    </FondoDefault>

    <Restringido v-else />
</template>
