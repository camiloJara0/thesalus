<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { ayudaSecciones } from '~/data/Ayuda/ayudaContenido'

const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug)
const seccion = computed(() => ayudaSecciones.find(s => s.slug === slug.value))
const seccionActiva = ref('')

const seccionesNavegacion = computed(() => {
    const idx = ayudaSecciones.findIndex(s => s.slug === slug.value)
    return {
        anterior: idx > 0 ? ayudaSecciones[idx - 1] : null,
        siguiente: idx < ayudaSecciones.length - 1 ? ayudaSecciones[idx + 1] : null
    }
})

if (!seccion.value) {
    throw createError({ statusCode: 404, message: 'Seccion no encontrada' })
}

function irASeccion(slug) {
    router.push(`/Ayuda/seccion/${slug}`)
}

function irARuta(ruta) {
    if (ruta) router.push(ruta)
}
</script>

<template>
    <FondoDefault v-if="seccion">
        <div class="max-w-4xl mx-auto">

            <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <button @click="router.push('/Ayuda')" class="hover:text-(--color-default) transition-colors">
                    <i class="fa-solid fa-house mr-1"></i>Ayuda
                </button>
                <i class="fa-solid fa-chevron-right text-xs"></i>
                <span class="text-gray-900 dark:text-white font-medium">{{ seccion.titulo }}</span>
            </nav>

            <div class="flex items-center gap-4 mb-8">
                <div
                    class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                    :class="seccion.color"
                >
                    <i :class="seccion.icono" class="text-white text-2xl"></i>
                </div>
                <div>
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {{ seccion.titulo }}
                    </h1>
                    <p class="text-gray-500 dark:text-gray-400 mt-1">
                        {{ seccion.descripcion }}
                    </p>
                </div>
            </div>

            <div class="space-y-4 mb-8">
                <div
                    v-for="(item, idx) in seccion.contenido"
                    :key="idx"
                    class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                    <div class="flex items-start gap-4 p-5">
                        <div class="shrink-0 mt-0.5">
                            <div
                                v-if="item.tipo === 'paso'"
                                class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center"
                            >
                                <span class="text-blue-600 dark:text-blue-400 font-bold text-sm">{{ idx + 1 }}</span>
                            </div>
                            <div
                                v-else-if="item.tipo === 'info'"
                                class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center"
                            >
                                <i class="fa-solid fa-circle-info text-indigo-500 text-sm"></i>
                            </div>
                            <div
                                v-else-if="item.tipo === 'alerta'"
                                class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center"
                            >
                                <i class="fa-solid fa-triangle-exclamation text-amber-500 text-sm"></i>
                            </div>
                            <div
                                v-else-if="item.tipo === 'faq'"
                                class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center"
                            >
                                <i :class="item.icono" class="text-purple-500 text-sm"></i>
                            </div>
                            <div
                                v-else
                                class="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center"
                            >
                                <i :class="item.icono" class="text-gray-500 text-sm"></i>
                            </div>
                        </div>
<div >

    <div class="p-6 flex gap-5">

        <!-- Contenido -->
        <div class="flex-1">

            <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
                {{ item.titulo }}
            </h3>

            <p class="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {{ item.texto }}
            </p>

            <div
                v-if="item.imagen || item.video"
                class="mt-5">

                <UButton
                    color="primary"
                    variant="ghost"
                    @click="seccionActiva = seccionActiva == item.titulo ? '' : item.titulo">

                    <UIcon
                        name="i-lucide-chevron-right"
                        class="mr-2 transition-transform duration-300"
                        :class="{
                            'rotate-90': seccionActiva == item.titulo
                        }"
                    />

                    {{ seccionActiva == item.titulo ? 'Ocultar ejemplo' : 'Ver ejemplo' }}

                </UButton>

            </div>

        </div>

    </div>

    <!-- Contenido desplegable -->
    <Transition name="expand">

        <div
            v-if="seccionActiva == item.titulo"
            class="px-6 pb-6">

            <div
                class="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-inner">

                <img
                    v-if="item.imagen"
                    :src="item.imagen"
                    :alt="item.titulo"
                    class="w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />

                <video
                    v-if="item.video"
                    :src="item.video"
                    controls
                    autoplay
                    muted
                    loop
                    playsinline
                    class="w-full">
                    Tu navegador no soporta la reproducción del video.
                </video>

            </div>

        </div>

    </Transition>

</div>
                        <div v-if="item.icono && item.tipo === 'paso'" class="shrink-0">
                            <i :class="item.icono" class="text-blue-300 dark:text-blue-600 text-lg"></i>
                        </div>
                    </div>

                    <div
                        v-if="item.tipo === 'paso' && idx < seccion.contenido.length - 1"
                        class="ml-9 border-l-2 border-dashed border-gray-200 dark:border-gray-600 h-4 -mt-2 mb-2"
                    ></div>
                </div>
            </div>

            <div v-if="seccion.consejos?.length" class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                        <i class="fa-solid fa-lightbulb text-green-500 text-sm"></i>
                    </div>
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white">Consejos</h2>
                </div>
                <div class="bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30 p-5">
                    <ul class="space-y-3">
                        <li
                            v-for="(consejo, idx) in seccion.consejos"
                            :key="idx"
                            class="flex items-start gap-3"
                        >
                            <i class="fa-solid fa-check-circle text-green-500 text-sm mt-0.5 shrink-0"></i>
                            <span class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ consejo }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div v-if="seccion.links?.length" class="mb-8">
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <i class="fa-solid fa-link text-blue-500 text-sm"></i>
                    </div>
                    <h2 class="text-lg font-bold text-gray-900 dark:text-white">Accesos Directos</h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        v-for="(link, idx) in seccion.links"
                        :key="idx"
                        @click="irARuta(link.ruta)"
                        class="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-(--color-default)/30 hover:shadow-md transition-all duration-200 text-left group"
                    >
                        <div class="w-10 h-10 rounded-lg bg-(--color-default)/10 flex items-center justify-center group-hover:bg-(--color-default)/20 transition">
                            <i :class="link.icono" class="text-(--color-default) text-sm"></i>
                        </div>
                        <div class="flex-1">
                            <span class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-(--color-default) transition-colors">
                                {{ link.texto }}
                            </span>
                        </div>
                        <i class="fa-solid fa-arrow-right text-xs text-gray-300 dark:text-gray-600 group-hover:text-(--color-default) transition-colors"></i>
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    v-if="seccionesNavegacion.anterior"
                    @click="irASeccion(seccionesNavegacion.anterior.slug)"
                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <i class="fa-solid fa-chevron-left text-xs"></i>
                    <div class="text-left">
                        <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Anterior</p>
                        <p>{{ seccionesNavegacion.anterior.titulo }}</p>
                    </div>
                </button>
                <div v-else></div>

                <button
                    @click="router.push('/Ayuda')"
                    class="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <i class="fa-solid fa-grip mr-1"></i>Indice
                </button>

                <button
                    v-if="seccionesNavegacion.siguiente"
                    @click="irASeccion(seccionesNavegacion.siguiente.slug)"
                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <div class="text-right">
                        <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Siguiente</p>
                        <p>{{ seccionesNavegacion.siguiente.titulo }}</p>
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </button>
                <div v-else></div>
            </div>
        </div>
    </FondoDefault>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
    transition:
        max-height .45s cubic-bezier(.4,0,.2,1),
        opacity .35s ease,
        transform .35s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
}

.expand-enter-to,
.expand-leave-from {
    max-height: 1200px;
    opacity: 1;
    transform: translateY(0);
}
</style>
