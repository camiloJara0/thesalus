<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useCalendarioCitas } from '~/stores/Calendario.js'
import { diasSemana, nombresMeses } from '~/data/Fechas.js'
import { storeToRefs } from 'pinia';
import { useCitasStore } from '~/stores/Formularios/citas/Cita';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import { estadoDeCita, claveEstadoCita, badgeEstado } from '~/data/estadosCita';

const props = defineProps({
    citas: {
        type: Array,
        default: () => []
    },
    Propiedades: {
        type: [Array, Object],
        default: () => []
    },
    infoCitas: {
        type: [Array, Object],
    }
});

const calendarioCitasStore = useCalendarioCitas();
const Citas = ref(props.Propiedades.citas);
const notificacionesStore = useNotificacionesStore();
const citasStore = useCitasStore()

const {
    mensaje,
    options
} = notificacionesStore;

// Importar states y funciones del store
const {
    calendario,
    fecha,
    fechaActual,
    dias,
    meses,
    años,
    añoDesde
} = storeToRefs(calendarioCitasStore);

const mesActual = ref(parseInt(meses.value) - 1);

// Seguir cambios de mes ocurridos fuera (mini calendario de la vista Scroll)
watch([meses, años], ([m]) => {
    if (m - 1 !== mesActual.value) mesActual.value = m - 1
})

onMounted(async () => {
    // Conservar el contexto de fecha elegido en otras vistas (sin resetear a hoy)
    await asegurarMesVisible()
});
const nombreMes = computed(() => calendario.value[años.value - añoDesde.value].meses[mesActual.value].nombre + ' ' + años.value)

// ─────────────────────────────────────────────
// VISTA: día / semana / mes (persistida)
// ─────────────────────────────────────────────
const preferencias = usePreferencias()
const VISTAS = [
    { id: 'dia', label: 'Día', icon: 'i-lucide-calendar-1' },
    { id: 'semana', label: 'Semana', icon: 'i-lucide-calendar-range' },
    { id: 'mes', label: 'Mes', icon: 'i-lucide-calendar' }
]

const vista = computed({
    get: () => preferencias.granularidad,
    set: (nueva) => preferencias.set('agenda.granularidad', nueva)
})

function cambiarVista(nueva) {
    vista.value = nueva
}

// ─────────────────────────────────────────────
// Helpers de fecha
// ─────────────────────────────────────────────
function parseFechaDDMM(fechaDDMM) {
    const [d, m, a] = fechaDDMM.split('/').map(Number);
    return new Date(a, m - 1, d);
}

function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d); // siempre local, sin UTC
}

function aDDMM(fechaObj) {
    const d = String(fechaObj.getDate()).padStart(2, '0');
    const m = String(fechaObj.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${fechaObj.getFullYear()}`;
}

function aISO(fechaDDMM) {
    const [d, m, a] = fechaDDMM.split('/');
    return `${a}-${m}-${d}`;
}

const diasSemanaCorto = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

// Navega el store a una fecha y trae las citas del mes si cambió de mes
function irAFecha(fechaDDMM) {
    calendarioCitasStore.cambiarFecha(fechaDDMM);
    const [d, m, a] = fechaDDMM.split('/').map(Number);

    if (m - 1 !== mesActual.value || a !== años.value) {
        mesActual.value = m - 1;
        meses.value = m;
        años.value = a;
        const mm = String(m).padStart(2, '0');
        citasStore.citasPorRango(`${a}-${mm}-01`, `${a}-${mm}-31`);
    }
}

// Citas de un día específico (misma lógica de rango multi-día que la lista)
function citasDelDia(fechaDDMM) {
    const isoSel = aISO(fechaDDMM);
    const hoyISO = aISO(fechaActual.value);

    return Citas.value
        .filter((cita) => {
            if (!cita.fecha || cita.estado === 'cancelada') return false;

            const inicio = cita.fecha;
            const fin = cita.fechaHasta || cita.fecha;

            if (cita.estado === 'Inactiva' && fin > inicio) {
                // Rango multi-día: activo si la fecha seleccionada cae dentro
                return isoSel >= inicio && isoSel <= fin;
            }
            return inicio === isoSel;
        })
        .sort((a, b) => (a.hora || '00:00:00').localeCompare(b.hora || '00:00:00'))
        .map((cita) => ({
            ...cita,
            _vencida: cita.estado === 'Inactiva' && (cita.fechaHasta || cita.fecha) < hoyISO
        }));
}

// Propiedad para acomodar Dia en el calendario
const diasDelMes = computed(() => {
    const añoIndex = años.value - añoDesde.value;
    const mes = calendario.value[añoIndex].meses[mesActual.value]; // { dias: 30, inicio: 6, etc. }
    const año = años.value;
    const mesNumero = String(mesActual.value + 1).padStart(2, '0');

    // Espacios vacíos antes del primer día del mes
    const espacios = Array(mes.inicio).fill({ dia: null, fecha: null });

    // Generar los días con su fecha completa
    const dias = Array.from({ length: mes.dias }, (_, i) => {
        const dia = String(i + 1).padStart(2, '0');
        return {
            dia: i + 1,
            fecha: `${dia}/${mesNumero}/${año}`
        };
    });

    return [...espacios, ...dias];
});

// Propiedad devuelve array de fechas de todas las citas
const citasProcesadas = computed(() => {
    const diasConCitas = [];
    const diasConCitasMes = [];

    Citas.value.forEach((cita) => {
        if (cita.estado !== 'Inactiva') return;

        const fechaFormateada = cita.fecha.split('-').reverse().join('/');
        diasConCitas.push(fechaFormateada);

        const mesCita = parseInt(cita.fecha.split('-')[1]) - 1;

        if (mesCita === mesActual.value) {
            diasConCitasMes.push(fechaFormateada);
        }
    });

    return {
        diasConCitas,
        diasConCitasMes
    };
});

const diasConCitas = computed(() => citasProcesadas.value.diasConCitas);
const diasConCitasMes = computed(() => citasProcesadas.value.diasConCitasMes);

const vencidasProcesadas = computed(() => {
    const diasVencidos = [];
    const diasVencidosMes = [];

    Citas.value.map((cita) => {
        if (!cita.fechaHasta) {
            cita.fechaHasta = cita.fecha
        }

        const fechaHoyC = parseFechaISO(new Date().toISOString().split('T')[0]);
        const fechaHasta = parseFechaISO(cita.fechaHasta);

        const mesCita = parseInt(cita.fecha.split('-')[1]) - 1;

        if (cita.estado === 'Inactiva' && fechaHoyC > fechaHasta) {
            diasVencidos.push(cita.fecha.split('-').reverse().join('/'))
            if(mesCita === mesActual.value) {
                diasVencidosMes.push(cita.fecha.split('-').reverse().join('/'))
            }
        }
    })
    return {
        diasVencidos,
        diasVencidosMes
    }
})

const diasVencidos = computed(() => vencidasProcesadas.value.diasVencidos);
const diasVencidosMes = computed(() => vencidasProcesadas.value.diasVencidosMes);

const citasProximas = computed(() => {
    const arrayCitas = [];
    Citas.value.map((cita) => {
        const fechaHoyC = parseFechaISO(new Date().toISOString().split('T')[0]);
        const fecha = parseFechaISO(cita.fecha);
        const mesCita = new Date(cita.fecha).getMonth();
        if (cita.estado === 'Inactiva' && fecha > fechaHoyC && mesCita == mesActual.value) {
            arrayCitas.push(cita.fecha.split('-').reverse().join('/'))
        }
    })
    return arrayCitas
})

// Carga el rango del mes visible si el store aún no lo tiene (1 petición, cacheada/deduplicada)
async function asegurarMesVisible() {
    const anho = calendario.value[años.value - añoDesde.value]
    if (!anho) return
    const mes = anho.meses[mesActual.value]
    if (!mes) return
    const prefijo = `${años.value}-${String(mesActual.value + 1).padStart(2, '0')}-`
    if (Citas.value.some(c => c.fecha?.startsWith(prefijo))) return
    const m = String(mesActual.value + 1).padStart(2, '0')
    await citasStore.citasPorRango(`${años.value}-${m}-01`, `${años.value}-${m}-${String(mes.dias).padStart(2, '0')}`)
}

// Navegar entre meses
const anteriorMes = () => {
    if (mesActual.value === 0 && años.value === añoDesde.value) {
        options.position = 'top-end';
        options.texto = "Fecha mínima permitida";
        options.tiempo = 1500
        mensaje()
        return
    }
    if (mesActual.value === 0 && años.value > añoDesde.value) {
        mesActual.value = 11;
        meses.value = 12
        años.value--; // Resta el año si venimos de enero
    } else {
        meses.value--
        mesActual.value--;
    }

    citasStore.citasPorRango(`${años.value}-${meses.value}-01`,`${años.value}-${meses.value}-31`)
};

const siguienteMes = () => {
    if (mesActual.value === 11) {
        mesActual.value = 0;
        meses.value = 1
        años.value++; // Suma el año si avanzamos desde diciembre
    } else {
        mesActual.value++;
        meses.value++
    }
    citasStore.citasPorRango(`${años.value}-${meses.value}-01`,`${años.value}-${meses.value}-31`)
};

// ─────────────────────────────────────────────
// Vista SEMANA
// ─────────────────────────────────────────────
const diasDeLaSemana = computed(() => {
    const base = parseFechaDDMM(fecha.value);
    const diaSemanaIdx = (base.getDay() + 6) % 7; // 0 = lunes
    const lunes = new Date(base);
    lunes.setDate(base.getDate() - diaSemanaIdx);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lunes);
        d.setDate(lunes.getDate() + i);
        const f = aDDMM(d);
        return {
            dia: d.getDate(),
            nombre: diasSemanaCorto[i],
            fecha: f,
            citas: citasDelDia(f),
            esHoy: f === fechaActual.value,
            seleccionado: f === fecha.value
        };
    });
});

const tituloSemana = computed(() => {
    const lista = diasDeLaSemana.value;
    const primero = parseFechaDDMM(lista[0].fecha);
    const ultimo = parseFechaDDMM(lista[6].fecha);
    const mesI = nombresMeses[primero.getMonth()];
    const mesF = nombresMeses[ultimo.getMonth()];
    if (primero.getMonth() === ultimo.getMonth()) {
        return `${primero.getDate()} - ${ultimo.getDate()} de ${mesI} ${ultimo.getFullYear()}`;
    }
    return `${primero.getDate()} ${mesI} - ${ultimo.getDate()} ${mesF}`;
});

const anteriorSemana = () => {
    const base = parseFechaDDMM(fecha.value);
    base.setDate(base.getDate() - 7);
    irAFecha(aDDMM(base));
};

const siguienteSemana = () => {
    const base = parseFechaDDMM(fecha.value);
    base.setDate(base.getDate() + 7);
    irAFecha(aDDMM(base));
};

// ─────────────────────────────────────────────
// Vista DÍA (agenda por horas)
// ─────────────────────────────────────────────
const agendaDia = computed(() => {
    const HORA_INICIO = preferencias.horaInicio
    const HORA_FIN = preferencias.horaFin
    const citas = citasDelDia(fecha.value);
    const conHora = [];
    const sinHora = [];

    citas.forEach((cita) => {
        const hora = parseInt((cita.hora || '').substring(0, 2), 10);
        if (!Number.isNaN(hora) && hora >= HORA_INICIO && hora <= HORA_FIN && cita.hora !== '00:00:00') {
            conHora.push({ ...cita, _hora: hora });
        } else {
            sinHora.push(cita);
        }
    });

    const franjas = [];
    for (let h = HORA_INICIO; h <= HORA_FIN; h++) {
        franjas.push({
            hora: h,
            etiqueta: `${String(h).padStart(2, '0')}:00`,
            citas: conHora.filter(c => c._hora === h)
        });
    }

    return { franjas, sinHora, total: citas.length };
});

const tituloDia = computed(() => {
    const d = parseFechaDDMM(fecha.value);
    const nombreDia = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
    return `${nombreDia} ${d.getDate()} de ${nombresMeses[d.getMonth()]} ${d.getFullYear()}`;
});

const anteriorDia = () => {
    const base = parseFechaDDMM(fecha.value);
    base.setDate(base.getDate() - 1);
    irAFecha(aDDMM(base));
};

const siguienteDia = () => {
    const base = parseFechaDDMM(fecha.value);
    base.setDate(base.getDate() + 1);
    irAFecha(aDDMM(base));
};

// Navegación unificada ‹ › según la vista activa
function navegar(paso) {
    if (vista.value === 'dia') paso < 0 ? anteriorDia() : siguienteDia();
    else if (vista.value === 'semana') paso < 0 ? anteriorSemana() : siguienteSemana();
    else paso < 0 ? anteriorMes() : siguienteMes();
}

// Título del header según la vista
const tituloNavegacion = computed(() => {
    if (vista.value === 'dia') return tituloDia.value;
    if (vista.value === 'semana') return tituloSemana.value;
    return nombreMes.value;
});

function estadoColor(cita) {
    return estadoDeCita(cita).texto
}

function bordeEstado(cita) {
    const clave = claveEstadoCita(cita)
    if (clave === 'finalizada') return 'border-l-green-500'
    if (clave === 'vencida') return 'border-l-red-500'
    if (clave === 'cancelada') return 'border-l-red-400'
    return 'border-l-amber-400'
}

</script>

<template>
    <div class="flex flex-col gap-2">
        <!-- Calendario principal -->
        <div
            class="flex flex-col gap-5 shadow-md rounded-xl p-5 overflow-y-auto scrollForm bg-white dark:bg-gray-700 dark:text-white">

            <!-- Header: navegación + selector de vista -->
            <div class="flex justify-between items-center gap-2 flex-wrap">
                <h2 class="text-2xl font-semibold">{{ tituloNavegacion }}</h2>
                <div class="flex items-center gap-2">
                    <!-- Granularidad: Día / Semana / Mes -->
                    <div class="flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
                        <button v-for="op in VISTAS" :key="op.id" @click="cambiarVista(op.id)"
                            class="flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer transition"
                            :class="vista === op.id
                                ? 'bg-(--color-default) text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'">
                            <UIcon :name="op.icon" class="size-4" />
                            <span class="hidden sm:inline">{{ op.label }}</span>
                        </button>
                    </div>
                    <div @click="navegar(-1)"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer">
                        <i class="fa-solid fa-angle-left text-blue-500"></i>
                    </div>
                    <div @click="navegar(1)"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer">
                        <i class="fa-solid fa-angle-right text-blue-500"></i>
                    </div>
                </div>
            </div>

            <!-- ═══ Vista: MES ═══ -->
            <template v-if="vista === 'mes'">
                <!-- Días de la semana -->
                <div class="grid grid-cols-7 gap-3 text-center font-medium text-gray-600 dark:text-gray-300">
                    <h2 v-for="dia in diasSemana">{{ dia }}</h2>
                </div>

                <!-- Días del mes -->
                <div class="grid grid-cols-7 gap-3">
                    <div v-for="(num, index) in diasDelMes" @click="calendarioCitasStore.cambiarFecha(num.fecha)"
                        class="px-3 py-3 flex justify-center items-center border border-gray-200 dark:border-gray-500 rounded-xl cursor-pointer transition hover:bg-blue-50 dark:hover:bg-gray-600"
                        :class="{
                            'bg-blue-100 dark:bg-blue-700': num.fecha === fecha,
                            'border-2 border-gray-400 !dark:border-gray-600': num.fecha === fechaActual
                        }">
                        <h2 :class="{
                            'border-b-2 border-blue-500': diasConCitas.includes(num.fecha),
                            'text-red-600 dark:text-red-300': diasVencidos?.includes(num.fecha)
                        }">
                            {{ num.dia }}
                        </h2>
                    </div>
                </div>
            </template>

            <!-- ═══ Vista: SEMANA ═══ -->
            <template v-else-if="vista === 'semana'">
                <div class="grid grid-cols-7 gap-2 min-w-0">
                    <div v-for="d in diasDeLaSemana" :key="d.fecha" @click="irAFecha(d.fecha)"
                        class="flex flex-col rounded-xl border transition cursor-pointer min-h-32"
                        :class="d.seleccionado
                            ? 'border-(--color-default) bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-gray-500'">
                        <!-- Cabecera del día -->
                        <div class="text-center py-1.5 border-b border-gray-200 dark:border-gray-600">
                            <p class="text-xs font-medium uppercase"
                                :class="d.esHoy ? 'text-(--color-default) font-bold' : 'text-gray-500 dark:text-gray-300'">
                                {{ d.nombre }}
                            </p>
                            <p class="text-lg font-bold leading-tight"
                                :class="d.esHoy ? 'text-(--color-default)' : ''">
                                {{ d.dia }}
                                <UIcon v-if="d.esHoy" name="i-lucide-circle" class="size-2 fill-current inline -mt-2" />
                            </p>
                        </div>
                        <!-- Citas del día -->
                        <div class="flex-1 p-1.5 flex flex-col gap-1 overflow-y-auto scrollForm max-h-40">
                            <div v-for="cita in d.citas" :key="cita.id"
                                class="text-[11px] leading-tight px-1.5 py-1 rounded-md border-l-2 bg-white dark:bg-gray-800 shadow-xs truncate"
                                :class="bordeEstado(cita)">
                                <span class="font-semibold" :class="estadoColor(cita)">
                                    {{ cita.hora && cita.hora !== '00:00:00' ? cita.hora.substring(0, 5) : '—' }}
                                </span>
                                <span class="text-gray-700 dark:text-gray-200 ml-1">
                                    {{ cita.paciente?.info_usuario?.name || 'Paciente' }}
                                </span>
                            </div>
                            <p v-if="!d.citas.length" class="text-[10px] text-gray-400 dark:text-gray-500 text-center pt-1">
                                —
                            </p>
                        </div>
                    </div>
                </div>
            </template>

            <!-- ═══ Vista: DÍA (agenda por horas) ═══ -->
            <template v-else>
                <!-- Citas sin hora -->
                <div v-if="agendaDia.sinHora.length"
                    class="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
                    <p class="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                        <UIcon name="i-lucide-clock" class="size-3.5 inline mr-1" />Sin hora asignada
                    </p>
                    <div v-for="cita in agendaDia.sinHora" :key="cita.id"
                        class="text-sm px-2 py-1 rounded-md border-l-2 bg-white dark:bg-gray-800 mb-1"
                        :class="bordeEstado(cita)">
                        <span class="font-medium">{{ cita.paciente?.info_usuario?.name || 'Paciente' }}</span>
                        <span class="text-gray-500 text-xs ml-2">{{ cita.servicio?.name }}</span>
                    </div>
                </div>

                <!-- Franja horaria -->
                <div class="flex flex-col">
                    <div v-for="franja in agendaDia.franjas" :key="franja.hora"
                        class="grid grid-cols-[52px_1fr] gap-2 border-t border-gray-100 dark:border-gray-600 py-1.5 min-h-10">
                        <span class="text-xs font-mono text-gray-400 dark:text-gray-500 pt-1">{{ franja.etiqueta }}</span>
                        <div class="flex flex-col gap-1">
                            <div v-for="cita in franja.citas" :key="cita.id"
                                class="flex items-center gap-2 px-2 py-1.5 rounded-lg border-l-4 bg-white dark:bg-gray-800 shadow-xs"
                                :class="bordeEstado(cita)">
                                <span class="text-sm font-semibold shrink-0" :class="estadoColor(cita)">
                                    {{ cita.hora.substring(0, 5) }}
                                </span>
                                <div class="min-w-0 flex-1">
                                    <p class="text-sm font-medium truncate">{{ cita.paciente?.info_usuario?.name || 'Paciente' }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {{ cita.servicio?.name }}<template v-if="cita.motivo"> · {{ cita.motivo }}</template>
                                    </p>
                                </div>
                                <UBadge :color="badgeEstado(cita).color" variant="subtle" size="sm">
                                    {{ badgeEstado(cita).label }}
                                </UBadge>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="!agendaDia.total" class="w-full py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                    No hay citas programadas para este día.
                </div>
            </template>
        </div>

        <!-- Footer resumen del mes (las métricas globales viven en el encabezado) -->
        <div class="w-full bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-xl shadow-md px-4 py-2 flex justify-around items-center">
            <div class="flex flex-col items-center">
                <span class="text-base font-bold text-red-600 dark:text-red-300">{{ diasVencidosMes.length }}</span>
                <span class="text-xs text-gray-600 dark:text-gray-300">Vencidas</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-base font-bold text-blue-600">{{ diasConCitasMes.length }}</span>
                <span class="text-xs text-gray-600 dark:text-gray-300">Pendientes</span>
            </div>
            <div class="flex flex-col items-center">
                <span class="text-base font-bold text-green-600">{{ citasProximas.length || 0 }}</span>
                <span class="text-xs text-gray-600 dark:text-gray-300">Próximas</span>
            </div>
        </div>

    </div>

</template>
