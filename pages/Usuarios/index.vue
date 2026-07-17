<script setup>
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import Form from "~/components/organism/Forms/Form.vue";
import CardEPS from "~/components/organism/Pacientes/CardEPS.vue";
import CardConvenios from "~/components/organism/Pacientes/CardConvenios.vue";
import CardKardex from "~/components/organism/Pacientes/CardKardex.vue";
import ModalEPS from "~/components/organism/Pacientes/ModalEPS.vue";
import ModalConvenios from "~/components/organism/Pacientes/ModalConvenios.vue";
import ModalKardexDetalle from "~/components/organism/Pacientes/ModalKardexDetalle.vue";

import { ref, onMounted, watch, computed, h } from "vue";
import { usePacientesStore } from "~/stores/Entidades/Paciente";
import { usePacienteBuilder } from "~/build/Pacientes/usePacienteFormBuilder";
import { useUsuarioValidaciones } from "~/composables/Usuarios/Usuarios.js";
import { usePacienteActions } from "~/composables/Entidades/Paciente";
import { usePlanesBuilder } from "~/build/Historial/usePlanesBuilder.js";
import { useInsumosStore } from "~/stores/Formularios/insumos/Insumos.js";
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { useEpsStore } from '~/stores/Entidades/Eps';
import { useConvenioStore } from '~/stores/Entidades/Convenio';
import { useHistoriaStore } from '~/stores/Entidades/Historia';
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useVarView } from '~/stores/varview';
import { useNotificacionesStore } from '~/stores/notificaciones';
import Restringido from "~/components/organism/NoEnviados/Restringido.vue";

// Verificar permisos específicos
const varView = useVarView();
const puedeVer = varView.getPermisos.includes('Pacientes_view');
const puedePost = varView.getPermisos.includes('Pacientes_post');
const puedePut = varView.getPermisos.includes('Pacientes_put');
const puedediagnosticar = varView.getPermisos.includes('Diagnosticos_view');
const notificaciones = useNotificacionesStore();
const pacientesStore = usePacientesStore();
const insumoStore = useInsumosStore();

// Stores para entidades relacionadas
const epsStore = useEpsStore();
const convenioStore = useConvenioStore();
const historiaStore = useHistoriaStore();
const profesionalStore = useProfesionalStore();
const noEnviados = useNoEnviados()

const { Pacientes, NoEnviados, showNuevoPaciente, showModificarPaciente, showItem } = storeToRefs(pacientesStore)
const { showNuevoConvenio, showModificarConvenio, Convenios, ConveniosNoEnviados } = storeToRefs(convenioStore)
const { showNuevaEps, showModificarEps, Eps, EpsNoEnviados } = storeToRefs(epsStore)

const opcionesEPS = ref([]);
const insumos = ref([]);
const medicamentos = ref([])
const profesionales = ref([])
const refresh = ref(1);
const conveniosOptions = ref([]);
const municipiosList = ref([])
const importacion = ref(null)
const isOpen = ref(false)

// Estados para modales integrados
const showKardexDetalle = ref(false);
const historias = ref([]);
const historiaSeleccionada = ref(null);

const {
    validarFecha,
    validarTipoDoc,
    buscarUsuarioPorDocumento,
} = useUsuarioValidaciones(pacientesStore.Formulario);

async function llamadatos(cambio) {
    await pacientesStore.traer(true, cambio);
    varView.datosActualizados()
}

async function llamaEpsEntidades(cambio) {
    await epsStore.traer(true, cambio);
}

async function llamaConveniosEntidades(cambio) {
    await convenioStore.traer(true, cambio);
}

async function llamaNoEnviados() {
    const pacientes = await pacientesStore.traerNoEnviados()
    const eps = await epsStore.traerNoEnviados()
    const convenios = await convenioStore.traerNoEnviados()

    historias.value = {
        Pacientes: pacientes.length > 0 ? pacientes : null,
        EPS: eps.length > 0 ? eps : null,
        Convenios: convenios.length > 0 ? convenios : null
    }
}

async function llamaConvenios() {
    conveniosOptions.value = Convenios.value.map((convenio) => ({
        label: convenio.nombre,
        value: convenio.id,
    }));

    conveniosOptions.value.unshift({
        label: 'Agregar Convenio',
        icon: 'i-lucide-plus',
        onSelect: () => {showNuevoConvenio.value = true}
    })

    conveniosOptions.value.push({
        label: 'Sin convenio',
        value: 'Sin convenio'
    })
}

async function llamaEps() {
    const EPS = await epsStore.traer(true);
    opcionesEPS.value = EPS.map((eps) => ({
        label: eps.nombre,
        value: eps.id,
    }));

    opcionesEPS.value.unshift({
        label: 'Agregar EPS',
        icon: 'i-lucide-plus',
        onSelect: () => {showNuevaEps.value = true}
    })
}

async function llamaProfesionales() {
    const listProfesionales = await profesionalStore.traer(false)
    profesionales.value = listProfesionales.map(p => {
        return { label: `${p.info_usuario.name} - ${p.info_usuario.No_document}`, value: p.id }
    })
}

async function llamaInsumos() {
    const listInsumos = await insumoStore.listInsumos();
    insumos.value = listInsumos.filter(i => i.es_prestable && i.stock > 0).map(i => {
        return { label: `${i.nombre} - ${i.categoria}`, value: i.id }
    })
    medicamentos.value = listInsumos.filter(i => !i.es_prestable && i.stock > 0).map(i => {
        return { label: `${i.nombre} - ${i.categoria}`, value: i.id }
    })
}

const {
    agregarPaciente,
    verPaciente,
    cerrar,
    eliminarPaciente,
    columns,
    columnsInactivo,
    getRowItems,
    getRowItemsInactivo
} = usePacienteActions({
    pacientesStore,
    varView,
    notificaciones,
    llamadatos,
    refresh,
});

// Refrescar pagina cuando se agrega o modifica Paciente
watch(() => showNuevoPaciente.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
            await llamaNoEnviados()
            refresh.value++;
        }
    }
);

watch(() => showModificarPaciente.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
            await llamaNoEnviados()
            refresh.value++;
        }
    }
);

watch(() => showNuevoConvenio.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamaConveniosEntidades(true);
            await llamaConvenios()
            refresh.value++;
        }
    }
);

watch(() => showModificarConvenio.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamaConveniosEntidades(true);
            await llamaConvenios()
            refresh.value++;
        }
    }
);

watch(() => showNuevaEps.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamaEpsEntidades(true);
            await llamaEps()
            refresh.value++;
        }
    }
);

watch(() => showModificarEps.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamaEpsEntidades(true);
            await llamaEps()
            refresh.value++;
        }
    }
);

// Cargar los pacientes desde el store
onMounted(async () => {
    await pacientesStore.traer(false);
    await llamadatos();
    await llamaProfesionales();
    await llamaInsumos();
    await llamaEpsEntidades();
    await llamaConveniosEntidades();
    await llamaConvenios();
    await llamaEps();
    await llamaNoEnviados();
});

const propiedadesUser = puedePost
    ? computed(() => {
        return usePacienteBuilder({
            storeId: "NuevoPaciente",
            storePinia: "Pacientes",
            cerrarModal: cerrar,
            show: showNuevoPaciente,
            tipoFormulario: "Wizard",
            buscarUsuario: buscarUsuarioPorDocumento,
            municipiosList: municipiosList,
            EPS: opcionesEPS.value,
            agregarDiagnostico: () => { },
            tipoUsuario: "Paciente",
            conveniosOptions: conveniosOptions.value,
            validarFecha,
            validarTipoDoc,
        })
    })
    : null;

const propiedadesVerUser = puedePut
    ? computed(() => {
        return usePacienteBuilder({
            storeId: "ModificarPaciente",
            storePinia: "Pacientes",
            cerrarModal: cerrar,
            show: showModificarPaciente,
            tipoFormulario: "Wizard",
            buscarUsuario: buscarUsuarioPorDocumento,
            municipiosList: municipiosList,
            EPS: opcionesEPS.value,
            agregarDiagnostico: () => { },
            verUser: true,
            soloVer: varView.soloVer,
            eliminar: eliminarPaciente,
            tipoUsuario: "Paciente",
            conveniosOptions: conveniosOptions.value,
            validarFecha,
            validarTipoDoc,
        })
    })
    : null;

const propiedadesItemHistoria = computed(() => {
    return usePlanesBuilder({
        storeId: 'AgregarPlan',
        storePinia: 'Historias',
        cerrarModal: () => {
            showItem.value = false
        },
        formularioItem: 'Medicamento',
        show: showItem.value,
        medicamentos: medicamentos.value,
        insumos: insumos.value,
        profesionales: profesionales.value,
        showPacientes: false
    })
})

const tabsIntegrados = [
    {
        label: 'Pacientes',
        slot: 'paciente',
        icon: 'i-lucide-user'
    },
    {
        label: 'EPS',
        slot: 'eps',
        icon: 'i-lucide-hospital'
    },
    {
        label: 'Convenios',
        slot: 'convenios',
        icon: 'i-lucide-handshake'
    },
    {
        label: 'Kardex Médico',
        slot: 'kardex',
        icon: 'i-lucide-file'
    }
]

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Pacientes',
        llamadatos: llamadatos,
        agregar: puedePost ? agregarPaciente : null,
        data: Pacientes,
        columns: columns,
        filtros: [
            { columna: 'info_usuario.municipio', placeholder: 'Ciudad' },
            { columna: 'eps.nombre', placeholder: 'EPS' },
            { columna: 'estado', placeholder: 'Estado', options: [{label: 'Activos', value: 1}, {label:'Inactivos', value: 0}], accion: async(filtros) => {
                if(filtros.estado == 0){
                    pacientesStore.Pacientes = await pacientesStore.traerInactivos()
                } else {
                    pacientesStore.Pacientes = await pacientesStore.traer(false, false)
                }
            }}
        ],
        excel: true,
        card: {
            header: ['info_usuario.name', 'info_usuario.No_document'],
            body: ['info_usuario.celular', 'sexo', 'info_usuario.municipio', 'regimen', 'eps.nombre', 'estado'],
        },
        rowActions: getRowItems,
    }
})

</script>

<template>
    <!-- Formularios -->
    <Form v-if="propiedadesUser" :Propiedades="propiedadesUser"></Form>
    <Form v-if="propiedadesVerUser" :Propiedades="propiedadesVerUser"></Form>
    <Form v-if="propiedadesItemHistoria" :Propiedades="propiedadesItemHistoria"></Form>

    <!-- Página Principal -->
    <FondoDefault v-if="puedeVer">

        <!-- Sección Integrada (Tabs) -->
        <UTabs :items="tabsIntegrados">
            <template #paciente>
                <div class="md:p-6 pb-0">
                <UAlert color="warning" class="my-4" v-if="historias.Pacientes?.length > 0 || historias.EPS?.length > 0 || historias.Convenios?.length > 0">
                    <template #title>
                        <div class="flex items-center justify-between gap-2">
                            <div>
                                <div>
                                    <i class="fa-solid fa-triangle-exclamation text-white"></i>
                                    Datos No Enviados 
                                </div>
                                <span class="text-xs text-gray-100 dark:text-gray-400">Dirigite hacia la sección de "No Enviados" para sincronizar informacion.</span>
                            </div>
                            <div class="flex gap-2">
                                <UBadge color="neutral" variant="soft">
                                    {{(historias.Pacientes?.length || historias.EPS?.length || historias.Convenios?.length) ? `${(historias.Pacientes?.length || 0) + (historias.EPS?.length || 0) + (historias.Convenios?.length || 0)}` : ''}}
                                </UBadge>
                            </div>
                        </div>
                    </template>
                </UAlert>
                    <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
                </div>
            </template>

            <template #eps>
                <div class="md:p-6">
                    <CardEPS />
                </div>
            </template>

            <template #convenios>
                <div class="md:p-6">
                    <CardConvenios />
                </div>
            </template>

            <template #kardex>
                <div class="md:p-6">
                    <CardKardex />
                </div>
            </template>


        </UTabs>

    </FondoDefault>

    <Restringido v-else/>

    <!-- Modales -->
    <ModalEPS />

    <ModalConvenios/>

    <ModalKardexDetalle v-model="showKardexDetalle" :historia="historiaSeleccionada" />
</template>
