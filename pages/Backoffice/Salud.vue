<script setup>
definePageMeta({
    layout: 'backoffice'
});
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficeGet } from '~/Core/Backoffice/BackofficeAPI'

const ruta = useRoute()
const pestana = ref(ruta.query.tab === 'bd' ? 'bd' : 'salud')
const salud = ref(null)
const cargando = ref(false)

async function cargar() {
    cargando.value = true
    const respuesta = await backofficeGet('/salud')
    if (respuesta?.success) salud.value = respuesta
    cargando.value = false
}

const formatoBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
    return `${(bytes / 1073741824).toFixed(2)} GB`
}

onMounted(cargar)
</script>

<template>
    <BackofficeGate titulo="Salud del sistema" subtitulo="Estado del motor, base de datos, disco y cola">
        <div class="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <button @click="pestana = 'salud'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition"
                :class="pestana === 'salud' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'">
                Estado general
            </button>
            <button @click="pestana = 'bd'"
                class="px-4 py-2 rounded-lg text-sm font-medium transition"
                :class="pestana === 'bd' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'">
                Estadísticas de tablas
            </button>
        </div>

        <div v-if="!salud" class="py-16 text-center text-gray-400">{{ cargando ? 'Cargando...' : 'Sin datos' }}</div>

        <template v-else-if="pestana === 'salud'">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <UCard>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-server" class="text-primary" />
                        <p class="text-xs text-gray-500 uppercase">Motor</p>
                    </div>
                    <p class="text-lg font-bold mt-2">PHP {{ salud.php }}</p>
                    <p class="text-xs text-gray-500">Laravel {{ salud.laravel }} · {{ salud.entorno }}</p>
                </UCard>
                <UCard>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-database" class="text-primary" />
                        <p class="text-xs text-gray-500 uppercase">Base de datos</p>
                    </div>
                    <p class="text-lg font-bold mt-2" :class="salud.base_datos.conectada ? 'text-green-600' : 'text-red-600'">
                        {{ salud.base_datos.conectada ? 'Conectada' : 'Desconectada' }}
                    </p>
                    <p class="text-xs text-gray-500">{{ salud.base_datos.conexion }} · {{ salud.base_datos.nombre }}</p>
                </UCard>
                <UCard>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-hard-drive" class="text-primary" />
                        <p class="text-xs text-gray-500 uppercase">Disco</p>
                    </div>
                    <p class="text-lg font-bold mt-2">{{ salud.disco.uso_pct ?? '—' }}% en uso</p>
                    <p class="text-xs text-gray-500">Libre: {{ formatoBytes(salud.disco.libre_bytes) }} de {{ formatoBytes(salud.disco.total_bytes) }}</p>
                </UCard>
                <UCard>
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-list-tree" class="text-primary" />
                        <p class="text-xs text-gray-500 uppercase">Cola</p>
                    </div>
                    <p class="text-lg font-bold mt-2">{{ salud.cola.pendientes ?? '—' }} pendientes</p>
                    <p class="text-xs text-gray-500">{{ salud.cola.fallidos ?? '—' }} fallidos · {{ salud.cola.conexion }}</p>
                </UCard>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Log principal</p>
                    <p class="text-lg font-bold mt-2">{{ formatoBytes(salud.log.bytes) }}</p>
                    <p class="text-xs text-gray-500">{{ salud.log.ruta }}</p>
                </UCard>
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Cache</p>
                    <p class="text-lg font-bold mt-2">{{ salud.cache }}</p>
                </UCard>
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Servidor</p>
                    <p class="text-sm font-semibold mt-2 truncate">{{ salud.servidor }}</p>
                    <p class="text-xs text-gray-500">Debug: {{ salud.debug ? 'ON' : 'OFF' }}</p>
                </UCard>
            </div>
        </template>

        <template v-else>
            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                        <tr>
                            <th class="px-4 py-3 text-left">Tabla</th>
                            <th class="px-4 py-3 text-right">Registros</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        <tr v-for="(conteo, tabla) in salud.tablas" :key="tabla" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="px-4 py-3"><code class="text-xs">{{ tabla }}</code></td>
                            <td class="px-4 py-3 text-right font-medium">
                                {{ conteo === null ? '—' : new Intl.NumberFormat('es-CO').format(conteo) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </BackofficeGate>
</template>
