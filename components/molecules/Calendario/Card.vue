<script setup>
import { computed } from 'vue';
import { useCitaActions } from '~/composables/Entidades/Cita';
import { storeToRefs } from 'pinia';
import { useHistoriaStore } from '~/stores/Entidades/Historia';

const calendarioCitasStore = useCalendarioCitas()
const historiasStore = useHistoriaStore()
const props = defineProps({
    cita: {
        type: Object,
        required: true
    },
    Propiedades: {
        type: Object
    }
});

const {
    fechaActual,
    fecha,
    dias,
    meses,
} = storeToRefs(calendarioCitasStore);

const {
    cancelarCita,
    activarCita,
    actualizarCita,
    showMotivoCancelacion,
    showMotivoEdicion,
    showObservacion,
    parseFechaISO,
    actualizarHistoria
} = useCitaActions({
    fecha
})

function vencida(cita) {
    if (!cita.fechaHasta) {
        cita.fechaHasta = cita.fecha
    }

    const now = new Date()
    const fechaHoy = parseFechaISO(now.toISOString().split('T')[0])
    const fechaHasta = parseFechaISO(cita.fechaHasta)

    return fechaHoy > fechaHasta
}

const fechaCita = computed(() => {
    if (fechaActual.value === fecha.value) {
        return 'Hoy'
    } else {
        return `${fecha.value.split('-')[0]}`
    }
});

// Función para verificar si una cita es pendiente
function citaPendiente(id) {
    return historiasStore.NoEnviados?.some(analisis => analisis.Cita.id === id);
}

// Función para obtener la historia pendiente asociada a una cita
function historiaPendiente(id) {
    return historiasStore.NoEnviados?.find(analisis => analisis.Cita.id === id);
}
</script>
<template>
    <UCard class=" overflow-hidden hover:shadow-lg transition-all duration-200">
        <div class="flex">
            <div class="w-full">

                <div class="flex justify-between items-center mr-2">
                    <UBadge
                        :color="vencida(cita) && cita.estado === 'Inactiva' ? 'warning' : cita.estado === 'Inactiva' ? 'neutral' : 'success'"
                        variant="soft">
                        {{ vencida(cita) && cita.estado === 'Inactiva' ? 'Vencida' : cita.estado === 'Inactiva' ?
                            'Pendiente' : 'Realizada' }}
                    </UBadge>
                        <UBadge color="neutral" variant="soft">
                            {{ cita.id }}
                        </UBadge>
                </div>

                <div class="flex flex-col">
                    <span class="text-2xl font-bold text-primary">
                        {{ cita.hora === '00:00:00' ? cita.fechaHasta.substring(5, 11) : cita.hora ?
                            cita.hora.substring(0, 5) : '' }}
                    </span>

                    <span class="text-xs text-gray-500">
                        {{ props.Propiedades.showTodas ? cita.fecha : fechaCita }}
                    </span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-base truncate">
                        {{ cita.paciente?.info_usuario?.name || 'Paciente' }}
                    </h3>

                    <p class="text-sm text-gray-500">
                        {{ cita.servicio?.name || 'Servicio' }}
                    </p>
                </div>
                <div class="space-y-1 text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-user" />
                        {{ cita.profesional?.info_usuario?.name || 'Profesional' }}
                    </div>

                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-heart" />
                        {{ cita.motivo }}
                    </div>
                </div>
            </div>
            <div class="flex flex-col justify-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700 w-13">
                <div v-if="cita.estado === 'Inactiva'">
                    <UButton icon="i-lucide-square-pen" color="neutral" variant="ghost" square
                        @click="actualizarCita(cita)" auto-load />
                    <UButton icon="i-lucide-circle-x" color="error" variant="ghost" square @click="cancelarCita(cita)"
                        auto-load />
                    <UButton v-if="citaPendiente(cita.id)" icon="i-lucide-check" color="success" variant="soft" square
                        @click="actualizarHistoria(historiaPendiente(cita.id))" />
                    <UButton v-else icon="i-lucide-check" color="success" variant="soft" square
                        @click="activarCita(cita)" />
                    <UButton v-if="cita.motivo_edicion" icon="i-lucide-info" color="warning" variant="ghost" square
                        @click="showMotivoEdicion(cita)" />
                </div>
                <div v-else-if="cita.estado === 'Realizada'">
                    <UButton icon="i-lucide-info" color="primary" variant="ghost" square
                        @click="showObservacion(cita)" />
                </div>
                <div v-else></div>
            </div>
        </div>
    </UCard>
</template>