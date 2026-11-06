<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';

const exportaciones = useExportacion();
const show = ref(false);

const items = computed(() => exportaciones.cola);
const hayListas = computed(() => exportaciones.listas.length > 0);
const hayFallidas = computed(() => exportaciones.fallidas.length > 0);

const colorBadge = computed(() => {
    if (hayListas.value) return 'bg-green-600'
    if (hayFallidas.value) return 'bg-red-600'
    return 'bg-blue-600'
})

function esActivo(item) {
    return ['pendiente', 'procesando', 'comprimiendo'].includes(item.estado)
}

function porcentaje(item) {
    if (!item.total) return null
    return Math.min(100, Math.round((item.completados / item.total) * 100))
}

function minutosTranscurridos(item) {
    return Math.floor((Date.now() - item.creado) / 60000)
}

function transcurrido(item) {
    const segundos = Math.max(0, Math.floor((Date.now() - item.creado) / 1000))
    if (segundos < 60) return `hace ${segundos} s`
    const mins = Math.floor(segundos / 60)
    if (mins < 60) return `hace ${mins} min`
    const horas = Math.floor(mins / 60)
    return `hace ${horas} h ${mins % 60} min`
}

function fechaCorta(iso) {
    if (!iso) return ''
    const [a, m, d] = iso.split('-')
    return `${d}/${m}/${a}`
}

async function descargar(item) {
    await exportaciones.descargar(item.id)
}

function reintentar(item) {
    exportaciones.reintentar(item.id)
}

function descartar(item) {
    exportaciones.descartar(item.id)
}
</script>

<template>
    <UButton icon="i-lucide-download" color="white" variant="link" size="xs"
        class="text-gray-100 text-xs relative hover:text-white cursor-pointer" @click="show = true">
        Exportaciones
        <span v-if="items.length > 0"
            class="rounded-full text-[8px] w-4 h-4 absolute top-0 left-0 flex justify-center items-center font-semibold text-gray-100"
            :class="colorBadge">
            {{ items.length }}
        </span>
    </UButton>

    <FondoBlur v-if="show">
        <UModal v-model:open="show" :ui="{ width: 'max-w-3xl' }" prevent-close :overlay="false" :transition="true">
            <template #header>
                <div class="w-full flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Exportaciones de PDFs
                        </h3>
                        <p class="text-sm text-gray-500">
                            Tus exportaciones en curso y sus descargas.
                        </p>
                    </div>
                    <div class="flex gap-1">
                        <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="show = false">
                        </UButton>
                    </div>
                </div>
            </template>
            <template #body>
                <UCard>

                    <!-- Estado vacío -->
                    <div v-if="!items.length" class="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <div class="rounded-full bg-blue-50 p-4 text-blue-600">
                            <i class="i-lucide-file-down text-2xl"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">No hay exportaciones</h4>
                            <p class="text-sm text-gray-500">
                                Cuando exportes PDFs desde el historial aparecerán aquí para descargarlos cuando estén
                                listos.
                            </p>
                        </div>
                    </div>

                    <!-- Lista de exportaciones -->
                    <div v-else class="space-y-3">
                        <UCard v-for="item in items" :key="item.id"
                            class="border border-gray-200 dark:border-gray-700"
                            :ui="{ body: { padding: 'p-4' } }">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <i class="fa-solid fa-file-pdf text-blue-500"></i>
                                        {{ item.servicio }}
                                        <span v-if="item.etiqueta" class="text-xs font-normal text-gray-500">
                                            — {{ item.etiqueta }}
                                        </span>
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ fechaCorta(item.rango?.fechaInicio) }} al {{
                                            fechaCorta(item.rango?.fechaFin) }} · iniciada {{ transcurrido(item) }}
                                    </p>
                                </div>

                                <div class="flex items-center gap-2 text-sm">
                                    <template v-if="esActivo(item)">
                                        <UIcon name="i-lucide-loader-circle" class="animate-spin text-blue-500" />
                                        <span class="text-blue-600 dark:text-blue-400 font-medium">
                                            En proceso<template v-if="porcentaje(item) !== null">
                                                — {{ porcentaje(item) }}%</template>
                                        </span>
                                    </template>
                                    <UBadge v-else-if="item.estado === 'lista'" color="success">Lista</UBadge>
                                    <UBadge v-else color="error">Fallida</UBadge>
                                </div>
                            </div>

                            <!-- Progreso -->
                            <div v-if="esActivo(item)" class="mt-3">
                                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div class="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        :style="{ width: (porcentaje(item) ?? 8) + '%' }"></div>
                                </div>
                                <p v-if="minutosTranscurridos(item) >= 5"
                                    class="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                    <i class="fa-solid fa-clock mr-1"></i>
                                    Puede tardar de 10 a 20 minutos según la configuración del servidor. Puedes cerrar
                                    este panel y seguir trabajando.
                                </p>
                            </div>

                            <!-- Acciones -->
                            <div class="mt-3 flex justify-end gap-2">
                                <template v-if="item.estado === 'lista'">
                                    <UButton size="sm" color="neutral" variant="soft" icon="i-lucide-x"
                                        @click="descartar(item)">
                                        Descartar
                                    </UButton>
                                    <UButton size="sm" color="primary" icon="i-lucide-download"
                                        @click="descargar(item)">
                                        Descargar
                                    </UButton>
                                </template>
                                <template v-else-if="item.estado === 'fallida' || item.estado === 'cancelada'">
                                    <UButton size="sm" color="neutral" variant="soft" icon="i-lucide-x"
                                        @click="descartar(item)">
                                        Descartar
                                    </UButton>
                                    <UButton size="sm" color="primary" variant="soft" icon="i-lucide-refresh-cw"
                                        @click="reintentar(item)">
                                        Reintentar
                                    </UButton>
                                </template>
                            </div>
                        </UCard>
                    </div>

                    <!-- Nota -->
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-4 flex items-start gap-1">
                        <i class="fa-solid fa-circle-info mt-0.5"></i>
                        <span>
                            Las exportaciones siguen en proceso aunque cierres este panel; te avisaremos cuando estén
                            listas. Según la configuración del servidor pueden tardar de 10 a 20 minutos.
                        </span>
                    </p>

                </UCard>
            </template>
        </UModal>
    </FondoBlur>
</template>
