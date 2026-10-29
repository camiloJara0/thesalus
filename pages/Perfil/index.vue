<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';

import { ref, computed, onMounted, watch } from 'vue';
import { municipios } from '~/data/municipios.js';
import { useUsuarioValidaciones } from "~/composables/Usuarios/Usuarios.js";
import { useProfesionalActions } from '~/composables/Entidades/Profesional';
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { usePerfilStore } from '~/stores/perfil';
import { useProfesionalBuilder } from '~/build/Profesional/useProfesionalFormBuilder';
import { useProfesionStore } from "~/stores/Entidades/Profesion";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const perfilStore = usePerfilStore();
const profesionalStore = useProfesionalStore();
const profesionStore = useProfesionStore();
const route = useRoute();
const config = useRuntimeConfig();

const municipiosList = ref([]);
const municipios_laboral = ref([]);
const profesiones = ref([]);
const cargando = ref(true);

const { showModificarProfesional } = storeToRefs(profesionalStore);

const { validarFecha, validarTipoDoc } = useUsuarioValidaciones(profesionalStore.Formulario, 'Profesional');

const { modificarMedico, cerrar } = useProfesionalActions({
    profesionalStore,
    varView,
    notificaciones,
    llamadatos: async () => { },
    refresh: ref(1),
});

const iniciales = computed(() => {
    const nombre = perfilStore.usuario?.name || '';
    return nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase() || '?';
});

const rolEtiqueta = computed(() => {
    if (perfilStore.rol === 'Admin') return 'Administrador';
    if (perfilStore.rol === 'Profesional') return 'Profesional';
    return perfilStore.rol || '';
});

function opcionesDeDepartamento(departamento) {
    const dep = municipios?.find(d => d.nombre === departamento);
    return dep
        ? dep.municipios.map(m => ({ label: `${m.NOMBRE} - ${m.CODIGO_MUNICIPIO}`, value: m.NOMBRE }))
        : [];
}

function editarMiPerfil() {
    const profesional = perfilStore.profesional;
    if (!profesional) return;

    municipiosList.value = opcionesDeDepartamento(profesional.info_usuario?.departamento);
    municipios_laboral.value = opcionesDeDepartamento(profesional.departamento_laboral);

    modificarMedico(profesional);
}

watch(showModificarProfesional, (abierto) => {
    if (!abierto && perfilStore.cargado) {
        perfilStore.cargar(true);
    }
});

onMounted(async () => {
    await perfilStore.cargar();

    if (perfilStore.esProfesional) {
        try {
            const lista = await profesionStore.traer(false) || [];
            profesiones.value = lista.map(p => ({ label: p.nombre, value: p.id }));
        } catch (error) {
            console.error('Error al cargar profesiones:', error);
        }
    }

    cargando.value = false;

    if (route.query.editar && perfilStore.esProfesional && perfilStore.profesional) {
        editarMiPerfil();
    }
});

const propiedadesPerfil = computed(() => useProfesionalBuilder({
    storeId: 'ModificarProfesional',
    storePinia: 'Profesionales',
    cerrarModal: cerrar,
    show: showModificarProfesional,
    tipoFormulario: 'Wizard',
    municipiosList: municipiosList,
    municipios_laboral: municipios_laboral,
    opcionesProfesion: profesiones.value,
    verUser: true,
    perfil: true,
    soloVer: false,
    validarFecha,
    validarTipoDoc,
}));

</script>

<template>
    <Form :Propiedades="propiedadesPerfil" />

    <FondoDefault v-if="!cargando">
        <div class="md:p-6 space-y-6 max-w-3xl mx-auto w-full">
            <!-- Encabezado -->
            <div class="flex items-center gap-4">
                <div
                    class="w-14 h-14 rounded-full bg-(--color-default-200) text-white flex items-center justify-center text-xl font-bold shrink-0">
                    {{ iniciales }}
                </div>
                <div>
                    <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">Mi perfil</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ rolEtiqueta }}</p>
                </div>
            </div>

            <!-- Aviso de sello y firma (solo profesional sin sello) -->
            <div v-if="perfilStore.esProfesional && !perfilStore.tieneSello && perfilStore.profesional"
                class="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-amber-400 bg-amber-50 dark:bg-amber-900/30 p-4">
                <div class="flex items-start gap-3">
                    <i class="fa-solid fa-triangle-exclamation text-amber-500 text-xl mt-1"></i>
                    <div>
                        <p class="font-semibold text-amber-800 dark:text-amber-200">Falta tu sello y firma</p>
                        <p class="text-sm text-amber-700 dark:text-amber-300">
                            Debes cargar tu sello y firma para que los PDFs se generen con tu firma.
                        </p>
                    </div>
                </div>
                <button @click="editarMiPerfil"
                    class="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer">
                    <i class="fa-solid fa-signature mr-2"></i>Cargar ahora
                </button>
            </div>

            <!-- Datos del perfil -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-4">
                <div class="flex items-center justify-between">
                    <h2 class="font-semibold text-gray-700 dark:text-gray-200">
                        <i class="fa-solid fa-id-card text-blue-500 mr-2"></i>Datos personales
                    </h2>
                    <button v-if="perfilStore.esProfesional && perfilStore.profesional" @click="editarMiPerfil"
                        class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-semibold cursor-pointer">
                        <i class="fa-solid fa-pen mr-1"></i>Editar
                    </button>
                </div>

                <div class="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-400">Nombre</p>
                        <p class="font-medium text-gray-700 dark:text-gray-200">{{ perfilStore.usuario?.name || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-400">Documento</p>
                        <p class="font-medium text-gray-700 dark:text-gray-200">
                            {{ perfilStore.usuario?.No_document || '—' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-gray-400">Correo</p>
                        <p class="font-medium text-gray-700 dark:text-gray-200">{{ perfilStore.correo || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-400">Celular</p>
                        <p class="font-medium text-gray-700 dark:text-gray-200">{{ perfilStore.usuario?.celular || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-400">Ciudad</p>
                        <p class="font-medium text-gray-700 dark:text-gray-200">{{ perfilStore.usuario?.municipio || '—' }}</p>
                    </div>
                    <div v-if="perfilStore.esProfesional">
                        <p class="text-gray-400">Profesión</p>
                        <p class="font-medium text-gray-700 dark:text-gray-200">
                            {{ perfilStore.profesional?.profesion?.nombre || '—' }}
                        </p>
                    </div>
                </div>

                <!-- Sello y firma -->
                <div v-if="perfilStore.esProfesional" class="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p class="text-gray-400 text-sm mb-2">Sello y firma para PDFs</p>
                    <img v-if="perfilStore.tieneSello"
                        :src="`${config.public.api}/storage/${perfilStore.profesional.sello}`" alt="Sello y firma"
                        class="max-h-24 border rounded-lg p-1 bg-white" />
                    <p v-else class="text-sm text-amber-600 dark:text-amber-400 font-medium">
                        <i class="fa-solid fa-circle-info mr-1"></i>Aún no tienes sello y firma cargados.
                    </p>
                </div>
            </div>
        </div>
    </FondoDefault>
</template>
