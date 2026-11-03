<script setup>
import { computed } from 'vue';

// Panel de métricas de la agenda.
// Se calcula del array de citas ya cargado (mismo universo visible),
// por lo que es consistente con el calendario/lista y funciona sin
// depender del endpoint infoCitas (restringido al rol Profesional).
const props = defineProps({
    infoCitas: {
        type: Array,
        default: () => []
    }
});

const hoyISO = new Date().toISOString().split('T')[0];

const metricas = computed(() => {
    const lista = props.citas || [];
    let pendientes = 0;
    let vencidas = 0;
    let realizadas = 0;
    let canceladas = 0;

    lista.forEach((cita) => {
        if (cita.estado === 'cancelada') {
            canceladas++;
            return;
        }
        if (cita.estado === 'Realizada') {
            realizadas++;
            return;
        }
        if (cita.estado === 'Inactiva') {
            const hasta = cita.fechaHasta || cita.fecha;
            if (hasta && hasta < hoyISO) {
                vencidas++;
            } else {
                pendientes++;
            }
        }
    });

    return [
        {
            clave: 'total',
            valor: props.infoCitas.citas_total,
            label: 'Citas cargadas',
            icono: 'i-lucide-calendar-days',
            color: 'text-blue-600 dark:text-blue-300',
            fondo: 'bg-blue-50 dark:bg-blue-900/30'
        },
        {
            clave: 'pendientes',
            valor: props.infoCitas.citas_pendientes,
            label: 'Pendientes',
            icono: 'i-lucide-clock',
            color: 'text-amber-600 dark:text-amber-300',
            fondo: 'bg-amber-50 dark:bg-amber-900/30'
        },
        {
            clave: 'vencidas',
            valor: props.infoCitas.citas_vencidas,
            label: 'Vencidas',
            icono: 'i-lucide-clock-alert',
            color: 'text-red-600 dark:text-red-300',
            fondo: 'bg-red-50 dark:bg-red-900/30'
        },
        {
            clave: 'realizadas',
            valor: props.infoCitas.citas_realizadas,
            label: 'Realizadas',
            icono: 'i-lucide-circle-check',
            color: 'text-green-600 dark:text-green-300',
            fondo: 'bg-green-50 dark:bg-green-900/30'
        }
    ];
});
</script>

<template>
    <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div v-for="m in metricas" :key="m.clave"
            class="flex items-center gap-3 rounded-xl shadow-md bg-white dark:bg-gray-700 px-4 py-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :class="m.fondo">
                <UIcon :name="m.icono" class="size-5" :class="m.color" />
            </div>
            <div class="min-w-0">
                <p class="text-xl font-bold leading-tight" :class="m.color">{{ m.valor }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-300 truncate">{{ m.label }}</p>
            </div>
        </div>
    </div>
</template>
