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

function irHistorial(cita) {
    navigateTo({ path: '/Historial', query: { paciente: cita.id_paciente } });
}
</script>
<template>
    <UCard class="overflow-hidden hover:shadow-lg transition-all duration-200">
        <div class="flex">
            <!-- Barra de estado (escaneo rápido) -->
            <div class="w-1.5 shrink-0 rounded-l-md"
                :class="vencida(cita) && cita.estado === 'Inactiva'
                    ? 'bg-red-500'
                    : cita.estado === 'Inactiva' ? 'bg-amber-400'
                        : cita.estado === 'cancelada' ? 'bg-gray-400' : 'bg-green-500'">
            </div>

            <div class="w-full pl-3">
                <div class="flex justify-between items-start gap-2">
                    <!-- Información principal -->
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-2xl font-bold leading-none"
                                :class="vencida(cita) && cita.estado === 'Inactiva' ? 'text-red-600 dark:text-red-300' : 'text-(--color-default)'">
                                {{ cita.hora === '00:00:00' ? (cita.fechaHasta ? cita.fechaHasta.substring(5, 10) : '') : cita.hora ?
                                    cita.hora.substring(0, 5) : '—' }}
                            </span>
                            <UBadge
                                :color="vencida(cita) && cita.estado === 'Inactiva' ? 'error' : cita.estado === 'Inactiva' ? 'warning' : cita.estado === 'cancelada' ? 'neutral' : 'success'"
                                variant="soft">
                                {{ vencida(cita) && cita.estado === 'Inactiva' ? 'Vencida' : cita.estado === 'Inactiva' ?
                                    'Pendiente' : cita.estado === 'cancelada' ? 'Cancelada' : 'Realizada' }}
                            </UBadge>
                            <UBadge color="neutral" variant="subtle">
                                #{{ cita.id }}
                            </UBadge>
                        </div>
                        <p class="text-xs text-gray-500 mt-0.5">
                            {{ props.Propiedades.showTodas ? cita.fecha : fechaCita }}
                        </p>
                        <h3 class="font-semibold text-base truncate mt-1.5">
                            {{ cita.paciente?.info_usuario?.name || 'Paciente' }}
                        </h3>
                        <p class="text-sm text-gray-500 truncate">
                            {{ cita.servicio?.name || 'Servicio' }}
                        </p>
                        <div class="space-y-0.5 text-sm text-gray-500 mt-1.5">
                            <div class="flex items-center gap-2 truncate">
                                <UIcon name="i-lucide-user" class="size-3.5 shrink-0" />
                                <span class="truncate">{{ cita.profesional?.info_usuario?.name || 'Profesional' }}</span>
                            </div>
                            <div class="flex items-center gap-2 truncate">
                                <UIcon name="i-lucide-heart" class="size-3.5 shrink-0" />
                                <span class="truncate">{{ cita.motivo }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="flex flex-col justify-center gap-1 pl-2 border-l border-gray-200 dark:border-gray-700 w-11 shrink-0">
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
                            <NuxtLink v-if="cita.id_analisis" :to="`/Historial/${cita.id_analisis}`"
                                title="Ver historia clínica">
                                <UButton icon="i-lucide-file-heart" color="primary" variant="ghost" square />
                            </NuxtLink>
                            <NuxtLink v-else @click="irHistorial(cita)"
                                title="Ver historia clínica">
                                <UButton icon="i-lucide-file" color="primary" variant="ghost" square />
                            </NuxtLink>
                            <UButton icon="i-lucide-info" color="primary" variant="ghost" square
                                @click="showObservacion(cita)" />
                        </div>
                        <div v-else-if="cita.estado === 'cancelada'">
                            <UButton icon="i-lucide-info" color="neutral" variant="ghost" square
                                @click="showMotivoCancelacion(cita)" />
                        </div>
                        <div v-else></div>
                    </div>
                </div>
            </div>
        </div>
    </UCard>
</template>