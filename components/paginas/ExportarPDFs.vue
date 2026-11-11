<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import SelectSearch from '../atoms/Selects/SelectSearch.vue';
import Select from '../atoms/Selects/Select.vue';

import { watch, reactive, ref } from 'vue'
import { decryptData } from '~/composables/Formulario/crypto';
import { usePacientesStore } from '~/stores/Entidades/Paciente.js';
import { useProfesionalStore } from '~/stores/Entidades/Profesional.js';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
const store = useIndexedDBStore();
const apiRest = useApiRest();
const config = useRuntimeConfig();

const {
    mensaje,
    options
} = notificacionesStore;

const props = defineProps({
    datos: {
        type: [Object],
    },
    tabla: String,
});

const exportaciones = useExportacion();
const iniciando = ref(false);
const exportacionId = ref(null);
// Exportación en curso mostrada en el panel de progreso del modal
const itemActivo = computed(() => exportaciones.porId(exportacionId.value));
const TIEMPO_MAXIMO_EXPORTACION = 120000;
const pacientesStore = usePacientesStore()
const profesionalStore = useProfesionalStore()
const calendarioCitasStore = useCalendarioCitas();
const jsonFields = ref([]);
const pacientesList = ref([])
const profesionalesList = ref([])

const file = reactive({
    fechaInicio: '',
    fechaFin: '',
    id_paciente: varView.id_pacientePDF,
    id_profesional: '',
    servicio: varView.servicioPDF,
    pacientePDF: '',
    profesionalPDF: '',
});

const camposRequeridos = [
    'fechaInicio', 'fechaFin'
];

// Capacidad del sistema de exportaciones (limite global de cupos)
const capacidad = ref({
    active_exports: 0,
    max_exports: 6,
    available_slots: 6,
    can_export: true,
});
const INTERVALO_CAPACIDAD = 30000;
let intervaloCapacidad = null;

const consultarCapacidad = async () => {
    try {
        const token = decryptData(localStorage.getItem('token'));
        const res = await fetch(`${config.public.api}/${config.public.exportarCapacidad}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });
        if (res.ok) {
            capacidad.value = await res.json();
        }
    } catch (error) {
        // Sin respuesta: conserva el ultimo estado conocido
    }
};

onMounted(() => {

    // Capacidad: consulta inicial + actualizacion cada 30 segundos
    consultarCapacidad();
    intervaloCapacidad = setInterval(consultarCapacidad, INTERVALO_CAPACIDAD);
    // Obtener la fecha actual desde el store
    pacientesList.value = pacientesStore.Pacientes.map(p => {
        return {
            label: `${p.info_usuario.name} - ${p.info_usuario.No_document}`,
            value: p.id
        }
    })

    profesionalesList.value = profesionalStore.Profesionales.map(p => {
        return {
            label: `${p.info_usuario.name} - ${p.info_usuario.No_document}`,
            value: p.id
        }
    })

    const [dia, mes, año] = calendarioCitasStore.fechaActual.split('/');
    const fechaActual = new Date(`${año}-${mes}-${dia}`);

    // Fecha fin = hoy
    file.fechaFin = fechaActual.toISOString().split('T')[0];

    // Fecha inicio = un mes antes
    const fechaInicio = new Date(fechaActual);
    fechaInicio.setMonth(fechaInicio.getMonth() - 1);
    file.fechaInicio = fechaInicio.toISOString().split('T')[0];

})

onUnmounted(() => {
    if (intervaloCapacidad) {
        clearInterval(intervaloCapacidad);
        intervaloCapacidad = null;
    }
})

watch(file, (newValue) => {
    file.value = newValue

    // Validacion
    const camposValidos = camposRequeridos.every((campo) => file.value[campo] !== '');
    varView.formComplete = camposValidos;
});

function cerrar() {
    exportacionId.value = null
    file.id_paciente = ''
    file.id_profesional = ''
    varView.showExportarPDFs = false
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
        return false
    } else {
        return true
    }
};

// Filtrar análisis por rango de fechas
const filtrarAnalisisPorFecha = (analisis, servicio, fechaInicio, fechaFin, id_paciente = '', id_profesional = '') => {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0); // incluir desde el inicio del día

    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999); // incluir hasta el final del día

    const resultado = [];
    for (const item of analisis) {
        let fechaCreacion = new Date(item.created_at);

        const condicionFecha = fechaCreacion >= inicio && fechaCreacion <= fin;
        const condicionProfesional = id_profesional ? parseInt(id_profesional) === parseInt(item.profesional?.id) : true;
        const condicionPaciente = id_paciente ? parseInt(id_paciente) === parseInt(item.historia?.id_paciente) : true;
        const condicionServicio = servicio === item.servicio.plantilla;

        if (condicionFecha && condicionProfesional && condicionPaciente && condicionServicio) {
            resultado.push({ ...item });
        }
    }
    return resultado;

};

const enviarPDFs = async () => {
    const validacion = validarform()
    if (!validacion) return

    iniciando.value = true;
    try {
        const item = await exportaciones.iniciar({
            servicio: file.servicio == 'todos' ? null : file.servicio,
            id_paciente: file.id_paciente,
            id_profesional: file.id_profesional,
            fechaInicio: file.fechaInicio,
            fechaFin: file.fechaFin,
            etiqueta: etiquetaSeleccionada(),
        });

        // Un cupo mas fue consumido (o rechazado): actualiza la capacidad mostrada
        consultarCapacidad();

        if (item) {
            // El modal permanece abierto mostrando el progreso: el usuario
            // decide cuándo poner la exportación en segundo plano.
            exportacionId.value = item.id;
        }
    } finally {
        iniciando.value = false;
    }
};

function etiquetaSeleccionada() {
    const partes = [];
    if (file.id_paciente) {
        const p = pacientesList.value.find(x => x.value === file.id_paciente);
        if (p) partes.push(p.label);
    }
    if (file.id_profesional) {
        const p = profesionalesList.value.find(x => x.value === file.id_profesional);
        if (p) partes.push(p.label);
    }
    return partes.join(' · ');
}

function ponerEnSegundoPlano() {
    // La exportación sigue viva en el módulo global; solo se oculta el panel
    varView.showExportarPDFs = false;
    exportacionId.value = null;
}

async function descargarActivo() {
    if (!itemActivo.value) return;
    const ok = await exportaciones.descargar(itemActivo.value.id);
    if (ok) cerrar();
}

async function reintentarActivo() {
    if (!itemActivo.value) return;
    const nuevo = await exportaciones.reintentar(itemActivo.value.id);
    if (nuevo) exportacionId.value = nuevo.id;
}

const generarExcel = async () => {
    const validacion = validarform()
    if (!validacion) return
    try {
        // Cargar datos necesarios
        const token = decryptData(localStorage.getItem('token'))
        const controlador = new AbortController();
        const tiempoLimite = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_EXPORTACION);
        let analisisFiltrados = []
        try {
            const res = await fetch(`${config.public.api}/${config.public.exportarExcel}`, {
                method: 'POST',
                signal: controlador.signal,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    servicio: file.servicio,
                    id_paciente: file.id_paciente,
                    id_profesional: file.id_profesional,
                    fechaInicio: file.fechaInicio,
                    fechaFin: file.fechaFin,
                })

            });
            const json = await res.json()
            analisisFiltrados = json.data || []
        } catch (err){
            if (err.name !== 'AbortError') console.log('error al obtener datos', err)
        } finally {
            clearTimeout(tiempoLimite);
        }

        if (analisisFiltrados.length === 0) {
            options.position = 'top-end';
            options.background = '#d33'
            options.texto = "No se encontraron registros en el rango de fechas especificado";
            options.tiempo = 2000;
            mensaje();
            return;
        }

        jsonFields.value =
            file.servicio === 'Nota'
                ? {
                    'id': 'id',
                    'Fecha Nota': 'nota_fecha',
                    'Paciente': 'paciente',
                    'Profesional': 'profesional',
                    'Servicio': 'servicio',
                    'Motivo de Consulta': 'motivo',
                    'Observaciones': 'nota_tipo'
                }
                : file.servicio === 'Terapia'
                    ? {
                        'id': 'id',
                        'Fecha Terapia': 'terapia_fecha',
                        'Paciente': 'paciente',
                        'Profesional': 'profesional',
                        'Servicio': 'servicio',
                        'Sesion': 'terapia_sesion',
                        'Descripción Terapia': 'terapia_objetivos',
                        'Observaciones': 'terapia_evolucion'
                    }
                    : {
                        'id': 'id',
                        'Fecha Registro': 'fecha',
                        'Paciente': 'paciente',
                        'Profesional': 'profesional',
                        'Servicio': 'servicio',
                        'Motivo': 'motivo',
                        'Diagnóstico': 'tipoAnalisis',
                        'Tratamiento': 'tratamiento',
                        'Observación': 'observacion',
                        'Análisis Clínico': 'analisisClinico'
                    };

        return analisisFiltrados

    } catch (error) {
        console.error('Error al exportar Excel:', error);
        options.position = 'top-end';
        options.texto = "Error al generar Excel. Por favor intente nuevamente.";
        options.tiempo = 2000;
        mensaje();
    }
}

</script>

<template>
    <FondoBlur>
        <div class="bg-[rgba(0,0,0,0.5)] w-full h-full flex justify-center items-center">
            <div
                class="bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 md:w-[55%] md:h-[70%] w-[90%] h-[80%] transform transition-all duration-300 animate-fadeIn">
                <div class="py-6 h-full flex flex-col justify-between">
                    <!-- Título -->
                    <h2 class="text-2xl font-bold text-center py-3 text-gray-800 dark:text-gray-100 tracking-wide">
                        {{ itemActivo ? 'Exportación en proceso' : 'Configuración de Exportación' }}
                    </h2>

                    <!-- Contenido scrollable (formulario) -->
                    <template v-if="!itemActivo">
                    <div class="h-full pt-5 overflow-y-auto scrollForm px-10 space-y-6">
                        <!-- Sección rango de fechas -->
                        <div class="flex items-center gap-2 mb-5">
                            <i class="fa-solid fa-calendar-days text-blue-500"></i>
                            <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Rango de Fechas</p>
                        </div>

                        <!-- Select servicio (vacío = todos los servicios) -->
                        <div class="pb-3">
                            <Select v-model="file.servicio" :Propiedades="{
                                placeholder: 'Todos los servicios',
                                id: 'servicio',
                                name: 'servicio',
                                label: 'Elige el Servicio (opcional)',
                                options: [
                                    { label: 'Todos los servicios', value: 'todos' },
                                    { label: 'Nota', value: 'Nota' },
                                    { label: 'Terapia', value: 'Terapia' },
                                    { label: 'Evolución', value: 'Evolucion' },
                                    { label: 'Trabajo Social', value: 'Trabajo Social' },
                                    { label: 'Medicina', value: 'Medicina' }
                                ]
                            }" />
                        </div>

                        <!-- Inputs fechas -->
                        <div class="grid md:grid-cols-2 grid-cols-1 gap-4">
                            <Input v-model="file.fechaInicio" :Propiedades="{
                                placeholder: 'Fecha de inicio',
                                id: 'fechaInicio',
                                name: 'fechaInicio',
                                label: 'Fecha de Inicio',
                                type: 'date',
                            }" />
                            <Input v-model="file.fechaFin" :Propiedades="{
                                placeholder: 'Fecha de fin',
                                id: 'fechaFin',
                                name: 'fechaFin',
                                type: 'date',
                                label: 'Fecha de Fin',
                            }" />
                        </div>

                        <!-- Filtros -->
                        <div>
                            <div class="flex items-center gap-2 mt-5">
                                <i class="fa-solid fa-filter text-green-500"></i>
                                <p class="text-base font-medium text-gray-700 dark:text-gray-300">Filtrar por:</p>
                            </div>
                            <div class="grid md:grid-cols-2 grid-cols-1 gap-4 mt-3">
                                <SelectSearch v-if="!varView.onlyPaciente" v-model="file.id_paciente" :Propiedades="{
                                    placeholder: 'Paciente (opcional)',
                                    tamaño: 'w-full',
                                    id: 'paciente',
                                    name: 'paciente',
                                    label: 'Filtrar Paciente (opcional)',
                                    options: pacientesList,
                                    upperCase: true,
                                }" />
                                <SelectSearch v-model="file.id_profesional" :Propiedades="{
                                    placeholder: 'Profesional (opcional)',
                                    tamaño: 'w-full',
                                    id: 'profesional',
                                    name: 'profesional',
                                    label: 'Filtrar Profesional (opcional)',
                                    options: profesionalesList,
                                    upperCase: true,
                                }" />
                            </div>
                        </div>

                        <!-- Capacidad del sistema -->
                        <div v-if="!capacidad.can_export" class="rounded-xl border p-4 text-sm space-y-1 border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                            <p class="font-medium pt-1">
                                Actualmente el sistema está procesando el máximo de exportaciones permitidas.
                                Por favor espere unos minutos e inténtelo nuevamente.
                            </p>
                        </div>

                    </div>
                    <div class="w-full flex justify-center items-center gap-4 px-4 mt-6">
                        <ButtonForm
                            class="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="cerrar">
                            <i class="fa-solid fa-xmark mr-2"></i> {{ 'Cancelar' }}
                        </ButtonForm>

                        <download-excel
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-full md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300 flex items-center justify-center gap-1 rounded-lg cursor-pointer"
                            :fetch="generarExcel" :before-finish="cerrar" :fields="jsonFields"
                            :name="file.servicio || 'Servicios'" type="xlsx">
                            <i class="fa-solid fa-file-excel mr-2"></i>
                            Excel
                        </download-excel>

                        <ButtonForm
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="enviarPDFs" :disabled="iniciando">
                            <i class="fa-solid fa-file-export mr-2"></i> {{ iniciando ? 'Iniciando...' : 'PDF'
                            }}
                        </ButtonForm>

                    </div>
                    </template>

                    <!-- Panel de progreso: el usuario decide cuándo ponerlo en segundo plano -->
                    <template v-else>
                        <div class="h-full pt-5 overflow-y-auto scrollForm px-10 space-y-6">

                            <!-- Proceso -->
                            <template v-if="['pendiente', 'procesando', 'comprimiendo'].includes(itemActivo.estado)">
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="fa-solid fa-file-export text-blue-500"></i>
                                    <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
                                        Generando tus PDFs…
                                    </p>
                                </div>
                                <p class="text-sm text-gray-600 dark:text-gray-400">
                                    {{ itemActivo.servicio }} — {{ itemActivo.rango?.fechaInicio }} al {{
                                        itemActivo.rango?.fechaFin }}
                                    <span v-if="itemActivo.etiqueta"> · {{ itemActivo.etiqueta }}</span>
                                </p>

                                <div class="flex justify-between text-sm mb-1 text-gray-600 dark:text-gray-300">
                                    <span>En cola de procesamiento</span>
                                    <span v-if="itemActivo.total > 0">{{
                                        Math.min(100, Math.round((itemActivo.completados / itemActivo.total) * 100))
                                        }}%</span>
                                </div>
                                <div class="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div class="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        :style="{
                                            width: (itemActivo.total > 0
                                                ? Math.min(100, Math.round((itemActivo.completados / itemActivo.total) * 100))
                                                : 8) + '%'
                                        }"></div>
                                </div>

                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    <i class="fa-solid fa-clock mr-1"></i>
                                    Puedes poner la exportación en segundo plano y seguir trabajando; te avisaremos
                                    cuando esté lista.
                                </p>
                                <p class="text-xs text-amber-600 dark:text-amber-400">
                                    <i class="fa-solid fa-circle-info mr-1"></i>
                                    Según la configuración del servidor puede tardar de 5 a 20 minutos.
                                </p>
                            </template>

                            <!-- Lista -->
                            <template v-else-if="itemActivo.estado === 'lista'">
                                <div class="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                    <div class="rounded-full bg-emerald-50 p-4 text-emerald-600">
                                        <i class="i-lucide-circle-check text-2xl"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Tus PDFs están listos
                                        </h4>
                                        <p class="text-sm text-gray-500">
                                            {{ itemActivo.servicio }} — descarga tu archivo cuando quieras.
                                        </p>
                                    </div>
                                </div>
                            </template>

                            <!-- Fallida -->
                            <template v-else>
                                <div class="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                    <div class="rounded-full bg-red-50 p-4 text-red-600">
                                        <i class="i-lucide-circle-x text-2xl"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            La exportación falló
                                        </h4>
                                        <p class="text-sm text-gray-500">
                                            Puedes intentarlo de nuevo.
                                        </p>
                                    </div>
                                </div>
                            </template>

                        </div>

                        <div class="w-full flex justify-center items-center gap-4 px-4 mt-6">
                            <template v-if="['pendiente', 'procesando', 'comprimiendo'].includes(itemActivo.estado)">
                                <ButtonForm
                                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-65 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                                    @click="ponerEnSegundoPlano">
                                    <i class="fa-solid fa-window-minimize mr-2"></i> Poner en segundo plano
                                </ButtonForm>
                            </template>
                            <template v-else-if="itemActivo.estado === 'lista'">
                                <ButtonForm
                                    class="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                                    @click="cerrar">
                                    <i class="fa-solid fa-xmark mr-2"></i> Cerrar
                                </ButtonForm>
                                <ButtonForm
                                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                                    @click="descargarActivo">
                                    <i class="fa-solid fa-download mr-2"></i> Descargar
                                </ButtonForm>
                            </template>
                            <template v-else>
                                <ButtonForm
                                    class="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                                    @click="cerrar">
                                    <i class="fa-solid fa-xmark mr-2"></i> Cerrar
                                </ButtonForm>
                                <ButtonForm
                                    class="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                                    @click="reintentarActivo">
                                    <i class="fa-solid fa-rotate-right mr-2"></i> Reintentar
                                </ButtonForm>
                            </template>
                        </div>
                    </template>
                </div>
            </div>

        </div>
    </FondoBlur>
</template>

<style scoped>
.autocomplete-list li {
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;
}

.autocomplete-list li:last-child {
    border-bottom: none;
}

.autocomplete-list li:hover {
    background-color: #e5f0ff;
}
</style>