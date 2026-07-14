<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { useAyudaSearch } from '~/composables/Ayuda/useAyudaSearch'
import { ayudaSecciones } from '~/data/Ayuda/ayudaContenido'

const router = useRouter()

const {
    terminoBusqueda,
    filtroTipo,
    tiposFiltro,
    resultadosFiltrados,
    resultadosPorSeccion,
    totalResultados,
    busquedaActiva,
    buscar,
    limpiarBusqueda
} = useAyudaSearch()

const inputBusqueda = ref('')

watch(inputBusqueda, (valor) => {
    buscar(valor)
})

function irASeccion(slug) {
    router.push(`/Ayuda/seccion/${slug}`)
}

function irARuta(ruta) {
    if (ruta) router.push(ruta)
}

function resaltarTexto(texto, termino) {
    if (!termino || termino.length < 2) return texto
    const regex = new RegExp(`(${termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return texto.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>')
}
</script>

<template>
    <FondoDefault>
        <div class="max-w-6xl mx-auto">

            <div class="mb-8">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 rounded-xl bg-(--color-default) flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-circle-question text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Centro de Ayuda
                        </h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Encuentra respuestas rapidas a tus dudas
                        </p>
                    </div>
                </div>
            </div>

            <div class="relative mb-8">
                <div class="relative">
                    <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        v-model="inputBusqueda"
                        type="text"
                        placeholder="Buscar modulos, funcionalidades, problemas..."
                        class="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base focus:border-(--color-default) focus:ring-2 focus:ring-(--color-default)/30 outline-none transition-all duration-200 shadow-sm"
                    >
                    <button
                        v-if="inputBusqueda"
                        @click="inputBusqueda = ''; limpiarBusqueda()"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                    >
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>

                <div v-if="busquedaActiva" class="mt-3 flex flex-wrap items-center gap-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ totalResultados }} resultado{{ totalResultados !== 1 ? 's' : '' }}
                    </span>
                    <div class="flex gap-1.5">
                        <button
                            v-for="filtro in tiposFiltro"
                            :key="filtro.value"
                            @click="filtroTipo = filtro.value"
                            class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                            :class="filtroTipo === filtro.value
                                ? 'bg-(--color-default) text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                        >
                            <i :class="filtro.icono" class="mr-1"></i>
                            {{ filtro.label }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="busquedaActiva && totalResultados > 0" class="space-y-6 mb-8">
                <div
                    v-for="grupo in resultadosPorSeccion"
                    :key="grupo.slug"
                    class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div class="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="grupo.color">
                            <i :class="grupo.icono" class="text-white text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900 dark:text-white">{{ grupo.seccion }}</h3>
                        </div>
                        <button
                            v-if="grupo.ruta"
                            @click="irARuta(grupo.ruta)"
                            class="text-xs text-(--color-default) hover:text-(--color-default-600) font-medium transition"
                        >
                            Ir al modulo <i class="fa-solid fa-arrow-right ml-1"></i>
                        </button>
                        <button
                            @click="irASeccion(grupo.slug)"
                            class="text-xs text-gray-400 hover:text-(--color-default) transition"
                        >
                            Ver guia <i class="fa-solid fa-chevron-right ml-1"></i>
                        </button>
                    </div>

                    <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
                        <div
                            v-for="(item, idx) in grupo.items.slice(0, 5)"
                            :key="idx"
                            @click="irASeccion(grupo.slug)"
                            class="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors duration-150"
                        >
                            <i class="text-sm mt-0.5 shrink-0"
                                :class="[{
                                    'text-blue-500': item.tipo === 'paso',
                                    'text-green-500': item.tipo === 'consejo',
                                    'text-amber-500': item.tipo === 'alerta',
                                    'text-purple-500': item.tipo === 'faq',
                                    'text-gray-400': item.tipo === 'link'
                                }, item.icono]"
                            ></i>
                            <p
                                class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                                v-html="resaltarTexto(item.texto, inputBusqueda)"
                            ></p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="busquedaActiva && totalResultados === 0" class="text-center py-16">
                <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <i class="fa-solid fa-magnifying-glass text-3xl text-gray-300 dark:text-gray-600"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No se encontraron resultados
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Intenta con otros terminos como "pacientes", "citas", "historial" o "inventario".
                </p>
            </div>

            <div v-if="!busquedaActiva">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                        v-for="seccion in ayudaSecciones"
                        :key="seccion.slug"
                        @click="irASeccion(seccion.slug)"
                        class="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-(--color-default)/30"
                    >
                        <div class="flex items-start gap-4">
                            <div
                                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                                :class="seccion.colorClaro"
                            >
                                <i class="text-lg" :class="[seccion.icono, seccion.color.replace('bg-', 'text-')]"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-(--color-default) transition-colors">
                                    {{ seccion.titulo }}
                                </h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {{ seccion.descripcion }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 mt-4">
                            <span class="text-xs text-gray-400 dark:text-gray-500">
                                {{ seccion.contenido?.length || 0 }} pasos
                            </span>
                            <span v-if="seccion.consejos?.length" class="text-xs text-green-500">
                                <i class="fa-solid fa-lightbulb mr-0.5"></i>{{ seccion.consejos.length }} consejos
                            </span>
                            <span v-if="seccion.links?.length" class="text-xs text-blue-500">
                                <i class="fa-solid fa-link mr-0.5"></i>{{ seccion.links.length }} enlaces
                            </span>
                        </div>

                        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <i class="fa-solid fa-chevron-right text-sm text-(--color-default)"></i>
                        </div>

                        <div
                            class="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl transition-all duration-300 group-hover:h-1"
                            :class="seccion.color"
                        ></div>
                    </div>
                </div>
            </div>

            <div class="mt-10 p-6 bg-linear-to-r from-(--color-default) to-(--color-default-600) rounded-2xl text-white">
                <div class="flex flex-col md:flex-row items-center gap-4">
                    <div class="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <i class="fa-solid fa-headset text-2xl"></i>
                    </div>
                    <div class="text-center md:text-left flex-1">
                        <h3 class="font-bold text-lg mb-1">Necesitas mas ayuda?</h3>
                        <p class="text-white/80 text-sm">
                            Contacta al administrador del sistema para soporte tecnico personalizado.
                        </p>
                    </div>
                    <button
                        @click="router.push('/Home')"
                        class="px-6 py-2.5 bg-white text-(--color-default) rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        <i class="fa-solid fa-home mr-2"></i>Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    </FondoDefault>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
