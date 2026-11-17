<script setup>
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficeGet } from '~/Core/Backoffice/BackofficeAPI'

const desde = ref('')
const hasta = ref('')
const rango = ref(null)
const serie = ref([])
const resumen = ref(null)
const cargando = ref(false)

async function cargar() {
    cargando.value = true
    const params = new URLSearchParams()
    if (desde.value) params.set('desde', desde.value)
    if (hasta.value) params.set('hasta', hasta.value)
    const sufijo = params.toString() ? `?${params.toString()}` : ''

    const respuesta = await backofficeGet(`/metricas${sufijo}`)
    if (respuesta?.success) {
        rango.value = respuesta.rango
        serie.value = respuesta.serie
        resumen.value = respuesta.resumen
    }
    cargando.value = false
}

const formato = (n) => new Intl.NumberFormat('es-CO').format(n ?? 0)

onMounted(cargar)
</script>

<template>
    <BackofficeGate titulo="Métricas" subtitulo="Solicitudes, errores y latencia de la API por día">
        <div class="flex flex-wrap items-end gap-3">
            <div>
                <label class="text-xs font-medium text-gray-500">Desde</label>
                <input v-model="desde" type="date"
                    class="block rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <div>
                <label class="text-xs font-medium text-gray-500">Hasta</label>
                <input v-model="hasta" type="date"
                    class="block rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <UButton label="Aplicar" icon="i-lucide-filter" size="sm" @click="cargar" />
            <span v-if="rango" class="text-xs text-gray-500 pb-2">{{ rango.desde }} → {{ rango.hasta }}</span>
        </div>

        <div v-if="resumen" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <UCard>
                <p class="text-xs text-gray-500 uppercase">Solicitudes</p>
                <p class="text-3xl font-bold">{{ formato(resumen.solicitudes) }}</p>
            </UCard>
            <UCard>
                <p class="text-xs text-gray-500 uppercase">Errores 4xx</p>
                <p class="text-3xl font-bold text-amber-600">{{ formato(resumen.errores_4xx) }}</p>
            </UCard>
            <UCard>
                <p class="text-xs text-gray-500 uppercase">Errores 5xx</p>
                <p class="text-3xl font-bold text-red-600">{{ formato(resumen.errores_5xx) }}</p>
            </UCard>
            <UCard>
                <p class="text-xs text-gray-500 uppercase">Tasa de error</p>
                <p class="text-3xl font-bold">{{ resumen.tasa_error_pct }}%</p>
            </UCard>
            <UCard>
                <p class="text-xs text-gray-500 uppercase">Latencia promedio</p>
                <p class="text-3xl font-bold">{{ formato(resumen.latencia_promedio_ms) }} <span class="text-sm font-normal">ms</span></p>
            </UCard>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                        <th class="px-4 py-3 text-left">Fecha</th>
                        <th class="px-4 py-3 text-right">Solicitudes</th>
                        <th class="px-4 py-3 text-right">Errores 4xx</th>
                        <th class="px-4 py-3 text-right">Errores 5xx</th>
                        <th class="px-4 py-3 text-right">Latencia prom.</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr v-for="fila in serie" :key="fila.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td class="px-4 py-3 whitespace-nowrap">{{ fila.fecha }}</td>
                        <td class="px-4 py-3 text-right">{{ formato(fila.solicitudes) }}</td>
                        <td class="px-4 py-3 text-right">{{ formato(fila.errores_4xx) }}</td>
                        <td class="px-4 py-3 text-right">{{ formato(fila.errores_5xx) }}</td>
                        <td class="px-4 py-3 text-right">{{ formato(fila.latencia_promedio_ms) }} ms</td>
                    </tr>
                    <tr v-if="!serie.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">{{ cargando ? 'Cargando...' : 'Sin datos en el rango seleccionado' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </BackofficeGate>
</template>
