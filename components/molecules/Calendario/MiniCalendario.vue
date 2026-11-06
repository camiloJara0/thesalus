<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCalendarioCitas } from '~/stores/Calendario.js'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'

const emit = defineEmits(['seleccion'])

const calendarioStore = useCalendarioCitas()
const citasStore = useCitasStore()

const { calendario, fecha, fechaActual, meses, años, añoDesde } = storeToRefs(calendarioStore)

const mesActual = ref(meses.value - 1)

// Seguir cambios de mes ocurridos en otros componentes (vista Calendario)
watch([meses, años], ([m]) => {
    mesActual.value = m - 1
})

const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const nombreMes = computed(() => {
    const anho = calendario.value[años.value - añoDesde.value]
    if (!anho) return ''
    return `${anho.meses[mesActual.value]?.nombre || ''} ${años.value}`
})

const diasGrid = computed(() => {
    const anho = calendario.value[años.value - añoDesde.value]
    if (!anho) return []
    const mes = anho.meses[mesActual.value]
    const mesNumero = String(mesActual.value + 1).padStart(2, '0')
    const espacios = Array(mes.inicio).fill({ dia: null, fecha: null })
    const dias = Array.from({ length: mes.dias }, (_, i) => {
        const dia = String(i + 1).padStart(2, '0')
        return { dia: i + 1, fecha: `${dia}/${mesNumero}/${años.value}` }
    })
    return [...espacios, ...dias]
})

function aISO(fechaDDMM) {
    const [d, m, a] = fechaDDMM.split('/')
    return `${a}-${m}-${d}`
}

function aIsoCorta(dateObj) {
    const d = String(dateObj.getDate()).padStart(2, '0')
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    return `${dateObj.getFullYear()}-${m}-${d}`
}

// Citas por día del mes visible (para punto/contador discreto)
const citasPorDia = computed(() => {
    const mapa = new Map()
    const prefijoMes = `${años.value}-${String(mesActual.value + 1).padStart(2, '0')}-`

    for (const cita of citasStore.Citas) {
        if (!cita.fecha || cita.estado === 'cancelada') continue
        const inicio = cita.fecha
        const fin = cita.fechaHasta || cita.fecha

        if (inicio === fin) {
            if (inicio.startsWith(prefijoMes)) {
                mapa.set(inicio, (mapa.get(inicio) || 0) + 1)
            }
            continue
        }

        // Rango multi-día: contar cada día dentro del mes visible (tope de seguridad)
        if (fin < prefijoMes || inicio > `${prefijoMes}31`) continue
        const de = new Date(`${inicio}T00:00:00`)
        const hasta = new Date(`${fin}T00:00:00`)
        let iteraciones = 0
        for (let f = new Date(de); f <= hasta && iteraciones < 90; f.setDate(f.getDate() + 1), iteraciones++) {
            const iso = aIsoCorta(f)
            if (iso.startsWith(prefijoMes)) {
                mapa.set(iso, (mapa.get(iso) || 0) + 1)
            }
        }
    }
    return mapa
})

function marcador(fechaDDMM) {
    const iso = aISO(fechaDDMM)
    const total = citasPorDia.value.get(iso) || 0
    if (!total) return null
    return total <= 9 ? String(total) : 'punto'
}

// Asegurar que el mes visible tenga datos (1 sola petición, cacheada y deduplicada)
async function asegurarMes() {
    const anho = calendario.value[años.value - añoDesde.value]
    if (!anho) return
    const mes = anho.meses[mesActual.value]
    if (!mes) return
    const prefijoMes = `${años.value}-${String(mesActual.value + 1).padStart(2, '0')}-`
    const yaCargado = citasStore.Citas.some((c) => c.fecha?.startsWith(prefijoMes))
    if (yaCargado) return

    const m = String(mesActual.value + 1).padStart(2, '0')
    await citasStore.citasPorRango(`${años.value}-${m}-01`, `${años.value}-${m}-${String(mes.dias).padStart(2, '0')}`)
}

onMounted(asegurarMes)

function navegarMes(paso) {
    if (paso < 0) {
        if (mesActual.value === 0 && años.value === añoDesde.value) return
        if (mesActual.value === 0) {
            mesActual.value = 11
            meses.value = 12
            años.value--
        } else {
            mesActual.value--
            meses.value--
        }
    } else {
        if (mesActual.value === 11) {
            mesActual.value = 0
            meses.value = 1
            años.value++
        } else {
            mesActual.value++
            meses.value++
        }
    }
    asegurarMes()
}

function seleccionarDia(dia) {
    if (!dia?.fecha) return
    calendarioStore.cambiarFecha(dia.fecha)
    emit('seleccion', aISO(dia.fecha))
}

function irAHoy() {
    calendarioStore.obtenerFecha()
    mesActual.value = meses.value - 1
    emit('seleccion', aISO(fechaActual.value))
}

const enHoy = computed(() => fecha.value === fechaActual.value)
</script>

<template>
    <aside
        class="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-3 select-none">
        <div class="flex items-center justify-between gap-1 mb-2">
            <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{{ nombreMes }}</h3>
            <div class="flex items-center gap-0.5 shrink-0">
                <button v-if="!enHoy" type="button" title="Ir a hoy"
                    class="px-1.5 py-1 text-[10px] font-semibold rounded-md text-(--color-default) hover:bg-(--color-default)/10 cursor-pointer">
                    Hoy
                </button>
                <button type="button" aria-label="Mes anterior" :disabled="mesActual === 0 && años === añoDesde"
                    class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    @click="navegarMes(-1)">
                    <UIcon name="i-lucide-chevron-left" class="size-4 text-gray-500 dark:text-gray-400" />
                </button>
                <button type="button" aria-label="Mes siguiente"
                    class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    @click="navegarMes(1)">
                    <UIcon name="i-lucide-chevron-right" class="size-4 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
        </div>

        <div class="grid grid-cols-7">
            <span v-for="d in DIAS_CORTOS" :key="d"
                class="text-center text-[10px] font-medium text-gray-400 dark:text-gray-500 py-1">{{ d }}</span>

            <button v-for="(num, index) in diasGrid" :key="index" type="button" :disabled="!num.fecha"
                :aria-label="num.fecha || undefined"
                class="relative h-9 rounded-lg text-xs sm:text-sm flex items-center justify-center transition-colors duration-100 cursor-pointer disabled:cursor-default focus:outline-none"
                :class="{
                    'hover:bg-gray-100 dark:hover:bg-gray-700': num.fecha,
                    'bg-(--color-default) text-white font-semibold shadow-sm pointer-events-none': num.fecha && num.fecha === fecha,
                    'ring-1 ring-(--color-default)/60 font-semibold text-(--color-default)': num.fecha && num.fecha !== fecha && num.fecha === fechaActual,
                }" @click="seleccionarDia(num)">
                <template v-if="num.fecha">
                    <span class="flex flex-col items-center leading-none gap-0.75">
                        <span>{{ num.dia }}</span>
                        <span v-if="marcador(num.fecha) === 'punto'" class="w-1 h-1 rounded-full"
                            :class="num.fecha === fecha ? 'bg-white' : 'bg-(--color-default)'"></span>
                        <span v-else-if="marcador(num.fecha)" class="text-[8px] font-bold leading-none"
                            :class="num.fecha === fecha ? 'text-white/90' : 'text-(--color-default)'">
                            {{ marcador(num.fecha) }}
                        </span>
                        <span v-else class="h-1"></span>
                    </span>
                </template>
            </button>
        </div>
    </aside>
</template>
