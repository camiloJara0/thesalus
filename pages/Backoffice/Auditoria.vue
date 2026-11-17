<script setup>
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficeGet } from '~/Core/Backoffice/BackofficeAPI'

const correo = ref('')
const accion = ref('')
const desde = ref('')
const hasta = ref('')
const pagina = ref(1)
const registros = ref([])
const ultimaPagina = ref(1)
const total = ref(0)
const seleccionado = ref(null)
const cargando = ref(false)

function consulta() {
    const params = new URLSearchParams()
    if (correo.value) params.set('correo', correo.value)
    if (accion.value) params.set('accion', accion.value)
    if (desde.value) params.set('desde', desde.value)
    if (hasta.value) params.set('hasta', hasta.value)
    params.set('page', String(pagina.value))
    return `?${params.toString()}`
}

async function cargar() {
    cargando.value = true
    const respuesta = await backofficeGet(`/auditoria${consulta()}`)
    if (respuesta?.data) {
        registros.value = respuesta.data.data || []
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

onMounted(cargar)
</script>

<template>
    <BackofficeGate titulo="Auditoría" subtitulo="Registro de acciones de los usuarios del sistema">
        <div class="flex flex-wrap items-end gap-3">
            <div>
                <label class="text-xs font-medium text-gray-500">Correo</label>
                <input v-model="correo" type="text" placeholder="buscar por correo"
                    class="block w-52 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <div>
                <label class="text-xs font-medium text-gray-500">Acción</label>
                <input v-model="accion" type="text" placeholder="login, permiso.aprobado..."
                    class="block w-52 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
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
            <UButton label="Buscar" icon="i-lucide-search" size="sm" @click="buscar" />
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
                        <th class="px-4 py-3 text-left">Fecha</th>
                        <th class="px-4 py-3 text-left">Usuario</th>
                        <th class="px-4 py-3 text-left">Acción</th>
                        <th class="px-4 py-3 text-left">Descripción</th>
                        <th class="px-4 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr v-for="registro in registros" :key="registro.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td class="px-4 py-3 whitespace-nowrap text-xs">{{ registro.created_at }}</td>
                        <td class="px-4 py-3">{{ registro.correo }}</td>
                        <td class="px-4 py-3">
                            <UBadge color="info" variant="soft" size="sm">{{ registro.accion }}</UBadge>
                        </td>
                        <td class="px-4 py-3 max-w-md truncate">{{ registro.descripcion }}</td>
                        <td class="px-4 py-3">
                            <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="soft" @click="seleccionado = registro" />
                        </td>
                    </tr>
                    <tr v-if="!registros.length">
                        <td colspan="5" class="px-4 py-8 text-center text-gray-400">{{ cargando ? 'Cargando...' : 'Sin registros' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <UModal v-model:open="seleccionado" :ui="{ width: 'max-w-3xl' }">
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <h3 class="text-lg font-semibold">Auditoría #{{ seleccionado?.id }}</h3>
                    <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="seleccionado = null" />
                </div>
            </template>
            <template #body>
                <div v-if="seleccionado" class="space-y-3 text-sm">
                    <p><span class="font-semibold">Fecha:</span> {{ seleccionado.created_at }}</p>
                    <p><span class="font-semibold">Usuario:</span> {{ seleccionado.correo }} (ID {{ seleccionado.user_id ?? '—' }})</p>
                    <p><span class="font-semibold">Acción:</span> {{ seleccionado.accion }}</p>
                    <p><span class="font-semibold">Modelo:</span> {{ seleccionado.modelo || '—' }} {{ seleccionado.modelo_id ? '#' + seleccionado.modelo_id : '' }}</p>
                    <p><span class="font-semibold">IP:</span> {{ seleccionado.ip || '—' }}</p>
                    <p><span class="font-semibold">Descripción:</span> {{ seleccionado.descripcion || '—' }}</p>
                    <p class="font-semibold">Datos</p>
                    <pre class="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs overflow-auto max-h-72">{{ JSON.stringify(seleccionado.datos, null, 2) }}</pre>
                </div>
            </template>
        </UModal>
    </BackofficeGate>
</template>
