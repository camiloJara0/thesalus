<script setup>
import BackofficeGate from '~/components/organism/Backoffice/BackofficeGate.vue'

const { hasPermiso } = usePermisos()

const secciones = [
    { permiso: 'Backoffice_salud', nombre: 'Salud y configuración', descripcion: 'Estado del sistema, BD y cola', ruta: '/Backoffice/Salud', icon: 'i-lucide-heart-pulse' },
    { permiso: 'Backoffice_errores', nombre: 'Errores', descripcion: 'Monitor de excepciones y laravel.log', ruta: '/Backoffice/Errores', icon: 'i-lucide-bug' },
    { permiso: 'Backoffice_trabajos', nombre: 'Trabajos', descripcion: 'Colas, jobs fallidos y exportaciones', ruta: '/Backoffice/Trabajos', icon: 'i-lucide-cog' },
    { permiso: 'Backoffice_exportaciones', nombre: 'Exportaciones', descripcion: 'Estado de exportaciones PDF/zip', ruta: '/Backoffice/Trabajos?tab=exportaciones', icon: 'i-lucide-file-archive' },
    { permiso: 'Backoffice_auditoria', nombre: 'Auditoría', descripcion: 'Registro de acciones de usuarios', ruta: '/Backoffice/Auditoria', icon: 'i-lucide-clipboard-list' },
    { permiso: 'Backoffice_metricas', nombre: 'Métricas', descripcion: 'Solicitudes, errores y latencia de la API', ruta: '/Backoffice/Metricas', icon: 'i-lucide-chart-line' },
    { permiso: 'Backoffice_usuarios', nombre: 'Usuarios', descripcion: 'Roles, permisos efectivos y tokens', ruta: '/Backoffice/Usuarios', icon: 'i-lucide-users' },
    { permiso: 'Backoffice_limpieza', nombre: 'Limpieza', descripcion: 'Temporales, logs y tokens expirados', ruta: '/Backoffice/Limpieza', icon: 'i-lucide-trash-2' },
    { permiso: 'Backoffice_respaldos', nombre: 'Respaldos', descripcion: 'Copias de seguridad de la base de datos', ruta: '/Backoffice/Respaldos', icon: 'i-lucide-hard-drive-download' }
]

const visibles = computed(() => secciones.filter(s => hasPermiso(s.permiso)))
</script>

<template>
    <BackofficeGate titulo="Backoffice" subtitulo="Panel de administración del sistema">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink v-for="seccion in visibles" :key="seccion.permiso" :to="seccion.ruta"
                class="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md hover:border-primary-400 transition-all">
                <div class="flex items-start gap-3">
                    <div class="rounded-lg bg-primary-50 dark:bg-primary-950 p-2.5 group-hover:bg-primary-100">
                        <UIcon :name="seccion.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h2 class="font-semibold text-gray-900 dark:text-white">{{ seccion.nombre }}</h2>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ seccion.descripcion }}</p>
                    </div>
                </div>
            </NuxtLink>
        </div>
    </BackofficeGate>
</template>
