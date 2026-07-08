<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCalendarioCitas } from '~/stores/Calendario.js'
import { diasSemana } from '~/data/Fechas.js'
import { storeToRefs } from 'pinia';
import { useCitasStore } from '~/stores/Formularios/citas/Cita';

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

const calendarioCitasStore = useCalendarioCitas();
const Citas = ref(props.Propiedades.citas);
const notificacionesStore = useNotificacionesStore();
const citasStore = useCitasStore()

const {
    mensaje,
    options
} = notificacionesStore;

// Importar states y funciones del store
const {
    calendario,
    fecha,
    fechaActual,
    dias,
    meses,
    años,
    añoDesde
} = storeToRefs(calendarioCitasStore);

onMounted(() => {
    // Cargar citas desde el store
    calendarioCitasStore.obtenerFecha()
});

const mesActual = ref(parseInt(meses.value) - 1);
const nombreMes = computed(() => calendario.value[años.value - añoDesde.value].meses[mesActual.value].nombre + ' ' + años.value)

// Propiedad para acomodar Dia en el calendario
const diasDelMes = computed(() => {
    const añoIndex = años.value - añoDesde.value;
    const mes = calendario.value[añoIndex].meses[mesActual.value]; // { dias: 30, inicio: 6, etc. }
    const año = años.value;
    const mesNumero = String(mesActual.value + 1).padStart(2, '0');

    // Espacios vacíos antes del primer día del mes
    const espacios = Array(mes.inicio).fill({ dia: null, fecha: null });

    // Generar los días con su fecha completa
    const dias = Array.from({ length: mes.dias }, (_, i) => {
        const dia = String(i + 1).padStart(2, '0');
        return {
            dia: i + 1,
            fecha: `${dia}/${mesNumero}/${año}`
        };
    });

    return [...espacios, ...dias];
});

function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d); // siempre local, sin UTC
}

// Propiedad devuelve array de fechas de todas las citas
const diasConCitas = computed(() => {
    const arrayCitas = [];
    Citas.value.map((cita) => {
        if (cita.estado === 'Inactiva') {
            arrayCitas.push(cita.fecha.split('-').reverse().join('/'))
        }
    })
    return arrayCitas
})

const diasVencidos = computed(() => {
    const arrayCitas = [];
    Citas.value.map((cita) => {
        if (!cita.fechaHasta) {
            cita.fechaHasta = cita.fecha
        }

        const fechaHoyC = parseFechaISO(new Date().toISOString().split('T')[0]);
        const fechaHasta = parseFechaISO(cita.fechaHasta);
        if (cita.estado === 'Inactiva' && fechaHoyC > fechaHasta) {
            arrayCitas.push(cita.fecha.split('-').reverse().join('/'))
        }
    })
    return arrayCitas
})

const citasProximas = computed(() => {
    const arrayCitas = [];
    Citas.value.map((cita) => {
        const fechaHoyC = parseFechaISO(new Date().toISOString().split('T')[0]);
        const fecha = parseFechaISO(cita.fecha);
        if (cita.estado === 'Inactiva' && fecha > fechaHoyC) {
            arrayCitas.push(cita.fecha.split('-').reverse().join('/'))
        }
    })
    return arrayCitas
})

// Navegar entre meses
const anteriorMes = () => {
    if (mesActual.value === 0 && años.value === añoDesde.value) {
        options.position = 'top-end';
        options.texto = "Fecha mínima permitida";
        options.tiempo = 1500
        mensaje()
        return
    }
    if (mesActual.value === 0 && años.value > añoDesde.value) {
        mesActual.value = 11;
        meses.value = 12
        años.value--; // Resta el año si venimos de enero
    } else {
        meses.value--
        mesActual.value--;
    }

    citasStore.citasPorRango(`${años.value}-${meses.value}-01`,`${años.value}-${meses.value}-31`)
};

const siguienteMes = () => {
    if (mesActual.value === 11) {
        mesActual.value = 0;
        meses.value = 1
        años.value++; // Suma el año si avanzamos desde diciembre
    } else {
        mesActual.value++;
        meses.value++
    }
    citasStore.citasPorRango(`${años.value}-${meses.value}-01`,`${años.value}-${meses.value}-31`)
};

</script>

<template>
    <div class="flex flex-col gap-2 ">
        <!-- Calendario principal -->
        <div
            class="flex flex-col gap-5 shadow-md rounded-xl p-5 h-[55vh] overflow-y-auto scrollForm bg-white dark:bg-gray-700 dark:text-white">

            <!-- Header -->
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-semibold">{{ nombreMes }}</h2>
                <div class="flex items-center gap-2">
                    <div @click="anteriorMes"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer">
                        <i class="fa-solid fa-angle-left text-blue-500"></i>
                    </div>
                    <div @click="siguienteMes"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer">
                        <i class="fa-solid fa-angle-right text-blue-500"></i>
                    </div>
                </div>
            </div>

            <!-- Días de la semana -->
            <div class="grid grid-cols-7 gap-3 text-center font-medium text-gray-600 dark:text-gray-300">
                <h2 v-for="dia in diasSemana">{{ dia }}</h2>
            </div>

            <!-- Días del mes -->
            <div class="grid grid-cols-7 gap-3">
                <div v-for="(num, index) in diasDelMes" @click="calendarioCitasStore.cambiarFecha(num.fecha)"
                    class="px-3 py-3 flex justify-center items-center border border-gray-200 dark:border-gray-500 rounded-xl cursor-pointer transition hover:bg-blue-50 dark:hover:bg-gray-600"
                    :class="{
                        'bg-blue-100 dark:bg-blue-700': num.fecha === fecha,
                        'border-2 border-gray-400 !dark:border-gray-600': num.fecha === fechaActual
                    }">
                    <h2 :class="{
                        'border-b-2 border-blue-500': diasConCitas.includes(num.fecha),
                        'text-red-600 dark:text-red-300': diasVencidos?.includes(num.fecha)
                    }">
                        {{ num.dia }}
                    </h2>
                </div>
            </div>
        </div>

        <!-- Footer resumen -->
        <div
            class="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl shadow-md px-4 py-2 flex justify-around items-center">
            <div class="flex flex-col items-center">
                <span class="text-base font-bold text-red-600 dark:text-red-300">{{ diasVencidos.length }}</span>
                <span class="text-xs text-gray-600 dark:text-gray-300">Citas vencidas</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-base font-bold text-blue-600">{{ diasConCitas.length }}</span>
                <span class="text-xs text-gray-600 dark:text-gray-300">Citas pendientes</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-base font-bold text-green-600">{{ citasProximas.length || 0 }}</span>
                <span class="text-xs text-gray-600 dark:text-gray-300">Próximas citas</span>
            </div>
        </div>

    </div>

</template>