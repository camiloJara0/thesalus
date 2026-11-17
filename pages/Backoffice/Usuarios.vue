<script setup>
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficeGet, backofficePost } from '~/Core/Backoffice/BackofficeAPI'

const notificaciones = useNotificacionesStore()

const buscarTexto = ref('')
const rolFiltro = ref('')
const pagina = ref(1)
const usuarios = ref([])
const ultimaPagina = ref(1)
const total = ref(0)
const detalle = ref(null)
const cargando = ref(false)

const roles = [
    { label: 'Todos', value: '' },
    { label: 'Admin', value: 'Admin' },
    { label: 'SuperAdmin', value: 'SuperAdmin' },
    { label: 'Profesional', value: 'Profesional' }
]

function consulta() {
    const params = new URLSearchParams()
    if (buscarTexto.value) params.set('buscar', buscarTexto.value)
    if (rolFiltro.value) params.set('rol', rolFiltro.value)
    params.set('page', String(pagina.value))
    return `?${params.toString()}`
}

async function cargar() {
    cargando.value = true
    const respuesta = await backofficeGet(`/usuarios${consulta()}`)
    if (respuesta?.data) {
        usuarios.value = respuesta.data.data || []
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

async function verDetalle(usuario) {
    const respuesta = await backofficeGet(`/usuarios/${usuario.id}`)
    if (respuesta?.data) detalle.value = respuesta.data
}

async function purgarTokens() {
    if (!detalle.value) return
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Purgar tokens?',
        html: `Se revocarán todos los tokens de <b>${detalle.value.correo}</b>. Deberá iniciar sesión nuevamente.`,
        confirmtext: 'Sí, purgar',
        canceltext: 'Cancelar'
    }
    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    const resultado = await backofficePost(`/usuarios/${detalle.value.id}/tokens/purgar`)
    if (resultado?.success) {
        notificaciones.options = { icono: 'success', titulo: 'Tokens purgados', texto: `${resultado.tokens_eliminados} token(s) eliminados.`, tiempo: 3000 }
        await notificaciones.simple()
        await verDetalle(detalle.value)
        await cargar()
    }
}

const colorRol = (rol) => rol === 'SuperAdmin' ? 'error' : rol === 'Admin' ? 'warning' : 'neutral'
</script>

<template>
    <BackofficeGate titulo="Usuarios" subtitulo="Roles, permisos efectivos y tokens de acceso">
        <div class="flex flex-wrap items-end gap-3">
            <div>
                <label class="text-xs font-medium text-gray-500">Buscar</label>
                <input v-model="buscarTexto" type="text" placeholder="correo..."
                    @keyup.enter="buscar"
                    class="block w-64 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
            </div>
            <div>
                <label class="text-xs font-medium text-gray-500">Rol</label>
                <select v-model="rolFiltro" @change="buscar"
                    class="block w-44 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                    <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
                </select>
            </div>
            <UButton label="Buscar" icon="i-lucide-search" size="sm" @click="buscar" />
        </div>

        <div class="flex items-center justify-between text-sm text-gray-500">
            <span>{{ total }} usuario(s)</span>
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
                        <th class="px-4 py-3 text-left">Nombre</th>
                        <th class="px-4 py-3 text-left">Correo</th>
                        <th class="px-4 py-3 text-left">Rol</th>
                        <th class="px-4 py-3 text-left">Empresa</th>
                        <th class="px-4 py-3 text-center">Tokens</th>
                        <th class="px-4 py-3 text-center">Estado</th>
                        <th class="px-4 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td class="px-4 py-3">{{ usuario.nombre || '—' }}</td>
                        <td class="px-4 py-3">{{ usuario.correo }}</td>
                        <td class="px-4 py-3">
                            <UBadge :color="colorRol(usuario.rol)" variant="soft" size="sm">{{ usuario.rol }}</UBadge>
                        </td>
                        <td class="px-4 py-3">{{ usuario.empresa || '—' }}</td>
                        <td class="px-4 py-3 text-center">{{ usuario.tokens_activos }}</td>
                        <td class="px-4 py-3 text-center">
                            <UBadge :color="usuario.estado ? 'success' : 'error'" variant="soft" size="sm">
                                {{ usuario.estado ? 'Activo' : 'Inactivo' }}
                            </UBadge>
                        </td>
                        <td class="px-4 py-3">
                            <UButton icon="i-lucide-eye" size="xs" color="neutral" variant="soft" @click="verDetalle(usuario)" />
                        </td>
                    </tr>
                    <tr v-if="!usuarios.length">
                        <td colspan="7" class="px-4 py-8 text-center text-gray-400">{{ cargando ? 'Cargando...' : 'Sin usuarios' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <UModal v-model:open="detalle" :ui="{ width: 'max-w-3xl' }">
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <h3 class="text-lg font-semibold">{{ detalle?.correo || 'Detalle de usuario' }}</h3>
                    <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="detalle = null" />
                </div>
            </template>
            <template #body>
                <div v-if="detalle" class="space-y-4 text-sm">
                    <div class="flex flex-wrap gap-4">
                        <p><span class="font-semibold">Nombre:</span> {{ detalle.nombre || '—' }}</p>
                        <p><span class="font-semibold">Rol:</span> {{ detalle.rol }}</p>
                        <p><span class="font-semibold">Empresa:</span> {{ detalle.empresa || '—' }}</p>
                        <p><span class="font-semibold">Estado:</span> {{ detalle.estado ? 'Activo' : 'Inactivo' }}</p>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <p class="font-semibold">Permisos efectivos ({{ detalle.permisos_efectivos.length }})</p>
                        </div>
                        <div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                            <UBadge v-for="permiso in detalle.permisos_efectivos" :key="permiso" color="info" variant="subtle" size="sm">
                                {{ permiso }}
                            </UBadge>
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <p class="font-semibold">Tokens recientes</p>
                            <UButton label="Purgar todos" icon="i-lucide-key-round" color="error" variant="soft" size="xs"
                                @click="purgarTokens" />
                        </div>
                        <table class="min-w-full text-xs">
                            <thead class="text-gray-500 uppercase">
                                <tr>
                                    <th class="py-1 text-left">Nombre</th>
                                    <th class="py-1 text-left">Creado</th>
                                    <th class="py-1 text-left">Último uso</th>
                                    <th class="py-1 text-left">Expira</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                                <tr v-for="token in detalle.tokens_recientes" :key="token.id">
                                    <td class="py-1.5">{{ token.name }}</td>
                                    <td class="py-1.5">{{ token.created_at }}</td>
                                    <td class="py-1.5">{{ token.last_used_at || '—' }}</td>
                                    <td class="py-1.5">{{ token.expires_at || '—' }}</td>
                                </tr>
                                <tr v-if="!detalle.tokens_recientes.length">
                                    <td colspan="4" class="py-3 text-center text-gray-400">Sin tokens</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </UModal>
    </BackofficeGate>
</template>
