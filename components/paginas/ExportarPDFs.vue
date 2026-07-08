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

const generandoPDFs = ref(false);
const cancelarPDFs = ref(false);
const progreso = ref(0);
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

onMounted(() => {
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

watch(file, (newValue) => {
    file.value = newValue

    // Validacion
    const camposValidos = camposRequeridos.every((campo) => file.value[campo] !== '');
    varView.formComplete = camposValidos;
});

function cerrar() {
    cancelarPDFs.value = true; // activar la cancelación de pdf
    file.id_paciente = ''
    file.id_profesional = ''
    if (!generandoPDFs.value) { varView.showExportarPDFs = false }
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
    try {

        generandoPDFs.value = true;
        progreso.value = 0;

        // Cargar datos necesarios
        varView.cargando = true;
        await apiRest.getData('Analisis', 'analisis');
        varView.cargando = false;

        store.almacen = 'Analisis';
        let analisisData = await store.leerdatos();

        // Filtrar análisis por rango de fechas
        const analisisFiltrados = filtrarAnalisisPorFecha(
            analisisData,
            file.servicio || varView.servicioPDF,
            file.fechaInicio,
            file.fechaFin,
            file.id_paciente || varView.id_pacientePDF,
            file.id_profesional
        );

        if (analisisFiltrados.length === 0) {
            options.position = 'top-end';
            options.background = '#d33'
            options.texto = "No se encontraron registros en el rango de fechas especificado";
            options.tiempo = 2000;
            mensaje();
            generandoPDFs.value = false;
            return;
        }

        const totalAnalisis = analisisFiltrados.length;
        const token = decryptData(localStorage.getItem('token'))

        // Lista de ids de analisis para enviar al backend
        const idsAnalisis = analisisFiltrados.map(analisis => analisis.id);

        try {
            const res = await fetch(`${config.public.api}/${config.public.exportarPdf}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    servicio: file.servicio,
                    ids: idsAnalisis,
                    individual: false
                })

            });
            console.log(res)
            if (!res.ok) {
                throw new Error(`Error en la petición: ${res.status}`);
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            // Leer el nombre desde el header
            // const disposition = res.headers.get('Content-Disposition');
            // let fileName = `${varView.servicioPDF || file.servicio}.pdf`;
            // if (disposition) {
            //     const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/);
            //     if (match && match[1]) {
            //         fileName = decodeURIComponent(match[1]);
            //     }
            // }

            // Descargar
            const a = document.createElement('a');
            a.href = url;
            a.download = 'documento.pdf'; // nombre dinámico
            document.body.appendChild(a);
            a.click();
            a.remove();

            setTimeout(() => window.URL.revokeObjectURL(url), 10000);

        } catch (err) {
            console.error("Error al obtener el PDF:", err);
        }


        // Si no se canceló, mostramos mensaje de éxito
        if (!cancelarPDFs.value) {
            options.position = 'top-end';
            options.texto = `${totalAnalisis} PDFs generados y descargados exitosamente`;
            options.background = '#22c55e';
            options.tiempo = 2000;
            mensaje();
        }
        cerrar();
    } catch (error) {
        console.error('Error al exportar PDFs:', error);
        options.position = 'top-end';
        options.texto = "Error al generar los PDFs. Por favor intente nuevamente.";
        options.tiempo = 2000;
        mensaje();
    } finally {
        generandoPDFs.value = false;
        progreso.value = 0;
    }
}

const generarExcel = async () => {
    const validacion = validarform()
    if (!validacion) return
    try {
        // Cargar datos necesarios
        varView.cargando = true;
        await apiRest.getData('Analisis', 'analisis');
        varView.cargando = false;

        store.almacen = 'Analisis';
        let analisisData = await store.leerdatos();

        // Filtrar análisis por rango de fechas
        let analisisFiltrados = filtrarAnalisisPorFecha(
            analisisData,
            file.servicio || varView.servicioPDF,
            file.fechaInicio,
            file.fechaFin,
            file.id_paciente || varView.id_pacientePDF,
            file.id_profesional
        );

        if (analisisFiltrados.length === 0) {
            options.position = 'top-end';
            options.background = '#d33'
            options.texto = "No se encontraron registros en el rango de fechas especificado";
            options.tiempo = 2000;
            mensaje();
            generandoPDFs.value = false;
            return;
        }

        jsonFields.value =
            file.servicio === 'Nota'
                ? {
                    'Fecha Nota': 'fecha_nota',
                    'Paciente': 'paciente.info_usuario.name',
                    'Profesional': 'profesional.info_usuario.name',
                    'Servicio': 'servicio.name',
                    'Motivo de Consulta': 'motivo',
                    'Observaciones': 'tipoAnalisis'
                }
                : file.servicio === 'Terapia'
                    ? {
                        'Fecha Terapia': 'terapia.fecha',
                        'Paciente': 'paciente.info_usuario.name',
                        'Profesional': 'profesional.info_usuario.name',
                        'Servicio': 'servicio.name',
                        'Sesion': 'terapia.sesion',
                        'Descripción Terapia': 'terapia.objetivos',
                        'Observaciones': 'terapia.evolucion'
                    }
                    : {
                        'Fecha Registro': 'created_at',
                        'Paciente': 'paciente.info_usuario.name',
                        'Profesional': 'profesional.info_usuario.name',
                        'Servicio': 'servicio.name',
                        'Motivo': 'motivo',
                        'Diagnóstico': 'tipoAnalisis',
                        'Tratamiento': 'tratamiento',
                        'Observación': 'observacion',
                        'Análisis Clínico': 'analisis'
                    };

        analisisFiltrados = analisisFiltrados.map(analisis => {
            return {
                ...analisis,
                paciente: pacientesStore.Pacientes.find(
                    p => parseInt(p.id) === parseInt(analisis.historia.id_paciente)
                ) || '',
            }
        })
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
                        Configuración de Exportación
                    </h2>

                    <!-- Contenido scrollable -->
                    <div class="h-full pt-5 overflow-y-auto scrollForm px-10 space-y-6">
                        <!-- Sección rango de fechas -->
                        <div class="flex items-center gap-2 mb-5">
                            <i class="fa-solid fa-calendar-days text-blue-500"></i>
                            <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Rango de Fechas</p>
                        </div>

                        <!-- Select servicio -->
                        <div class="pb-3" v-if="!varView.onlyPaciente">
                            <Select v-model="file.servicio" :Propiedades="{
                                placeholder: 'Servicio',
                                id: 'servicio',
                                name: 'servicio',
                                label: 'Elige el Servicio',
                                options: [
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

                        <!-- Progreso -->
                        <div v-if="generandoPDFs" class="mt-6 space-y-3">
                            <div class="flex justify-between items-center">
                                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Generando PDFs...</p>
                                <span class="text-sm font-bold text-blue-600">{{ progreso }}%</span>
                            </div>
                            <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div class="bg-linear-to-r from-blue-400 to-blue-600 h-full transition-all duration-500 ease-out"
                                    :style="{ width: progreso + '%' }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="w-full flex justify-center items-center gap-4 px-4 mt-6">
                        <ButtonForm
                            class="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="cerrar">
                            <i class="fa-solid fa-xmark mr-2"></i> {{ cancelarPDFs ? 'Cancelando...' : 'Cancelar' }}
                        </ButtonForm>

                        <download-excel
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-full md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300 flex items-center justify-center gap-1 rounded-lg cursor-pointer"
                            :fetch="generarExcel" :before-finish="cerrar" :fields="jsonFields" :name="file.servicio" type="xlsx">
                            <i class="fa-solid fa-file-excel mr-2"></i>
                            Excel
                        </download-excel>

                        <ButtonForm
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-50 sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="enviarPDFs" :disabled="generandoPDFs">
                            <i class="fa-solid fa-file-export mr-2"></i> {{ generandoPDFs ? 'Procesando...' : 'PDF'
                            }}
                        </ButtonForm>

                    </div>
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