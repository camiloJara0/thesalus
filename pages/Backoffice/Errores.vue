<script setup>
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficeGet, backofficeDelete } from '~/Core/Backoffice/BackofficeAPI'

const notificaciones = useNotificacionesStore()

const nivel = ref('')
const desde = ref('')
const hasta = ref('')
const pagina = ref(1)
const errores = ref([])
const ultimaPagina = ref(1)
const total = ref(0)
const seleccionado = ref(null)
const cargando = ref(false)

const niveles = [
    { label: 'Todos', value: '' },
    { label: 'Error', value: 'error' },
    { label: 'Critical', value: 'critical' },
    { label: 'Warning', value: 'warning' }
]

function consulta() {
    const params = new URLSearchParams()
    if (nivel.value) params.set('level', nivel.value)
    if (desde.value) params.set('desde', desde.value)
    if (hasta.value) params.set('hasta', hasta.value)
    params.set('page', String(pagina.value))
    return `?${params.toString()}`
}

async function cargar() {
    cargando.value = true
    const respuesta = await backofficeGet(`/errores${consulta()}`)
    if (respuesta?.data) {
        errores.value = respuesta.data.data || []
        pagina.value = respuesta.data.current_page || 1
        ultimaPagina.value = respuesta.data.last_page || 1
        total.value = respuesta.data.total || 0
    }
    cargando.value = false
}

function buscar() {
    pagina.value = 1
    cargar()
}

async function purgar() {
    const filtros = []
    if (nivel.value) filtros.push(`level=${nivel.value}`)
    if (desde.value) filtros.push(`desde=${desde.value}`)
    if (hasta.value) filtros.push(`hasta=${hasta.value}`)

    if (!filtros.length) {
        notificaciones.options = { icono: 'warning', titulo: 'Filtro requerido', texto: 'Indica al menos un nivel o rango de fechas para purgar.', tiempo: 4000 }
        await notificaciones.simple()
        return
    }

    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Purgar errores?',
        html: 'Se eliminarán los registros de error_logs que coincidan con el filtro actual.',
        confirmtext: 'Sí, purgar',
        canceltext: 'Cancelar'
    }
    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    const resultado = await backofficeDelete(`/errores?${filtros.join('&')}`)
    if (resultado?.success) {
        notificaciones.options = { icono: 'success', titulo: 'Purga realizada', texto: `${resultado.eliminados} registro(s) eliminados.`, tiempo: 3000 }
        await notificaciones.simple()
        seleccionado.value = null
        await cargar()
    }
}

onMounted(cargar)
</script>

<template>
    <BackofficeGate titulo="Errores" subtitulo="Monitor de excepciones capturadas por el sistema">
        <div class="flex flex-wrap items-end gap-3">
            <div>
                <label class="text-xs font-medium text-gray-500">Nivel</label>
                <select v-model="nivel" @change="buscar"
                    class="block w-40 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                    <option v-for="n in niveles" :key="n.value" :value="n.value">{{ n.label }}</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-medium text-gray-500">Desde</label>
                <input v-model="desde" type="date" @change="buscar"
                    class="block rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <div>
                <label class="text-xs font-medium text-gray-500">Hasta</label>
                <input v-model="hasta" type="date" @change="buscar"
                    class="block rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <UButton label="Buscar" icon="i-lucide-search" size="sm" @click="buscar" />
            <UButton label="Purgar" icon="i-lucide-trash-2" color="error" variant="soft" size="sm" @click="purgar" />
        </div>

        <div class="flex items-center justify-between text-sm text-gray-500">
            <span>{{ total }} registro(s)</span>
            <div class="flex items-center gap-2">
                <UButton icon="i-lucide-chevron-left" size="xs" color="neutral" variant="soft" :disabled="pagina <= 1"
                    @click="pagina--; cargar()" />
                <span>Página {{ pagina }} de {{ ultimaPagina }}</span>
                <UButton icon="i-lucide-chevron-right" size="xs" color="neutral" variant="soft" :disabled="pagina >= ultimaPagina"
                    @click="pagina++; cargar()" />
            </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                        <th class="px-4 py-3 text-left">ID</th>
                        <th class="px-4 py-3 text-left">Nivel</th>
                        <th class="px-4 py-3 text-left">Mensaje</th>
                        <th class="px-4 py-3 text-left">Fecha</th>
                        <th class="px-4 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr v-for="error in errores" :key="error.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td class="px-4 py-3">{{ error.id }}</td>
                        <td class="px-4 py-3">
                            <UBadge :color="error.level === 'error' ? 'error' : 'warning'" variant="soft" size="sm">{{ error.level }}</UBadge>
                        </td>
                        <td class="px-4 py-3 max-w-md truncate">{{ error.message }}</td>
                        <td class="px-4 py-3 whitespace-nowrap">{{ error.occurred_at }}</td>
                        <td class="px-4 py-3">
                            <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="soft" @click="seleccionado = error" />
                        </td>
                    </tr>
                    <tr v-if="!errores.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">{{ cargando ? 'Cargando...' : 'Sin registros' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <UModal v-model:open="seleccionado" :ui="{ width: 'max-w-3xl' }">
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <h3 class="text-lg font-semibold">Error #{{ seleccionado?.id }}</h3>
                    <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="seleccionado = null" />
                </div>
            </template>
            <template #body>
                <div v-if="seleccionado" class="space-y-3 text-sm">
                    <p><span class="font-semibold">Nivel:</span> {{ seleccionado.level }}</p>
                    <p><span class="font-semibold">Fecha:</span> {{ seleccionado.occurred_at }}</p>
                    <p><span class="font-semibold">Huella:</span> <code class="text-xs">{{ seleccionado.fingerprint }}</code></p>
                    <p class="font-semibold">Mensaje</p>
                    <pre class="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs">{{ seleccionado.message }}</pre>
                    <p class="font-semibold">Contexto</p>
                    <pre class="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs overflow-auto max-h-80">{{ JSON.stringify(seleccionado.context, null, 2) }}</pre>
                </div>
            </template>
        </UModal>
    </BackofficeGate>
</template>
