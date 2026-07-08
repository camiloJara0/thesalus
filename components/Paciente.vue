<script setup>
import Pagina from "~/components/organism/Pagina/Pagina.vue";

import { ref, onMounted, } from "vue";
import { usePacientesStore } from "~/stores/Entidades/Paciente.js";
import { ComponenteBuilder } from "~/build/Constructores/ComponentesBuilder.js";
import { useUserBuilder } from "~/build/Usuarios/useUserFormBuilder.js";
import { municipios } from "~/data/municipios.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { mapCampos } from "./organism/Forms/useFormulario";
import { CIE10 } from "~/data/CIE10";

const varView = useVarView();
const pacientesStore = usePacientesStore();
const medicoStore = useProfesionalStore()
const MedicosList = ref([])
const epsStore = useDatosEPSStore();
const opcionesEPS = ref([]);
const pacientes = ref([]);

const props = defineProps(['showPaciente']);

async function llamadatos() {
    pacientes.value = await pacientesStore.traer();
}

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true;
    await llamadatos();

    const EPS = await epsStore.listEPS();
    opcionesEPS.value = await EPS.map((eps) => ({
        text: eps.nombre,
        value: eps.id,
    }));

    MedicosList.value = await medicoStore.traer();

    varView.cargando = false;
});

function cerrar() {
  varView.showNuevoPaciente = false
}

async function buscarUsuario (event) {
    const document = event.target.value
    const store = useIndexedDBStore()
    store.almacen = 'InformacionUser'
    const usuarios = await store.leerdatos()

    const usuarioExistente = usuarios.filter((user) => {
        return user.No_document === document
    });

    if(usuarioExistente[0]){
        mapCampos(usuarioExistente[0], pacientesStore.Formulario)
    }

}

function validarFecha(event) {
    const fecha = new Date(event.target.value);
    const hoy = new Date();

    let mensajeError = '' 
    // Calcular edad
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
    }

    if (edad < 0 || edad > 100) {
        mensajeError = "La edad debe estar entre 0 y 100 años";
    }

    // Validación según tipo de documento
    if (pacientesStore.Formulario.InformacionUser.type_doc === "cedula" && edad < 18) {
        mensajeError = "Para cédula, la edad mínima es 18 años";
    }

    if (pacientesStore.Formulario.InformacionUser.type_doc === "Tarjeta de identidad" && edad > 17) {
        mensajeError = "Para tarjeta de identidad, la edad máxima es 17 años";
    }

    const errorDiv = document.getElementById(`error-fecha`);
    if (errorDiv) {
        if (mensajeError) {
            errorDiv.innerHTML = `<p>${mensajeError}</p>`;
        } else {
            errorDiv.innerHTML = ''; // Limpia el mensaje si no hay error
        }
    }
}

const municipiosOptions = computed(() => {
    const departamentoSeleccionado = pacientesStore.Formulario.InformacionUser.departamento;

    const departamento = municipios.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

    return departamento ? departamento.municipios : [];
});


const camposRequeridos = []

// Construccion de pagina

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder();

    const propiedadesUser = useUserBuilder({
        storeId: "NuevoPaciente",
        storePinia: "Pacientes",
        camposRequeridos,
        cerrarModal: cerrar,
        show: varView.showNuevoPaciente,
        tipoFormulario: "Wizard",
        buscarUsuario,
        departamentos: municipios,
        seleccionarDepartamento: () => {},
        municipios: municipiosOptions,
        seleccionarMunicipio: () => { },
        EPS: opcionesEPS,
        agregarDiagnostico: () => { },
        seleccionarCIE_10: () => {},
        CIE10: CIE10,
        tipoUsuario: "Paciente",
        validarFecha,
        MedicosList: MedicosList
    });

    return pagina
        .setFondo('FondoDefault')
        .addComponente("Form", propiedadesUser)
        .build();
});

</script>

<template>
    <Pagina :Propiedades="propiedades" />
</template>
