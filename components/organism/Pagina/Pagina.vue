<script setup>
import Tabla from '~/components/organism/Table/Tabla.vue'
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import Form from '~/components/organism/Forms/Form.vue';
import Calendario from '~/components/molecules/Calendario/Calendario.vue';
import Citas from '~/components/molecules/Calendario/Citas.vue';
import Card from '~/components/molecules/Cards/Card.vue';
import Modal from '~/components/organism/Modal/Modal.vue';
import PDFTemplate from '../PDFTemplate/PDFTemplate.vue';
import Button from '~/components/atoms/Buttons/Button.vue';

import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import FondoForm from '~/components/atoms/Fondos/FondoForm.vue';

const props = defineProps({
    Propiedades: {
        default: {}
    }
});

const fondos = {
    FondoDefault,
    FondoBlur,
    FondoForm
}

const components = {
    Tabla,
    TablaNuxt,
    Form,
    Calendario,
    Citas,
    Card,
    Modal,
    PDFTemplate,
    Button
}

</script>

<template>
    <component :is="fondos[Propiedades.fondo]" :class="Propiedades.estilos">
        <div v-if="Propiedades.header.titulo !== ''" class="md:pb-6 pb-4 flex md:flex-row flex-col gap-3 items-center justify-between">
            <div>
                <h2 class="md:text-2xl text-xl font-semibold">{{ Propiedades.header.titulo }}</h2>
                <p class="text-gray-600 dark:text-gray-200 mt-1">{{ Propiedades.header.descripcion }}</p>
            </div>

            <div v-if="Propiedades.header.button" class="flex gap-3 items-center cursor-pointer">

                <UButton v-for="button in Propiedades.header.button" :color="button.color" :icon="button.icon" :variant="button.variant"
                    @click="button.action">
                    <p class="hidden md:block">{{ button.text }}</p>
                </UButton>

            </div>
        </div>

        <div :class="Propiedades.contenedor">

            <component v-for="(component, index) in Propiedades.componentes" :key="index"
                :is="components[component.tipo]" :Propiedades="component" />

            <slot></slot>

        </div>

    </component>
</template>