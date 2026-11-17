<script setup>
definePageMeta({
    layout: 'backoffice'
});
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficeGet, backofficePost } from '~/Core/Backoffice/BackofficeAPI'

const notificaciones = useNotificacionesStore()

const pestana = ref('trabajos')
const cola = ref({ pendientes: 0, reservados: 0, por_cola: [] })
const fallidos = ref([])
const exportaciones = ref([])
const capacidad = ref(null)
const detalle = ref(null)
const cargando = ref(false)

onMounted(async () => {
    const ruta = useRoute()
    if (ruta.query.tab === 'exportaciones') pestana.value = 'exportaciones'
    await cargar()
})

async function cargar() {
    cargando.value = true
    if (pestana.value === 'trabajos') {
        const respuesta = await backofficeGet('/trabajos')
        if (respuesta?.success) {
            cola.value = respuesta.cola
            fallidos.value = respuesta.fallidos
        }
    } else {
        const respuesta = await backofficeGet('/exportaciones')
        if (respuesta?.success) {
            exportaciones.value = respuesta.data
            capacidad.value = respuesta.capacidad
        }
    }
    cargando.value = false
}

function cambiarPestana(valor) {
    pestana.value = valor
    cargar()
}

async function reintentar(id) {
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Reintentar trabajo?',
        html: 'Se volverá a encolar el trabajo fallido seleccionado.',
        confirmtext: 'Sí, reintentar',
        canceltext: 'Cancelar'
    }
    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    const resultado = await backofficePost(`/trabajos/failed/${id}/reintentar`)
    if (resultado?.success) {
        notificaciones.options = { icono: 'success', titulo: 'Trabajo reencolado', texto: `Exportación ${resultado.export_id} en cola.`, tiempo: 3000 }
        await notificaciones.simple()
        await cargar()
    }
}

const colorEstado = (estado) => ({
    pendiente: 'neutral', procesando: 'info', completado: 'success',
    error: 'error', vacia: 'warning'
}[estado] || 'neutral')
</script>

<template>
    <BackofficeGate titulo="Trabajos" subtitulo="Colas de trabajos, jobs fallidos y exportaciones">
        <div class="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
            <button @click="cambiarPestana('trabajos')"
                class="px-4 py-2 rounded-lg text-sm font-medium transition"
                :class="pestana === 'trabajos' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'">
                Cola y fallidos
            </button>
            <button @click="cambiarPestana('exportaciones')"
                class="px-4 py-2 rounded-lg text-sm font-medium transition"
                :class="pestana === 'exportaciones' ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'">
                Exportaciones
            </button>
        </div>

        <template v-if="pestana === 'trabajos'">
            <div class="grid gap-4 sm:grid-cols-3">
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Pendientes</p>
                    <p class="text-3xl font-bold">{{ cola.pendientes }}</p>
                </UCard>
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">En ejecución</p>
                    <p class="text-3xl font-bold">{{ cola.reservados }}</p>
                </UCard>
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Fallidos</p>
                    <p class="text-3xl font-bold text-red-600">{{ fallidos.length }}</p>
                </UCard>
            </div>

            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                        <tr>
                            <th class="px-4 py-3 text-left">ID</th>
                            <th class="px-4 py-3 text-left">Trabajo</th>
                            <th class="px-4 py-3 text-left">Excepción</th>
                            <th class="px-4 py-3 text-left">Fecha</th>
                            <th class="px-4 py-3 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        <tr v-for="trabajo in fallidos" :key="trabajo.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="px-4 py-3">{{ trabajo.id }}</td>
                            <td class="px-4 py-3 text-xs"><code>{{ trabajo.displayName }}</code></td>
                            <td class="px-4 py-3 max-w-md truncate">{{ trabajo.exception }}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-xs">{{ trabajo.failed_at }}</td>
                            <td class="px-4 py-3 flex gap-1">
                                <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="soft" @click="detalle = trabajo" />
                                <UButton icon="i-lucide-rotate-cw" size="xs" color="warning" variant="soft" @click="reintentar(trabajo.id)" />
                            </td>
                        </tr>
                        <tr v-if="!fallidos.length">
                            <td colspan="5" class="px-4 py-8 text-center text-gray-400">{{ cargando ? 'Cargando...' : 'Sin trabajos fallidos' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <template v-else>
            <div v-if="capacidad" class="grid gap-4 sm:grid-cols-4">
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Activas</p>
                    <p class="text-3xl font-bold">{{ capacidad.active_exports }}</p>
                </UCard>
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Máximo</p>
                    <p class="text-3xl font-bold">{{ capacidad.max_exports }}</p>
                </UCard>
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Cupos libres</p>
                    <p class="text-3xl font-bold text-green-600">{{ capacidad.available_slots }}</p>
                </UCard>
                <UCard>
                    <p class="text-xs text-gray-500 uppercase">Disponible</p>
                    <p class="text-3xl font-bold" :class="capacidad.can_export ? 'text-green-600' : 'text-red-600'">
                        {{ capacidad.can_export ? 'Sí' : 'No' }}
                    </p>
                </UCard>
            </div>

            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                        <tr>
                            <th class="px-4 py-3 text-left">ID</th>
                            <th class="px-4 py-3 text-left">Servicio</th>
                            <th class="px-4 py-3 text-left">Estado</th>
                            <th class="px-4 py-3 text-left">Progreso</th>
                            <th class="px-4 py-3 text-left">Archivo</th>
                            <th class="px-4 py-3 text-left">Creada</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        <tr v-for="exp in exportaciones" :key="exp.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="px-4 py-3">{{ exp.id }}</td>
                            <td class="px-4 py-3">{{ exp.servicio }}</td>
                            <td class="px-4 py-3">
                                <UBadge :color="colorEstado(exp.estado)" variant="soft" size="sm">{{ exp.estado }}</UBadge>
                            </td>
                            <td class="px-4 py-3">{{ exp.completados }}/{{ exp.total }}</td>
                            <td class="px-4 py-3 text-xs">{{ exp.zip_name || '—' }}</td>
                            <td class="px-4 py-3 whitespace-nowrap text-xs">{{ exp.created_at }}</td>
                        </tr>
                        <tr v-if="!exportaciones.length">
                            <td colspan="6" class="px-4 py-8 text-center text-gray-400">{{ cargando ? 'Cargando...' : 'Sin exportaciones' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <UModal v-model:open="detalle" :ui="{ width: 'max-w-2xl' }">
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <h3 class="text-lg font-semibold">Trabajo fallido #{{ detalle?.id }}</h3>
                    <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="detalle = null" />
                </div>
            </template>
            <template #body>
                <div v-if="detalle" class="space-y-3 text-sm">
                    <p><span class="font-semibold">Cola:</span> {{ detalle.queue }}</p>
                    <p><span class="font-semibold">UUID:</span> <code class="text-xs">{{ detalle.uuid }}</code></p>
                    <p><span class="font-semibold">Fecha:</span> {{ detalle.failed_at }}</p>
                    <p class="font-semibold">Excepción</p>
                    <pre class="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs overflow-auto max-h-96">{{ detalle.exception }}</pre>
                </div>
            </template>
        </UModal>
    </BackofficeGate>
</template>
