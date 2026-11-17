<script setup>
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficeGet, backofficePost, backofficeDescargar } from '~/Core/Backoffice/BackofficeAPI'

const notificaciones = useNotificacionesStore()

const archivos = ref([])
const cargando = ref(false)
const creando = ref(false)

async function cargar() {
    cargando.value = true
    const respuesta = await backofficeGet('/respaldos')
    if (respuesta?.success) archivos.value = respuesta.data
    cargando.value = false
}

async function crear() {
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Crear respaldo?',
        html: 'Se ejecutará mysqldump contra la base de datos activa. Puede tardar unos segundos.',
        confirmtext: 'Sí, crear',
        canceltext: 'Cancelar'
    }
    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    creando.value = true
    const resultado = await backofficePost('/respaldos')
    creando.value = false

    if (resultado?.success) {
        notificaciones.options = { icono: 'success', titulo: 'Respaldo creado', texto: `${resultado.archivo} (${resultado.bytes} bytes).`, tiempo: 4000 }
        await notificaciones.simple()
        await cargar()
    }
}

async function descargar(archivo) {
    try {
        await backofficeDescargar(`/respaldos/${archivo}/descargar`, archivo)
    } catch (error) {
        notificaciones.options = { icono: 'error', titulo: 'Error', texto: error.message, tiempo: 4000 }
        await notificaciones.simple()
    }
}

const formatoBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
}

onMounted(cargar)
</script>

<template>
    <BackofficeGate titulo="Respaldos" subtitulo="Copias de seguridad de la base de datos">
        <div class="flex justify-end">
            <UButton label="Crear respaldo" icon="i-lucide-database-backup" color="primary"
                :loading="creando" :disabled="creando" @click="crear" />
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <table class="min-w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
                    <tr>
                        <th class="px-4 py-3 text-left">Archivo</th>
                        <th class="px-4 py-3 text-right">Tamaño</th>
                        <th class="px-4 py-3 text-left">Modificado</th>
                        <th class="px-4 py-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr v-for="archivo in archivos" :key="archivo.archivo" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td class="px-4 py-3">
                            <span class="flex items-center gap-2">
                                <UIcon name="i-lucide-file-archive" class="text-gray-400" />
                                <code class="text-xs">{{ archivo.archivo }}</code>
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right">{{ formatoBytes(archivo.bytes) }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-xs">
                            {{ new Date(archivo.modificado * 1000).toLocaleString('es-CO') }}
                        </td>
                        <td class="px-4 py-3">
                            <UButton icon="i-lucide-download" size="xs" color="neutral" variant="soft"
                                label="Descargar" @click="descargar(archivo.archivo)" />
                        </td>
                    </tr>
                    <tr v-if="!archivos.length">
                        <td colspan="4" class="px-4 py-8 text-center text-gray-400">
                            {{ cargando ? 'Cargando...' : 'Sin respaldos todavía' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </BackofficeGate>
</template>
