<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Form from '~/components/organism/Forms/Form.vue';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { historialManejoModales } from '~/composables/Historias/historialManejoModales';
import { useVerHistoriaBuilder } from '~/build/Historial/useVerHistoriaBuilder';
import { usePDFExporter } from '~/composables/Historias/exportarServicioPDF';
import { formatDate } from '~/composables/Formulario/FormatearFecha';
import { decryptData } from '~/composables/Formulario/crypto';

const route = useRoute();
const config = useRuntimeConfig();
const varView = useVarView();
const { hasPermiso } = usePermisos();
const historiasStore = useHistoriasStore();
const { exportar } = usePDFExporter();

const registro = ref(null);
const cargando = ref(true);
const errorCarga = ref('');

const showItem = ref(false);
const actualizar = ref(false);
const formularioItem = ref('');

const TIPO_POR_PLANTILLA = {
    'Medicina': 'Consulta',
    'Evolucion': 'Evolucion',
    'Trabajo Social': 'TrabajoSocial',
    'Nota': 'Nota',
    'Terapia': 'Terapia',
};

const PUT_POR_PLANTILLA = {
    'Medicina': 'MedicinaGeneral_put',
    'Evolucion': 'Evoluciones_put',
    'Trabajo Social': 'TrabajoSocial_put',
    'Nota': 'Notas_put',
    'Terapia': 'Terapias_put',
};

const plantilla = computed(() => registro.value?.servicio?.plantilla || '');

const puedeEditar = computed(() => {
    const permiso = PUT_POR_PLANTILLA[plantilla.value];
    return permiso ? hasPermiso(permiso) : false;
});

const paciente = computed(() => registro.value?.historia?.paciente || null);
const infoPaciente = computed(() => paciente.value?.info_usuario || null);
const profesional = computed(() => registro.value?.profesional || null);
const infoProfesional = computed(() => profesional.value?.info_usuario || null);
const cita = computed(() => registro.value?.cita || null);
const convenio = computed(() => paciente.value?.convenios?.[0] || null);

const signosVitales = computed(() => {
    const sv = registro.value?.examen_fisico?.signosVitales;
    if (!sv) return null;
    if (typeof sv === 'string') {
        try { return JSON.parse(sv); } catch (e) { return null; }
    }
    return sv;
});

const selloUrl = computed(() => {
    const sello = infoProfesional.value?.sello;
    return sello ? `${config.public.api}/storage/${sello}` : null;
});

const gruposSOAP = computed(() => {
    const items = registro.value?.nota?.descripcion_nota || [];
    const tipos = ['subjetivo', 'objetivo', 'actividades', 'plan', 'intervencion', 'evaluacion'];
    const grupos = {};
    tipos.forEach(t => { grupos[t] = items.filter(d => d.tipo === t); });
    return grupos;
});

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

const sexoPaciente = computed(() => {
    const sexo = infoPaciente.value?.sexo;
    if (!sexo) return '';
    const s = String(sexo).toLowerCase();
    if (['m', 'masc', 'masculino', 'h', ' hombre'].includes(s)) return 'Masculino';
    if (['f', 'fem', 'femenino', ' mujer'].includes(s)) return 'Femenino';
    return sexo;
});

async function cargarRegistro() {
    cargando.value = true;
    errorCarga.value = '';
    try {
        const token = decryptData(localStorage.getItem('token'));
        const res = await fetch(
            `${config.public.api}/${config.public.analisisCompleta}/${route.params.id}/completa`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }
        );

        if (!res.ok) {
            if (res.status === 404) {
                errorCarga.value = 'El registro clínico no existe o fue eliminado.';
            } else {
                errorCarga.value = 'No fue posible cargar el registro clínico. Intente nuevamente.';
            }
            return;
        }

        const json = await res.json();
        if (json?.success && json.data) {
            registro.value = json.data;
        } else {
            errorCarga.value = 'No fue posible cargar el registro clínico. Intente nuevamente.';
        }
    } catch (e) {
        console.error('Error cargando registro clínico:', e);
        errorCarga.value = 'No fue posible cargar el registro clínico. Intente nuevamente.';
    } finally {
        cargando.value = false;
    }
}

onMounted(cargarRegistro);

function cerrarModalVer() {
    showItem.value = false;
}

// Reutiliza el mismo wizard/modal de visualización-edición del Historial
const { loadItem } = historialManejoModales({
    historiasStore,
    showItem,
    formularioItem,
    actualizar,
});

const propiedadesItemHistoria = computed(() => {
    return useVerHistoriaBuilder({
        storeId: 'ActualizarHistorias',
        storePinia: 'Historias',
        cerrarModal: cerrarModalVer,
        formularioItem,
        actualizar,
        show: showItem,
    });
});

// Tras cerrar el modal de edición, recargar para reflejar cambios
watch(showItem, (abierto) => {
    if (!abierto && registro.value) {
        cargarRegistro();
    }
});

function editarRegistro() {
    if (!registro.value || !puedeEditar.value) return;
    const tipo = TIPO_POR_PLANTILLA[plantilla.value];
    if (!tipo) return;
    loadItem(tipo, registro.value, 'update');
}

function verPDF() {
    if (!registro.value) return;
    exportar(plantilla.value, registro.value.id);
}

function irAHistorialPaciente() {
    const idPaciente = registro.value?.historia?.id_paciente;
    if (!idPaciente) return;
    navigateTo({ path: '/Historial', query: { paciente: idPaciente } });
}

function irAtras() {
    navigateTo('/Historial');
}

function irACita() {
    navigateTo('/Usuarios/Citas');
}

const esNota = computed(() => plantilla.value === 'Nota');
const esTerapia = computed(() => plantilla.value === 'Terapia');
const esMedicina = computed(() => plantilla.value === 'Medicina');
const esEvolucion = computed(() => plantilla.value === 'Evolucion');
const esTrabajoSocial = computed(() => plantilla.value === 'Trabajo Social');

const tituloPlantilla = computed(() => {
    const mapa = {
        'Medicina': 'Consulta Médica',
        'Evolucion': 'Evolución / Nutrición',
        'Trabajo Social': 'Trabajo Social',
        'Nota': 'Nota de Enfermería',
        'Terapia': 'Terapia',
    };
    return mapa[plantilla.value] || registro.value?.servicio?.name || 'Registro clínico';
});
</script>

<template>
    <FondoDefault>
        <Form :Propiedades="propiedadesItemHistoria" />

        <!-- Cargando -->
        <div v-if="cargando" class="flex justify-center items-center py-20">
            <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-blue-500" />
        </div>

        <!-- Error -->
        <div v-else-if="errorCarga" class="max-w-2xl mx-auto py-16">
            <UAlert icon="i-lucide-triangle-alert" color="error" variant="subtle"
                title="Registro no disponible" :description="errorCarga">
                <template #footer>
                    <UButton color="error" variant="soft" @click="irAtras">
                        <i class="fa-solid fa-arrow-left mr-2"></i>Volver al historial
                    </UButton>
                </template>
            </UAlert>
        </div>

        <!-- Contenido -->
        <div v-else-if="registro" class="space-y-4 max-w-7xl mx-auto pb-8">

            <!-- Encabezado -->
            <UCard class="bg-linear-to-r from-(--color-default-500) to-(--color-default-600) text-white shadow-lg border-0">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <button @click="irAtras" title="Volver al historial"
                            class="mt-1 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer shrink-0">
                            <i class="fa-solid fa-arrow-left"></i>
                        </button>
                        <div>
                            <p class="text-sm/none opacity-80">Historia Clínica</p>
                            <h1 class="text-xl font-bold">{{ tituloPlantilla }}</h1>
                            <p class="text-sm opacity-90 mt-1">
                                Registro HC-{{ registro.id }}
                                <span v-if="registro.created_at" class="opacity-80">
                                    · {{ formatDate(registro.created_at) }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-2">
                        <UButton color="neutral" variant="soft" class="text-gray-800 dark:text-gray-100"
                            @click="irACita">
                            <i class="fa-solid fa-calendar-day mr-2"></i>Agenda
                        </UButton>
                        <UButton v-if="registro.historia?.id_paciente" color="neutral" variant="soft"
                            class="text-gray-800 dark:text-gray-100" @click="irAHistorialPaciente">
                            <i class="fa-solid fa-folder-open mr-2"></i>Historia del paciente
                        </UButton>
                        <UButton color="neutral" variant="soft" class="text-gray-800 dark:text-gray-100" @click="verPDF">
                            <i class="fa-solid fa-file-pdf mr-2"></i>Ver PDF
                        </UButton>
                        <UButton v-if="puedeEditar" color="white" variant="solid" class="text-blue-700"
                            @click="editarRegistro">
                            <i class="fa-solid fa-pen mr-2"></i>Editar
                        </UButton>
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
                                <p class="text-gray-400 text-xs">Sexo</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">{{ sexoPaciente || '—' }}</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">EPS</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ paciente?.eps?.nombre || '—' }}
                            </p>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <p class="text-gray-400 text-xs">Zona</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.zona || '—' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Barrio</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.barrio || '—' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Municipio</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.municipio || '—' }}
                                </p>
                            </div>
                            <div>
                                <p class="text-gray-400 text-xs">Celular</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ infoPaciente?.celular || '—' }}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Dirección</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ infoPaciente?.direccion || '—' }}
                            </p>
                        </div>
                        <div v-if="convenio">
                            <p class="text-gray-400 text-xs">Convenio</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ convenio.nombre }}</p>
                        </div>
                    </div>
                </UCard>

                <!-- Atención: cita, profesional, servicio, auditoría -->
                <UCard class="lg:col-span-2">
                    <template #header>
                        <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-stethoscope text-green-500"></i>Atención y profesional
                        </h2>
                    </template>
                    <div class="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p class="text-gray-400 text-xs">Servicio</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ registro.servicio?.name || '—' }}
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
                            <p class="text-gray-400 text-xs">Fecha del registro</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ registro.created_at ? formatDate(registro.created_at) : '—' }}
                            </p>
                        </div>

                        <div v-if="cita" class="md:col-span-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                            <p class="text-gray-400 text-xs mb-1">Cita asociada</p>
                            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    <i class="fa-solid fa-calendar-check text-blue-400 mr-1"></i>
                                    {{ cita.fecha ? formatDate(cita.fecha) : '—' }}
                                    <span v-if="cita.hora && cita.hora !== '00:00:00'">· {{ cita.hora }}</span>
                                </p>
                                <UBadge :color="cita.estado === 'Realizada' ? 'success'
                                    : cita.estado === 'cancelada' ? 'error' : 'neutral'" variant="subtle"
                                    class="capitalize">
                                    {{ cita.estado }}
                                </UBadge>
                                <button v-if="cita.estado === 'Realizada'" @click="irACita"
                                    class="text-xs text-blue-500 hover:text-blue-700 font-medium cursor-pointer">
                                    Ver en agenda <i class="fa-solid fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                            <p v-if="cita.motivo" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {{ cita.motivo }}
                            </p>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Motivo / Anamnesis / Evolución según plantilla -->
            <UCard>
                <template #header>
                    <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <i class="fa-solid fa-clipboard-list text-purple-500"></i>
                        {{ esTerapia ? 'Intervención terapéutica'
                            : esNota ? 'Nota de enfermería (SOAP)'
                            : 'Motivo y evolución' }}
                    </h2>
                </template>

                <div class="space-y-4 text-sm">
                    <div v-if="registro.motivo">
                        <p class="text-gray-400 text-xs">
                            {{ esTerapia ? 'Motivo' : 'Motivo de consulta' }}
                        </p>
                        <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">{{ registro.motivo }}</p>
                    </div>

                    <!-- Medicina: enfermedad actual + estado clínico -->
                    <template v-if="esMedicina">
                        <div v-if="registro.enfermedad?.valor">
                            <p class="text-gray-400 text-xs">Enfermedad actual</p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                                {{ registro.enfermedad.valor }}
                            </p>
                        </div>
                        <div v-if="registro.tipoAnalisis">
                            <p class="text-gray-400 text-xs">Estado clínico</p>
                            <UBadge :color="registro.tipoAnalisis === 'Estado clinico sin cambios' ? 'success'
                                : registro.tipoAnalisis === 'Recomendaciones Adicionales' ? 'warning' : 'error'"
                                variant="subtle">
                                {{ registro.tipoAnalisis }}
                            </UBadge>
                        </div>
                        <div v-if="registro.tratamiento">
                            <p class="text-gray-400 text-xs">Tratamiento</p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">{{ registro.tratamiento }}</p>
                        </div>
                        <div v-if="registro.observacion">
                            <p class="text-gray-400 text-xs">Observaciones</p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">{{ registro.observacion }}</p>
                        </div>
                    </template>

                    <!-- Evolución / Trabajo social: texto del análisis -->
                    <template v-if="esEvolucion || esTrabajoSocial">
                        <div v-if="registro.analisis">
                            <p class="text-gray-400 text-xs">
                                {{ esEvolucion ? 'Evolución / Recomendaciones' : 'Análisis y tratamientos' }}
                            </p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">{{ registro.analisis }}</p>
                        </div>
                        <div v-if="registro.tipoAnalisis">
                            <p class="text-gray-400 text-xs">Estado clínico</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ registro.tipoAnalisis }}</p>
                        </div>
                    </template>

                    <!-- Terapia -->
                    <template v-if="esTerapia && registro.terapia">
                        <div v-if="registro.terapia.objetivos">
                            <p class="text-gray-400 text-xs">Objetivos de la intervención</p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                                {{ registro.terapia.objetivos }}
                            </p>
                        </div>
                        <div class="grid grid-cols-3 gap-3">
                            <div v-if="registro.terapia.sesion">
                                <p class="text-gray-400 text-xs">Sesión</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">{{ registro.terapia.sesion }}</p>
                            </div>
                            <div v-if="registro.terapia.fecha">
                                <p class="text-gray-400 text-xs">Fecha sesión</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">
                                    {{ formatDate(registro.terapia.fecha) }}
                                </p>
                            </div>
                            <div v-if="registro.terapia.hora">
                                <p class="text-gray-400 text-xs">Hora</p>
                                <p class="font-medium text-gray-800 dark:text-gray-100">{{ registro.terapia.hora }}</p>
                            </div>
                        </div>
                        <div v-if="registro.terapia.evolucion">
                            <p class="text-gray-400 text-xs">Evolución de la sesión</p>
                            <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                                {{ registro.terapia.evolucion }}
                            </p>
                        </div>
                    </template>

                    <!-- Nota SOAP -->
                    <template v-if="esNota">
                        <div class="grid md:grid-cols-2 gap-4">
                            <div v-for="grupo in ['subjetivo', 'objetivo', 'actividades', 'plan', 'intervencion', 'evaluacion']"
                                :key="grupo">
                                <p class="text-gray-400 text-xs capitalize mb-1">{{ grupo }}</p>
                                <div v-if="gruposSOAP[grupo]?.length" class="space-y-1">
                                    <div v-for="(item, i) in gruposSOAP[grupo]" :key="i"
                                        class="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
                                        <p class="text-xs text-gray-400">{{ item.hora }}</p>
                                        <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                                            {{ item.descripcion }}
                                        </p>
                                    </div>
                                </div>
                                <p v-else class="text-xs text-gray-300 dark:text-gray-600">Sin registros</p>
                            </div>
                        </div>
                        <div v-if="registro.nota?.direccion" class="text-sm">
                            <p class="text-gray-400 text-xs">Dirección de atención</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ registro.nota.direccion }}</p>
                        </div>
                    </template>
                </div>
            </UCard>

            <!-- Examen físico / evaluaciones -->
            <UCard v-if="signosVitales || registro.examen_fisico">
                <template #header>
                    <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <i class="fa-solid fa-heart-pulse text-red-500"></i>Evaluaciones clínicas
                    </h2>
                </template>
                <div class="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    <div v-if="signosVitales?.ta">
                        <p class="text-gray-400 text-xs">TA</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ signosVitales.ta }}</p>
                    </div>
                    <div v-if="signosVitales?.fc">
                        <p class="text-gray-400 text-xs">FC</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ signosVitales.fc }}</p>
                    </div>
                    <div v-if="signosVitales?.fr">
                        <p class="text-gray-400 text-xs">FR</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ signosVitales.fr }}</p>
                    </div>
                    <div v-if="signosVitales?.t">
                        <p class="text-gray-400 text-xs">T</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ signosVitales.t }}</p>
                    </div>
                    <div v-if="signosVitales?.SATo2">
                        <p class="text-gray-400 text-xs">SAT O2</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">{{ signosVitales.SATo2 }}</p>
                    </div>
                    <div v-if="registro.examen_fisico?.peso">
                        <p class="text-gray-400 text-xs">Peso</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">
                            {{ registro.examen_fisico.peso }} kg
                        </p>
                    </div>
                    <div v-if="registro.examen_fisico?.altura">
                        <p class="text-gray-400 text-xs">Altura</p>
                        <p class="font-semibold text-gray-800 dark:text-gray-100">
                            {{ registro.examen_fisico.altura }} m
                        </p>
                    </div>
                    <div v-if="registro.examen_fisico?.otros" class="col-span-2 md:col-span-6">
                        <p class="text-gray-400 text-xs">Otros hallazgos</p>
                        <p class="text-gray-800 dark:text-gray-100 whitespace-pre-line">
                            {{ registro.examen_fisico.otros }}
                        </p>
                    </div>
                </div>
            </UCard>

            <!-- Antecedentes del paciente -->
            <UCard v-if="paciente?.antecedente?.length">
                <template #header>
                    <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <i class="fa-solid fa-notes-medical text-amber-500"></i>Antecedentes
                    </h2>
                </template>
                <div class="grid md:grid-cols-2 gap-2 text-sm">
                    <div v-for="(ante, i) in paciente.antecedente" :key="i"
                        class="bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2 flex justify-between gap-2">
                        <p class="text-gray-800 dark:text-gray-100">{{ ante.descripcion }}</p>
                        <UBadge color="neutral" variant="subtle" class="shrink-0 capitalize">{{ ante.tipo }}
                        </UBadge>
                    </div>
                </div>
            </UCard>

            <!-- Diagnósticos -->
            <UCard v-if="registro.diagnosticos?.length || registro.diagnosticosCIF?.length">
                <template #header>
                    <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <i class="fa-solid fa-activity text-teal-500"></i>Diagnósticos
                    </h2>
                </template>
                <div class="space-y-3 text-sm">
                    <div v-if="registro.diagnosticos?.length">
                        <p class="text-gray-400 text-xs mb-1">CIE-10</p>
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="(dx, i) in registro.diagnosticos" :key="i" color="info" variant="subtle">
                                {{ dx.descripcion }}
                                <span v-if="dx.codigo" class="opacity-70 ml-1">({{ dx.codigo }})</span>
                            </UBadge>
                        </div>
                    </div>
                    <div v-if="registro.diagnosticosCIF?.length">
                        <p class="text-gray-400 text-xs mb-1">Diagnósticos relacionados (CIF)</p>
                        <div class="flex flex-wrap gap-2">
                            <UBadge v-for="(dxc, i) in registro.diagnosticosCIF" :key="i" color="warning"
                                variant="subtle">
                                {{ dxc.descripcion }}
                                <span v-if="dxc.codigo" class="opacity-70 ml-1">({{ dxc.codigo }})</span>
                            </UBadge>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Plan de manejo -->
            <UCard v-if="registro.medicamentos?.length || registro.procedimientos?.length">
                <template #header>
                    <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <i class="fa-solid fa-notes-medical text-pink-500"></i>Plan de manejo
                    </h2>
                </template>
                <div class="space-y-4 text-sm">
                    <div v-if="registro.medicamentos?.length">
                        <p class="text-gray-400 text-xs mb-1">Medicamentos formulados</p>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                        <th class="py-1.5 pr-3 font-medium">Medicamento</th>
                                        <th class="py-1.5 pr-3 font-medium">Dosis</th>
                                        <th class="py-1.5 font-medium">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(med, i) in registro.medicamentos" :key="i"
                                        class="border-b border-gray-50 dark:border-gray-800">
                                        <td class="py-1.5 pr-3 text-gray-800 dark:text-gray-100">
                                            {{ med.medicamento }}</td>
                                        <td class="py-1.5 pr-3 text-gray-800 dark:text-gray-100">{{ med.dosis }}</td>
                                        <td class="py-1.5 text-gray-800 dark:text-gray-100">{{ med.cantidad }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div v-if="registro.procedimientos?.length">
                        <p class="text-gray-400 text-xs mb-1">Procedimientos realizados (CUPS)</p>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-left text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                        <th class="py-1.5 pr-3 font-medium">Procedimiento</th>
                                        <th class="py-1.5 pr-3 font-medium">Código</th>
                                        <th class="py-1.5 font-medium">Días asignados</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(proc, i) in registro.procedimientos" :key="i"
                                        class="border-b border-gray-50 dark:border-gray-800">
                                        <td class="py-1.5 pr-3 text-gray-800 dark:text-gray-100">
                                            {{ proc.procedimiento }}</td>
                                        <td class="py-1.5 pr-3 text-gray-800 dark:text-gray-100">{{ proc.codigo }}</td>
                                        <td class="py-1.5 text-gray-800 dark:text-gray-100">
                                            {{ proc.dias_asignados }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </UCard>

            <!-- Firmas y trazabilidad -->
            <div class="grid md:grid-cols-2 gap-4">
                <UCard>
                    <template #header>
                        <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-signature text-gray-500"></i>Firma y sello
                        </h2>
                    </template>
                    <div class="flex items-center gap-4">
                        <img v-if="selloUrl" :src="selloUrl" alt="Sello del profesional"
                            class="max-h-20 border rounded-lg p-1 bg-white" />
                        <div class="text-sm">
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ infoProfesional?.name || '—' }}
                            </p>
                            <p class="text-xs text-gray-400">
                                Doc. {{ infoProfesional?.No_document || '—' }}
                            </p>
                            <p v-if="!selloUrl" class="text-xs text-amber-500 mt-1">
                                Sin sello registrado
                            </p>
                        </div>
                    </div>
                </UCard>

                <UCard>
                    <template #header>
                        <h2 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <i class="fa-solid fa-clock-rotate-left text-gray-500"></i>Auditoría y trazabilidad
                        </h2>
                    </template>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p class="text-gray-400 text-xs">Creado</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ registro.created_at ? formatDate(registro.created_at) : '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Última modificación</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">
                                {{ registro.updated_at ? formatDate(registro.updated_at) : '—' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">ID registro</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ registro.id }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 text-xs">Servicio (plantilla)</p>
                            <p class="font-medium text-gray-800 dark:text-gray-100">{{ plantilla || '—' }}</p>
                        </div>
                    </div>
                </UCard>
            </div>

        </div>
    </FondoDefault>
</template>
