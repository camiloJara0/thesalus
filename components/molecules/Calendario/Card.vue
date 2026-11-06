<script setup>
import { computed } from 'vue';
import { useCitaActions } from '~/composables/Entidades/Cita';
import { storeToRefs } from 'pinia';
import { useHistoriaStore } from '~/stores/Entidades/Historia';
import { estadoDeCita, esVencida, railEstado } from '~/data/estadosCita';

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
} = storeToRefs(calendarioCitasStore);

const {
    cancelarCita,
    activarCita,
    actualizarCita,
    showMotivoCancelacion,
    showMotivoEdicion,
    showObservacion,
    actualizarHistoria
} = useCitaActions({
    fecha
})

const estado = computed(() => estadoDeCita(props.cita))
const rail = computed(() => railEstado(props.cita))
const vencida = computed(() => esVencida(props.cita))

// Hora de la cita (conserva la lógica existente para citas sin hora)
const hora = computed(() => {
    const cita = props.cita
    if (cita.hora === '00:00:00') return cita.fechaHasta ? cita.fechaHasta.substring(5, 10) : ''
    return cita.hora ? cita.hora.substring(0, 5) : '—'
})

// Fecha visible: 'Hoy' si la cita es de hoy, si no, dd/mm
const fechaLabel = computed(() => {
    const cita = props.cita
    if (props.Propiedades?.showTodas) return cita.fecha || ''
    if (!cita.fecha) return ''
    if (cita.fecha === fechaActualToISO()) return 'Hoy'
    const [a, m, d] = cita.fecha.split('-')
    return `${d}-${m}`
})

function fechaActualToISO() {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

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
    <article
        class="group flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-shadow duration-150 hover:shadow-md hover:border-(--color-default)/40 min-h-12">
        <!-- Barra de estado (escaneo rápido) -->
        <div class="w-1.5 shrink-0 transition-colors" :class="rail"></div>

        <div class="flex-1 min-w-0 p-3">
            <!-- Fila superior: hora · paciente · estado -->
            <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg font-bold tabular-nums leading-none shrink-0"
                        :class="vencida ? 'text-red-600 dark:text-red-300' : 'text-(--color-default)'">
                        {{ fechaLabel }}
                    </span>
                    <h3 class="font-semibold text-sm truncate" :class="estado.tachado ? 'line-through' : ''">
                        {{ props.cita.paciente?.info_usuario?.name || 'Paciente' }}
                    </h3>
                </div>
                <UBadge :color="estado.badge" :variant="estado.variant" size="sm" class="shrink-0">
                    {{ estado.label }}
                </UBadge>
            </div>

            <!-- Fila secundaria: servicio · profesional -->
            <div class="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                <UIcon name="i-lucide-stethoscope" class="size-3.5 shrink-0" />
                <span class="truncate">{{ props.cita.servicio?.name || 'Servicio' }}</span>
                <span class="opacity-40 shrink-0">·</span>
                <UIcon name="i-lucide-user" class="size-3.5 shrink-0" />
                <span class="truncate">{{ props.cita.profesional?.info_usuario?.name || 'Profesional' }}</span>
            </div>

            <!-- Meta: motivo + fecha/id -->
            <div class="mt-1 flex items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-500">
                <span class="truncate">{{ props.cita.motivo || '' }}</span>
                <span class="shrink-0 tabular-nums">
                    {{ hora }}
                    <span v-if="hora" class="opacity-60"> · </span>
                    #{{ props.cita.id }}
                </span>
            </div>
        </div>

        <!-- Acciones -->
        <div
            class="flex flex-col items-center justify-center gap-0.5 px-1.5 border-l border-gray-100 dark:border-gray-700 shrink-0">
            <div v-if="props.cita.estado === 'Inactiva'">
                <UButton icon="i-lucide-square-pen" color="neutral" variant="ghost" square size="sm"
                    aria-label="Editar cita" @click="actualizarCita(props.cita)" />
                <UButton icon="i-lucide-circle-x" color="error" variant="ghost" square size="sm" aria-label="Cancelar cita"
                    @click="cancelarCita(props.cita)" />
                <UButton v-if="citaPendiente(props.cita.id)" icon="i-lucide-check" color="success" variant="soft" square
                    size="sm" aria-label="Continuar historia" @click="actualizarHistoria(historiaPendiente(props.cita.id))" />
                <UButton v-else icon="i-lucide-check" color="success" variant="soft" square size="sm"
                    aria-label="Realizar cita" @click="activarCita(props.cita)" />
                <UButton v-if="props.cita.motivo_edicion" icon="i-lucide-info" color="warning" variant="ghost" square
                    size="sm" aria-label="Ver motivo de edición" @click="showMotivoEdicion(props.cita)" />
            </div>
            <div v-else-if="props.cita.estado === 'Realizada'">
                <NuxtLink v-if="props.cita.id_analisis" :to="`/Historial/${props.cita.id_analisis}`"
                    title="Ver historia clínica">
                    <UButton icon="i-lucide-file-heart" color="primary" variant="ghost" square size="sm" />
                </NuxtLink>
                <NuxtLink v-else @click="irHistorial(props.cita)" title="Ver historia clínica">
                    <UButton icon="i-lucide-file" color="primary" variant="ghost" square size="sm" />
                </NuxtLink>
                <UButton icon="i-lucide-info" color="primary" variant="ghost" square size="sm"
                    aria-label="Ver observación" @click="showObservacion(props.cita)" />
            </div>
            <div v-else-if="props.cita.estado === 'cancelada'">
                <UButton icon="i-lucide-info" color="neutral" variant="ghost" square size="sm"
                    aria-label="Ver motivo de cancelación" @click="showMotivoCancelacion(props.cita)" />
            </div>
        </div>
    </article>
</template>
