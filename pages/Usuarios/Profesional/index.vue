<script setup>
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import Form from "~/components/organism/Forms/Form.vue";
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import PanelAccionesProfesionales from '~/components/organism/Profesionales/PanelAccionesProfesionales.vue';
import CardProfesiones from '~/components/organism/Profesionales/CardProfesiones.vue';
import CardPermisos from '~/components/organism/Profesionales/CardPermisos.vue';
import CardEstadisticas from '~/components/organism/Profesionales/CardEstadisticas.vue';

// Data
import { ref, onMounted, computed, h, watch } from 'vue';
import { municipios } from '~/data/municipios.js'
import { useUsuarioValidaciones } from "~/composables/Usuarios/Usuarios.js";
import { useProfesionalActions } from '~/composables/Entidades/Profesional';
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { useProfesionalBuilder } from '~/build/Profesional/useProfesionalFormBuilder';
import { useProfesionStore } from "~/stores/Entidades/Profesion";
import ModalProfesiones from "~/components/organism/Profesionales/ModalProfesiones.vue";
import Restringido from "~/components/organism/NoEnviados/Restringido.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const profesionalStore = useProfesionalStore();
const profesionStore = useProfesionStore();
const noEnviados = useNoEnviados()

const medicos = ref([]);
const profesiones = ref([]);
const profesionesList = ref([]);
const municipiosList = ref([])
const municipios_laboral = ref([])
const refresh = ref(1);
const puedeVer = varView.getPermisos.includes('Profesional_view');
const puedeGet = varView.getPermisos.includes('Profesional_get');
const puedePost = varView.getPermisos.includes('Profesional_post');
const puedePut = varView.getPermisos.includes('Profesional_put');

// Estados para modales y vistas

const { showNuevaProfesion, showModificarProfesion, ProfesionNoEnviados } = storeToRefs(profesionStore)
const { Profesionales, showModificarOffline, showNuevoProfesional, showModificarProfesional, NoEnviados } = storeToRefs(profesionalStore)

async function llamadatos(cambio) {
    await profesionalStore.traer(true, cambio);
    varView.datosActualizados()
}

async function llamaProfesiones(cambio) {
    profesionesList.value = await profesionStore.traer(true, cambio)
}

async function llamaProfesionesList() {
    profesiones.value = profesionesList.value.map((profesion) => {
        return { label: profesion.nombre, value: profesion.id }
    });
    profesiones.value.push({ 
        label: 'Sin profesion', 
        value: null 
    })
    profesiones.value.unshift({
        label: 'Agregar Profesión',
        icon: 'i-lucide-plus',
        onSelect: () => {
            showNuevaProfesion.value = true
        }
    })
}

async function llamaNoEnviados() {
    await profesionalStore.traerNoEnviados()
    await profesionStore.traerNoEnviados()
}

const {
    validarFecha,
    validarTipoDoc,
    buscarUsuarioPorDocumento,
    municipiosOptions,
    municipiosOptionsProfesional
} = useUsuarioValidaciones(profesionalStore.Formulario, 'Profesional');

const {
    agregarMedico,
    modificarMedico,
    cerrar,
    eliminarProfesional,
    eliminarProfesionalOffline,
    columns,
    columnsOffline
} = useProfesionalActions({
    profesionalStore,
    varView,
    notificaciones,
    llamadatos,
    refresh
});

// Watch para actualizar información al agregar o actualizar
watch(() => showNuevoProfesional.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        await llamadatos(true);
        await llamaNoEnviados()
        refresh.value++
    }
})

watch(() => showModificarProfesional.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        await llamadatos(true);
        await llamaNoEnviados()
        refresh.value++
    }
})

watch(() => showNuevaProfesion.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        await llamaProfesiones(true);
        await llamaProfesionesList()
        await llamaNoEnviados()
        refresh.value++
    }
})

watch(() => showModificarProfesion.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        await llamaProfesiones(true);
        await llamaNoEnviados()
        refresh.value++
    }
})

// Cargar los Profesionales desde el store
onMounted(async () => {
    await profesionalStore.traer(false);
    await llamadatos()
    await llamaProfesiones()
    await llamaNoEnviados()
    await llamaProfesionesList()
});

const propiedadesUser = puedePost
    ? computed(() => {
        return useProfesionalBuilder({
            storeId: 'NuevoProfesional',
            storePinia: 'Profesionales',
            cerrarModal: cerrar,
            show: showNuevoProfesional,
            tipoFormulario: 'Wizard',
            buscarUsuario: buscarUsuarioPorDocumento,
            departamentos: municipios,
            municipiosList: municipiosList,
            municipios_laboral: municipios_laboral,
            opcionesProfesion: profesiones.value,
            validarFecha,
        })
    })
    : null;

const propiedadesVerUser = puedePut
    ? computed(() => {
        return useProfesionalBuilder({
            storeId: 'ModificarProfesional',
            storePinia: 'Profesionales',
            cerrarModal: cerrar,
            show: showModificarProfesional,
            tipoFormulario: 'Wizard',
            buscarUsuario: buscarUsuarioPorDocumento,
            municipiosList: municipiosList,
            municipios_laboral: municipios_laboral,
            opcionesProfesion: profesiones.value,
            verUser: true,
            eliminar: eliminarProfesional,
            soloVer: varView.soloVer,
            validarFecha,
        })
    })
    : null;

const propiedadesVerUserOffline = puedePut
    ? computed(() => {
        return useProfesionalBuilder({
            storeId: 'ModificarProfesionalOffline',
            storePinia: 'Profesionales',
            cerrarModal: cerrar,
            show: showModificarOffline,
            tipoFormulario: 'Wizard',
            buscarUsuario: buscarUsuarioPorDocumento,
            municipiosList: municipiosList,
            municipios_laboral: municipios_laboral,
            opcionesProfesion: profesiones.value,
            verUser: true,
            soloVer: varView.soloVer,
            validarFecha,
        })
    })
    : null;

// Tabs integrados
const tabsIntegrados = [
    {
        label: 'Profesionales',
        slot: 'profesionales',
        icon: 'i-lucide-users'
    },
    {
        label: 'Profesiones',
        slot: 'profesiones',
        icon: 'i-lucide-briefcase'
    },
    {
        label: 'Permisos',
        slot: 'permisos',
        icon: 'i-lucide-lock'
    }

]

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Profesionales',
        llamadatos: llamadatos,
        agregar: puedePost ? agregarMedico : null,
        data: Profesionales,
        columns: columns,
        filtros: [
            { columna: 'municipio_laboral', placeholder: 'Ciudad' },
            { columna: 'zona_laboral', placeholder: 'Zona' },
        ],
        excel: true,
    }
})

</script>
<template>
    <!-- Formularios -->
    <Form :Propiedades="propiedadesUser" />
    <Form :Propiedades="propiedadesVerUser" />
    <Form :Propiedades="propiedadesVerUserOffline" />

    <!-- Modal de Permisos -->

    <!-- Página Principal -->
    <FondoDefault v-if="puedeVer">
        <!-- Panel de Acciones Integrado -->
        <!-- <div class="mb-6">
            <PanelAccionesProfesionales :profesionales="medicos" :profesiones="profesionesList"
                :datos-no-enviados="datosNoEnviados" @showNoEnviados="verNoEnviados"
                @sincronizarDatos="sincronizarDatos" />
        </div> -->

        <!-- Sección Integrada (Tabs) -->
        <UTabs :items="tabsIntegrados">
            <template #profesionales>
                <div class="p-6 pb-0">
                    <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
                </div>
            </template>

            <template #profesiones>
                <div class="p-6">
                    <CardProfesiones :profesionales="Profesionales" :profesiones="profesionesList" />
                </div>
            </template>

            <template #permisos>
                <div class="p-6">
                    <CardPermisos :profesionales="medicos" />
                </div>
            </template>

            <!-- <template #estadisticas>
                <div class="p-6">
                    <CardEstadisticas :profesionales="medicos" :profesiones="profesionesList" />
                </div>
            </template> -->

        </UTabs>
    </FondoDefault>

    <Restringido v-else></Restringido>

    <ModalProfesiones />
</template>