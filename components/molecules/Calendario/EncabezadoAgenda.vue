<script setup>
import SelectorVista from './SelectorVista.vue'

const props = defineProps({
    vista: {
        type: String,
        required: true,
    },
    infoCitas: {
        type: Object,
        default: () => ({}),
    },
    puedeAgendar: {
        type: Boolean,
        default: false,
    },
    puedeVerSelector: {
        type: Boolean,
        default: true,
    },
    actualizando: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:vista', 'agendar', 'actualizar'])

const metricas = computed(() => [
    {
        clave: 'total',
        valor: props.infoCitas?.citas_total,
        label: 'Total de citas',
        icono: 'i-lucide-calendar-days',
        color: 'text-blue-600 dark:text-blue-300',
        fondo: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
        clave: 'pendientes',
        valor: props.infoCitas?.citas_pendientes,
        label: 'Pendientes',
        icono: 'i-lucide-clock',
        color: 'text-amber-600 dark:text-amber-300',
        fondo: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
        clave: 'vencidas',
        valor: props.infoCitas?.citas_vencidas,
        label: 'Vencidas',
        icono: 'i-lucide-clock-alert',
        color: 'text-red-600 dark:text-red-300',
        fondo: 'bg-red-50 dark:bg-red-900/30',
    },
    {
        clave: 'realizadas',
        valor: props.infoCitas?.citas_realizadas,
        label: 'Finalizadas',
        icono: 'i-lucide-circle-check',
        color: 'text-green-600 dark:text-green-300',
        fondo: 'bg-green-50 dark:bg-green-900/30',
    },
])
</script>

<template>
    <header class="mb-5">
        <div class="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
            <!-- Izquierda: identidad del módulo -->
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-12 h-12 rounded-xl bg-(--color-default) flex items-center justify-center shadow-lg shrink-0">
                    <UIcon name="i-lucide-calendar-days" class="text-white text-xl" />
                </div>
                <div class="min-w-0">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        Agenda
                    </h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                        Administra tus citas y organiza tu jornada de atención.
                    </p>
                </div>
            </div>

            <!-- Centro: métricas compactas -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 xl:mx-auto">
                <div v-for="m in metricas" :key="m.clave"
                    class="flex items-center gap-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm px-3 py-2 min-w-0">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="m.fondo">
                        <UIcon :name="m.icono" class="size-4" :class="m.color" />
                    </div>
                    <div class="min-w-0">
                        <p class="text-base font-bold leading-tight" :class="m.color">
                            {{ m.valor ?? '—' }}
                        </p>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">{{ m.label }}</p>
                    </div>
                </div>
            </div>

            <!-- Derecha: acciones rápidas -->
            <div class="flex items-center gap-2 flex-wrap">
                <UButton v-if="puedeAgendar" icon="i-lucide-plus" label="Agendar cita" color="primary"
                    @click="emit('agendar')" />
                <UButton icon="i-lucide-refresh-cw" color="primary" variant="soft" aria-label="Actualizar agenda"
                    title="Actualizar agenda" :loading="actualizando"
                    @click="emit('actualizar')" />
                </div>
            </div>
            <SelectorVista v-if="puedeVerSelector" :model-value="vista"
                @update:model-value="emit('update:vista', $event)" class="mt-3"/>
    </header>
</template>
