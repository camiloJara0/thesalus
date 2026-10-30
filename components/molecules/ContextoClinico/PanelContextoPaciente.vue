<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';

const historiasStore = useHistoriasStore();
const expandido = ref(false);
const cargando = ref(false);

const idPaciente = computed(() =>
    historiasStore.Formulario?.Analisis?.historia?.id_paciente || null
);

const nombrePaciente = computed(() =>
    historiasStore.Formulario?.Analisis?.historia?.name_paciente || ''
);

// Registros cacheados del paciente (capa IndexedDB del store, TTL 120s)
const registros = computed(() => {
    const lista = historiasStore.Analisis || [];
    if (!idPaciente.value) return [];
    return lista.filter(a =>
        String(a.historia?.id_paciente ?? '') === String(idPaciente.value)
    );
});

const ultimaAtencion = computed(() => {
    const conFecha = registros.value.filter(a => a.created_at);
    if (!conFecha.length) return null;
    return [...conFecha].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )[0];
});

const diagnosticosPrevios = computed(() => {
    const dx = [];
    registros.value.forEach(a => {
        (a.diagnosticos || []).forEach(d => {
            if (d?.descripcion && !dx.includes(d.descripcion)) dx.push(d.descripcion);
        });
    });
    return dx.slice(0, 8);
});

const medicamentosPrevios = computed(() => {
    const meds = [];
    registros.value.forEach(a => {
        (a.medicamentos || []).forEach(m => {
            if (m?.medicamento && !meds.includes(m.medicamento)) meds.push(m.medicamento);
        });
    });
    return meds.slice(0, 6);
});

const conteoPorServicio = computed(() => {
    const mapa = {};
    registros.value.forEach(a => {
        const nombre = a.servicio?.plantilla || a.servicio?.name || 'Otro';
        mapa[nombre] = (mapa[nombre] || 0) + 1;
    });
    return Object.entries(mapa)
        .map(([servicio, total]) => ({ servicio, total }))
        .sort((a, b) => b.total - a.total);
});

function fechaCorta(texto) {
    if (!texto) return '';
    const d = new Date(texto);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-CO');
}

async function cargarContexto() {
    if (!idPaciente.value) return;
    cargando.value = true;
    try {
        await historiasStore.analisisPaciente(idPaciente.value);
    } catch (e) {
        console.error('Error cargando contexto clínico:', e);
    } finally {
        cargando.value = false;
    }
}

onMounted(cargarContexto);
watch(idPaciente, cargarContexto);
</script>

<template>
    <!-- Disparador colapsado -->
    <button v-if="idPaciente" @click="expandido = !expandido"
        class="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg bg-(--color-default) text-white text-xs font-semibold hover:opacity-90 transition cursor-pointer">
        <i class="fa-solid fa-notes-medical"></i>
        <span class="hidden lg:inline">Contexto clínico</span>
        <UIcon :name="expandido ? 'i-lucide-chevron-right' : 'i-lucide-chevron-left'" class="size-3.5" />
    </button>

    <!-- Panel expandido -->
    <UCard v-if="expandido" class="shadow-2xl border border-gray-200 dark:border-gray-700 h-[70vh] overflow-y-auto scrollForm">
        <template #header>
            <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                    <p class="text-[11px] text-gray-400 leading-none">Contexto del paciente</p>
                    <p class="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
                        {{ nombrePaciente || 'Paciente' }}
                    </p>
                </div>
                <button @click="expandido = false"
                    class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer shrink-0">
                    <i class="fa-solid fa-close text-gray-400 text-xs"></i>
                </button>
            </div>
        </template>

        <div v-if="cargando" class="flex justify-center py-6">
            <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-blue-400" />
        </div>

        <div v-else class="space-y-3 text-xs">
            <!-- Resumen de atenciones -->
            <div>
                <p class="text-gray-400 mb-1">Atenciones registradas</p>
                <div v-if="conteoPorServicio.length" class="flex flex-wrap gap-1.5">
                    <UBadge v-for="item in conteoPorServicio" :key="item.servicio" color="neutral"
                        variant="subtle">
                        {{ item.servicio }}: {{ item.total }}
                    </UBadge>
                </div>
                <p v-else class="text-gray-400">Sin registros previos</p>
            </div>

            <!-- Última atención -->
            <div v-if="ultimaAtencion" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                <p class="text-blue-700 dark:text-blue-300 font-semibold">Última atención</p>
                <p class="text-gray-800 dark:text-gray-100">
                    {{ ultimaAtencion.servicio?.name || '—' }}
                    <span class="text-gray-400">· {{ fechaCorta(ultimaAtencion.created_at) }}</span>
                </p>
                <p class="text-gray-500 dark:text-gray-400">
                    {{ ultimaAtencion.profesional?.info_usuario?.name || '' }}
                </p>
                <p v-if="ultimaAtencion.motivo" class="text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                    {{ ultimaAtencion.motivo }}
                </p>
            </div>

            <!-- Diagnósticos previos -->
            <div v-if="diagnosticosPrevios.length">
                <p class="text-gray-400 mb-1">Diagnósticos previos</p>
                <div class="flex flex-wrap gap-1">
                    <UBadge v-for="(dx, i) in diagnosticosPrevios" :key="i" color="info" variant="subtle"
                        class="normal-case">
                        {{ dx }}
                    </UBadge>
                </div>
            </div>

            <!-- Medicamentos recientes -->
            <div v-if="medicamentosPrevios.length">
                <p class="text-gray-400 mb-1">Medicamentos recientes</p>
                <ul class="space-y-0.5 text-gray-700 dark:text-gray-200">
                    <li v-for="(med, i) in medicamentosPrevios" :key="i" class="flex items-start gap-1.5">
                        <i class="fa-solid fa-pill text-[9px] text-pink-400 mt-1"></i>
                        <span>{{ med }}</span>
                    </li>
                </ul>
            </div>

            <p class="text-[10px] text-gray-300 dark:text-gray-600 pt-1 border-t border-gray-100 dark:border-gray-800">
                Información de apoyo. No interfiere con el diligenciamiento.
            </p>
        </div>
    </UCard>
</template>
