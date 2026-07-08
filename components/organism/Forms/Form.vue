<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import FondoTransparent from '~/components/atoms/Fondos/FondoTransparent.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import Wizard from './Wizard.vue';

import { useFormulario, mapCamposLimpios } from './useFormulario';
import { cargarStore } from './componentLoader';

const props = defineProps({
    Propiedades: {
        default: {}
    }
});

const tablaStore = await cargarStore(props.Propiedades?.content?.storePinia) || {}

const {
    traerDatos,
    guardarDatos,
    getValue,
    setValue,
    manejarClick,
    seccionActual,
    camposActuales,
    componentInstances,
} = useFormulario(props)

const fondos = {
    true: FondoBlur,
    false: 'div',
    FondoTransparent,
};

// watch(tablaStore.Formulario, (newValue) => {
//    console.log(newValue)
// }, {deep: true})

// Traer datos del localStorage
onMounted(() => {
    const datosGuardados = traerDatos();
    if (datosGuardados) Object.assign(tablaStore?.Formulario, datosGuardados)
});

function limpiar() {
    mapCamposLimpios(tablaStore?.Formulario)
    localStorage.removeItem(props.Propiedades.content.storeId)

    const show = props.Propiedades.formulario.show

    if (unref(show)) {
        // Si es ref
        if (show && typeof show === 'object' && 'value' in show) {
            show.value = false
        } else {
            props.Propiedades.formulario.show = false
        }
    }

    const cerrar = props.Propiedades.formulario.botones.filter(boton => {
        return boton.type === 'cerrar'
    })?.[0]
    cerrar?.accion()

}

</script>
<template>
    <component :is="fondos[Propiedades.formulario.fondo]"
        v-if="!Propiedades.formulario.fondo || unref(Propiedades.formulario.show)" @mousedown="limpiar">
        <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col h-full animate-fadeIn"
            :class="[Propiedades.formulario.tamañoForm, Propiedades.formulario.estilos]" @mousedown.stop>

            <div class="flex flex-col flex-1 min-h-0" :class="{'h-[90%]': props.Propiedades.formulario.botones.length > 0, 'h-full': !props.Propiedades.formulario.botones}">
                <!-- Formulario Wizard -->
                <Wizard
                    v-if="Propiedades.formulario && Propiedades.formulario.tipo !== undefined && Propiedades.formulario.tipo === 'Wizard'"
                    :Propiedades="Propiedades.formulario" :SeccionActual="seccionActual"
                    :key="Propiedades.formulario.soloVer" :cerrar="limpiar" />
                <!-- Titulo Sin wizard -->
                <div class="w-full py-1 flex flex-col flex-1 min-h-0">
                    <div v-if="Propiedades.formulario && Propiedades.formulario.tipo !== 'Wizard'"
                        class="relative pt-4 pb-3 px-4">
                        <h2
                            class="lg:text-2xl text-xl text-(--color-default) dark:text-white font-bold text-center">
                            {{ Propiedades.formulario.secciones[seccionActual].nombre }}
                        </h2>
                        <div class="absolute top-1 right-1" v-if="Propiedades.formulario.fondo !== 'FondoTransparent'">
                            <div @click="limpiar"
                                class="w-7 h-7 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                                <i
                                    class="fa-solid fa-close dark:text-gray-300 dark:hover:text-gray-400 text-gray-800 hover:text-gray-900 md:text-base text-base"></i>
                            </div>
                        </div>
                    </div>
                    <!-- Formulario -->
                    <div class="flex-1 scrollForm overflow-y-auto">
                        <div class="w-full flex flex-col items-center py-3 gap-4"
                            :class="{ 'h-[92%]!': Propiedades.formulario.tipo === 'Wizard' }">
                            <!-- Contenido del formulario -->
                            <div class="w-full md:px-10 px-5 grid md:grid-cols-2 grid-cols-1 gap-4"
                                :class="Propiedades.formulario.contenedorCampos">
                                <component v-for="(item, index) in camposActuales" :key="index"
                                    :is="componentInstances[item.component]"
                                    :Propiedades="{ ...item, disabled: Propiedades.formulario.soloVer || item.disabled }"
                                    :modelValue="getValue(tablaStore?.Formulario, item.vmodel)"
                                    @update:modelValue="val => setValue(tablaStore?.Formulario, item.vmodel, val)" />
                                <slot></slot>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Botones -->
            <div v-if="props.Propiedades.formulario.botones.length > 0" class="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-row-reverse justify-center gap-3">
                <ButtonForm v-for="item in props.Propiedades.formulario.botones" :color="item.color"
                    @click="(event) => manejarClick(event, item, tablaStore?.Formulario, limpiar)"
                    class="md:w-45 w-1/3">
                    {{ props.Propiedades.formulario.botones ? item.text : 'Cancelar' }}
                </ButtonForm>
            </div>
        </div>

    </component>
</template>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>