<script setup>
definePageMeta({
    layout: 'backoffice'
});
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'
import { backofficePost } from '~/Core/Backoffice/BackofficeAPI'

const notificaciones = useNotificacionesStore()
const ejecutando = ref('')
const ultimoResultado = ref(null)

const acciones = [
    {
        id: 'temporales',
        titulo: 'Temporales de exportación',
        descripcion: 'Elimina directorios temp_pdf_* y archivos temp_*.pdf generados al generar PDFs.',
        icon: 'i-lucide-folder-x',
        confirmacion: 'Se eliminarán los archivos temporales de exportación.'
    },
    {
        id: 'logs',
        titulo: 'Truncar laravel.log',
        descripcion: 'Conserva solo las últimas 1000 líneas del log principal del sistema.',
        icon: 'i-lucide-file-x-2',
        confirmacion: 'Se truncará storage/logs/laravel.log conservando las últimas 1000 líneas.'
    },
    {
        id: 'tokens',
        titulo: 'Tokens expirados',
        descripcion: 'Poda los tokens de acceso vencidos de personal_access_tokens.',
        icon: 'i-lucide-key-round',
        confirmacion: 'Se eliminarán los tokens de acceso ya expirados.'
    }
]

async function ejecutar(accion) {
    notificaciones.options = {
        icono: 'warning',
        titulo: `¿${accion.titulo}?`,
        html: accion.confirmacion,
        confirmtext: 'Sí, ejecutar',
        canceltext: 'Cancelar'
    }
    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    ejecutando.value = accion.id
    const ruta = accion.id === 'logs' ? '/limpieza/logs?lineas=1000' : `/limpieza/${accion.id}`
    const resultado = await backofficePost(ruta)
    ejecutando.value = ''

    if (resultado?.success) {
        ultimoResultado.value = { accion: accion.titulo, resultado }
        notificaciones.options = { icono: 'success', titulo: 'Completado', texto: `${accion.titulo} ejecutado correctamente.`, tiempo: 3000 }
        await notificaciones.simple()
    }
}
</script>

<template>
    <BackofficeGate titulo="Limpieza" subtitulo="Mantenimiento de temporales, logs y tokens">
        <div class="grid gap-4 sm:grid-cols-3">
            <UCard v-for="accion in acciones" :key="accion.id" class="flex flex-col">
                <div class="flex items-start gap-3">
                    <div class="rounded-lg bg-amber-50 dark:bg-amber-950 p-2.5">
                        <UIcon :name="accion.icon" class="w-6 h-6 text-amber-600" />
                    </div>
                    <div class="flex-1">
                        <h2 class="font-semibold text-gray-900 dark:text-white">{{ accion.titulo }}</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ accion.descripcion }}</p>
                    </div>
                </div>
                <template #footer>
                    <UButton :label="ejecutando === accion.id ? 'Ejecutando...' : 'Ejecutar'"
                        :icon="ejecutando === accion.id ? 'i-lucide-loader-circle' : 'i-lucide-play'"
                        color="warning" variant="soft" size="sm" class="w-full justify-center"
                        :loading="ejecutando === accion.id" :disabled="!!ejecutando"
                        @click="ejecutar(accion)" />
                </template>
            </UCard>
        </div>

        <UCard v-if="ultimoResultado">
            <template #header>
                <p class="font-semibold text-sm">Último resultado — {{ ultimoResultado.accion }}</p>
            </template>
            <pre class="text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-auto">{{ JSON.stringify(ultimoResultado.resultado, null, 2) }}</pre>
        </UCard>
    </BackofficeGate>
</template>
