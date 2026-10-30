<script setup>
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import Form from './organism/Forms/Form.vue';
import Pagina from './organism/Pagina/Pagina.vue';
import PanelContextoPaciente from './molecules/ContextoClinico/PanelContextoPaciente.vue';

const varView = useVarView();
const storeCodigos = useCodigos()

const CIE10 = ref([])
const medicamentos = ref([])

onMounted(async () => {
    CIE10.value = await storeCodigos.leerdatos();
})

function cerrar() {
    varView.showNuevaHistoria = false
}

const {builder, id_paciente} = useHistoriaBuilder({
        storeId: 'RegistrarHistoria',
        storePinia: 'Historias',
        cerrarModal: cerrar,
        show: varView.showNuevaHistoria,
        medicamentos,
        CIE10
});

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()

    pagina
        .setFondo('FondoDefault')
        .addComponente('Form', builder)
    return pagina.build()
})
</script>

<template>
    <div class="relative">
        <Pagina :Propiedades="propiedades"></Pagina>
        <!-- Contexto clinico secundario del paciente (solo pantallas grandes, formulario abierto) -->
        <div v-if="varView.showNuevaHistoria" class="hidden xl:flex flex-col items-end gap-2 fixed right-5 top-35 z-40 w-72">
            <PanelContextoPaciente />
        </div>
    </div>
</template>