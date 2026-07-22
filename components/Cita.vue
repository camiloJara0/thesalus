<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'

import { useFormularioCitaBuilder } from '~/build/Usuarios/useCitasFormBuilder'
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { usePacientesStore } from "~/stores/Entidades/Paciente";
import { useProfesionalStore } from '~/stores/Entidades/Profesional';;
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio'
import { ref, onMounted } from 'vue'

const citasStore = useCitasStore();
const varView = useVarView();
const { hasPermiso } = usePermisos()
const puedePost = hasPermiso('Citas_post')
const puedePut = hasPermiso('Citas_put')

const pacientesStore = usePacientesStore();
const medicosStore = useProfesionalStore();
const medicosList = ref([]);
const pacientesList = ref([]);

const servicioStore = useDatosServicioStore()
const storeCodigos = useCodigos()
const servicios = ref([])
const optionsTratamientos = ref(null)
const showTratamientos = ref(false)
const variasCitas = ref(false)
const rangoFecha = ref(varView.rangoCita)
const nuevoProcedimiento = ref(false)
const CIE10 = ref([])

onMounted(async () => {
    const pacientes = await pacientesStore.traer(true, true);
    pacientesList.value = pacientes.map(p => {return {label: `${p.info_usuario.name} - ${p.info_usuario.No_document}`, value: p.id}})
    const medicos = await medicosStore.traer()
    medicosList.value = medicos.map(m => { return {label: `${m.info_usuario.name} - ${m.info_usuario.No_document}`, value: m.id}})

    CIE10.value = await storeCodigos.leerdatos();
    servicios.value = await servicioStore.listServicios();
    servicios.value = servicios.value.map((s) => {return {label: s.name, value: s.id}})
});


// Funciones para manejar la visibilidad de los formularios
function cerrar() {
    varView.showNuevaCita = false
    varView.showActualizarCita = false
}

// Construccion de pagina
const propiedades = computed(() => {
    const propiedadesCita = puedePost ? useFormularioCitaBuilder({
        storeId: 'NuevaCita',
        storePinia: 'Citas',
        cerrarModal: cerrar,
        show: varView.showNuevaCita,
        verUser: false,
        pacientesList: pacientesList.value,
        medicosList: medicosList.value,
        servicios: servicios.value,
        optionsTratamientos: optionsTratamientos,
        showTratamientos: showTratamientos,
        variasCitas: variasCitas,
        rangoFecha: rangoFecha,
        nuevoProcedimiento: nuevoProcedimiento,
    }) : null;

    const propiedadesActualizarCita = puedePut ? useFormularioCitaBuilder({
        storeId: 'ActualizarCita',
        storePinia: 'Citas',
        cerrarModal: cerrar,
        show: varView.showActualizarCita,
        verUser: true,
        pacientesList: pacientesList.value,
        medicosList: medicosList.value,
        servicios: servicios.value,
        optionsTratamientos: optionsTratamientos,
        showTratamientos: showTratamientos,
        variasCitas: variasCitas,
        rangoFecha: rangoFecha,
        nuevoProcedimiento: nuevoProcedimiento,
    }) : null;

    const pagina = new ComponenteBuilder()
    pagina
        .setFondo('FondoForm')
        if(propiedadesCita)pagina.addComponente('Form', propiedadesCita)
        if(propiedadesActualizarCita)pagina.addComponente('Form', propiedadesActualizarCita)
    return pagina.build()
})

</script>

<template>
    <Pagina :Propiedades="propiedades" />
</template>