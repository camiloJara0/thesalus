<script setup>
import { ref, onMounted, } from "vue";
import { usePacientesStore } from "~/stores/Entidades/Paciente.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { usePacienteBuilder } from "~/build/Pacientes/usePacienteFormBuilder";
import Form from "./organism/Forms/Form.vue";
import { useConvenioStore } from "~/stores/Entidades/Convenio.js";

const varView = useVarView();
const pacientesStore = usePacientesStore();
const conveniosStore = useConvenioStore()
const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const pacientes = ref([]);
const municipiosList = ref([])
const conveniosOptions = ref([])

const { showNuevoPaciente } = storeToRefs(pacientesStore)
const { Convenios } = storeToRefs(conveniosStore)

const props = defineProps(['showPaciente']);

async function llamadatos() {
    pacientes.value = await pacientesStore.traer();
}

async function llamaConvenios() {
    conveniosOptions.value = Convenios.value.map((convenio) => ({
        label: convenio.nombre,
        value: convenio.id,
    }));

    conveniosOptions.value.push({
        label: 'Sin convenio',
        value: 'Sin convenio'
    })
}


// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true;
    await llamadatos();
    await conveniosStore.traer(false)
    await llamaConvenios()

    const EPS = await epsStore.listEPS();
    opcionesEPS.value = await EPS.map((eps) => ({
        label: eps.nombre,
        value: eps.id,
    }));

    varView.cargando = false;
});

function cerrar() {
  showNuevoPaciente.value = false
}

// Construccion de pagina

const propiedades = computed(() => {

    return usePacienteBuilder({
        storeId: "NuevoPaciente",
        storePinia: "Pacientes",
        cerrarModal: cerrar,
        show: showNuevoPaciente,
        tipoFormulario: "Wizard",
        buscarUsuario: () => {},
        municipiosList: municipiosList,
        EPS: opcionesEPS.value,
        agregarDiagnostico: () => { },
        tipoUsuario: "Paciente",
        conveniosOptions: conveniosOptions.value,
        validarFecha: () => {},
        validarTipoDoc: () => {},
    });
});

</script>

<template>
    <Form v-if="showNuevoPaciente" :Propiedades="propiedades" />
</template>
