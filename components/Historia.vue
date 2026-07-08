<script setup>
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import Form from './organism/Forms/Form.vue';
import Pagina from './organism/Pagina/Pagina.vue';

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
    <Pagina :Propiedades="propiedades"></Pagina>
</template>