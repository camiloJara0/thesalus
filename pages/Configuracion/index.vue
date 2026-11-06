<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { usePreferencias } from '~/stores/preferencias'

const preferencias = usePreferencias()
const notificaciones = useNotificacionesStore()

const opcionesTema = [
    { id: 'system', label: 'Sistema', icon: 'i-lucide-monitor' },
    { id: 'light', label: 'Claro', icon: 'i-lucide-sun' },
    { id: 'dark', label: 'Oscuro', icon: 'i-lucide-moon' },
]

const opcionesVistaInicial = [
    { id: 'scroll', label: 'Scroll', icon: 'i-lucide-layout-list' },
    { id: 'calendario', label: 'Calendario', icon: 'i-lucide-calendar' },
    { id: 'tabla', label: 'Tabla', icon: 'i-lucide-table-properties' },
]

const opcionesGranularidad = [
    { id: 'dia', label: 'Día', icon: 'i-lucide-calendar-1' },
    { id: 'semana', label: 'Semana', icon: 'i-lucide-calendar-range' },
    { id: 'mes', label: 'Mes', icon: 'i-lucide-calendar' },
]

const opcionesDensidad = [
    { id: 'normal', label: 'Normal', icon: 'i-lucide-rows-3' },
    { id: 'compacta', label: 'Compacta', icon: 'i-lucide-list' },
]

const opcionesFilas = [10, 25, 50, 100]

const horasInicio = Array.from({ length: 18 }, (_, i) => 4 + i) // 4..21

const horasFin = computed(() => {
    const inicio = preferencias.horaInicio
    const lista = []
    for (let h = inicio + 1; h <= 23; h++) lista.push(h)
    return lista
})

function cambiarHoraInicio(event) {
    const hora = Number(event.target.value)
    preferencias.set('agenda.horaInicio', hora)
    if (preferencias.horaFin <= hora) {
        preferencias.set('agenda.horaFin', Math.min(23, hora + 1))
    }
}

function cambiarHoraFin(event) {
    preferencias.set('agenda.horaFin', Number(event.target.value))
}

const metaTabs = {
    notas: { label: 'Notas', icon: 'i-lucide-file-text' },
    evoluciones: { label: 'Evoluciones', icon: 'i-lucide-trending-up' },
    terapias: { label: 'Terapias', icon: 'i-lucide-heart-pulse' },
    consultas: { label: 'Consultas', icon: 'i-lucide-clipboard' },
    'trabajo-social': { label: 'Social', icon: 'i-lucide-briefcase-business' },
    diagnosticos: { label: 'Diagnósticos', icon: 'i-lucide-activity' },
    medicamentos: { label: 'Medicamentos', icon: 'i-lucide-pill' },
    tratamientos: { label: 'Tratamientos', icon: 'i-lucide-bandage' },
}

const tabsVisibles = computed(() => {
    const ids = preferencias.ordenTabs.filter(id => metaTabs[id])
    Object.keys(metaTabs).forEach(id => { if (!ids.includes(id)) ids.push(id) })
    return ids.map(id => ({ id, ...metaTabs[id] }))
})

function moverTab(indice, delta) {
    const ids = tabsVisibles.value.map(tab => tab.id)
    const destino = indice + delta
    if (destino < 0 || destino >= ids.length) return
    const copia = [...ids]
    const [movido] = copia.splice(indice, 1)
    copia.splice(destino, 0, movido)
    preferencias.set('historial.ordenTabs', copia)
}

async function reiniciarPreferencias() {
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Restablecer preferencias?',
        html: 'Se volverán a los valores por defecto de la aplicación en este dispositivo.',
        confirmtext: 'Sí, restablecer',
        canceltext: 'Cancelar',
    }
    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return
    preferencias.reiniciar()
    notificaciones.options = {
        icono: 'success',
        titulo: 'Preferencias restablecidas',
        texto: 'Se restauraron los valores por defecto.',
        tiempo: 2500,
    }
    notificaciones.simple()
}
</script>

<template>
    <FondoDefault>
        <div class="max-w-4xl mx-auto pb-10">

            <!-- Encabezado -->
            <div class="mb-8">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 rounded-xl bg-(--color-default) flex items-center justify-center shadow-lg">
                        <i class="fa-solid fa-gear text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Configuración
                        </h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            Personaliza tu experiencia. Los cambios se aplican de inmediato y se guardan en este navegador.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Apariencia -->
            <section
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6 mb-5">
                <div class="flex items-center gap-3 mb-1">
                    <div class="w-9 h-9 rounded-lg bg-(--color-default)/10 flex items-center justify-center">
                        <i class="fa-solid fa-palette text-(--color-default)"></i>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Apariencia</h2>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Tema visual de la plataforma.
                </p>

                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema</p>
                <div class="flex flex-wrap gap-2">
                    <button v-for="op in opcionesTema" :key="op.id" @click="preferencias.set('tema', op.id)"
                        class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                        :class="preferencias.tema === op.id
                            ? 'bg-(--color-default) text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                        <UIcon :name="op.icon" class="w-4 h-4" />
                        {{ op.label }}
                    </button>
                </div>
            </section>

            <!-- Agenda -->
            <section
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6 mb-5">
                <div class="flex items-center gap-3 mb-1">
                    <div class="w-9 h-9 rounded-lg bg-(--color-default)/10 flex items-center justify-center">
                        <i class="fa-solid fa-calendar-days text-(--color-default)"></i>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Agenda</h2>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Cómo se abre y se muestra la agenda de citas.
                </p>

                <div class="mb-4">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista inicial</p>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="op in opcionesVistaInicial" :key="op.id"
                            @click="preferencias.set('agenda.vistaInicial', op.id)"
                            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                            :class="preferencias.vistaInicial === op.id
                                ? 'bg-(--color-default) text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                            <UIcon :name="op.icon" class="w-4 h-4" />
                            {{ op.label }}
                        </button>
                    </div>
                </div>

                <div class="mb-4">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Granularidad por defecto</p>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="op in opcionesGranularidad" :key="op.id"
                            @click="preferencias.set('agenda.granularidad', op.id)"
                            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                            :class="preferencias.granularidad === op.id
                                ? 'bg-(--color-default) text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                            <UIcon :name="op.icon" class="w-4 h-4" />
                            {{ op.label }}
                        </button>
                    </div>
                </div>

                <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jornada del día (vista Día)</p>
                    <div class="flex flex-wrap items-center gap-3">
                        <label class="text-sm text-gray-500 dark:text-gray-400">De
                            <select :value="preferencias.horaInicio" @change="cambiarHoraInicio"
                                class="ml-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-(--color-default)">
                                <option v-for="h in horasInicio" :key="h" :value="h">
                                    {{ String(h).padStart(2, '0') }}:00
                                </option>
                            </select>
                        </label>
                        <label class="text-sm text-gray-500 dark:text-gray-400">a
                            <select :value="preferencias.horaFin" @change="cambiarHoraFin"
                                class="ml-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-(--color-default)">
                                <option v-for="h in horasFin" :key="h" :value="h">
                                    {{ String(h).padStart(2, '0') }}:00
                                </option>
                            </select>
                        </label>
                    </div>
                </div>
            </section>

            <!-- Historial -->
            <section
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6 mb-5">
                <div class="flex items-center gap-3 mb-1">
                    <div class="w-9 h-9 rounded-lg bg-(--color-default)/10 flex items-center justify-center">
                        <i class="fa-solid fa-folder-open text-(--color-default)"></i>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Historial</h2>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Orden de las pestañas en la página del historial clínico.
                </p>

                <ul class="space-y-2">
                    <li v-for="(tab, indice) in tabsVisibles" :key="tab.id"
                        class="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                        <span class="w-5 text-xs font-semibold text-gray-400 dark:text-gray-500 text-center">
                            {{ indice + 1 }}
                        </span>
                        <UIcon :name="tab.icon" class="w-4 h-4 text-(--color-default)" />
                        <span class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                            {{ tab.label }}
                        </span>
                        <div class="flex gap-1">
                            <button @click="moverTab(indice, -1)" :disabled="indice === 0"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                :aria-label="'Subir ' + tab.label">
                                <i class="fa-solid fa-chevron-up"></i>
                            </button>
                            <button @click="moverTab(indice, 1)" :disabled="indice === tabsVisibles.length - 1"
                                class="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                :aria-label="'Bajar ' + tab.label">
                                <i class="fa-solid fa-chevron-down"></i>
                            </button>
                        </div>
                    </li>
                </ul>
            </section>

            <!-- Interfaz -->
            <section
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 md:p-6 mb-5">
                <div class="flex items-center gap-3 mb-1">
                    <div class="w-9 h-9 rounded-lg bg-(--color-default)/10 flex items-center justify-center">
                        <i class="fa-solid fa-table-columns text-(--color-default)"></i>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Interfaz</h2>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Comportamiento de las tablas de datos.
                </p>

                <div class="mb-4">
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Densidad de las tablas</p>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="op in opcionesDensidad" :key="op.id"
                            @click="preferencias.set('ui.densidadTablas', op.id)"
                            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
                            :class="preferencias.densidadTablas === op.id
                                ? 'bg-(--color-default) text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                            <UIcon :name="op.icon" class="w-4 h-4" />
                            {{ op.label }}
                        </button>
                    </div>
                </div>

                <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filas por página</p>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="n in opcionesFilas" :key="n"
                            @click="preferencias.set('ui.filasPorPagina', n)"
                            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                            :class="preferencias.filasPorPagina === n
                                ? 'bg-(--color-default) text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'">
                            {{ n }}
                        </button>
                    </div>
                </div>
            </section>

            <!-- Restablecer -->
            <div class="flex justify-end">
                <button @click="reiniciarPreferencias"
                    class="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <i class="fa-solid fa-rotate-left"></i>
                    Restablecer valores por defecto
                </button>
            </div>

        </div>
    </FondoDefault>
</template>
