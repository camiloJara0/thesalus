<script setup>
import CrearTabla from '~/components/organism/Table/CrearTabla.vue';
import CrearFormulario from '~/components/organism/Forms/CrearFormulario.vue';
import Tabla from '~/components/organism/Table/Tabla.vue';
import Form from '~/components/organism/Forms/Form.vue';
const varView = useVarView();
const tablaConfigurada = ref(null);

const showcrearFormulario = ref(false)
const formularioConfigurado = ref(null);

function crearTabla() {
    varView.showCrearTabla = true
};

function recibirTabla(tabla) {
    tablaConfigurada.value = tabla;
    varView.showCrearTabla = false; // Oculta el formulario
}

function crearFormulario() {
    showcrearFormulario.value = true
};

function recibirFormulario(tabla) {
    formularioConfigurado.value = tabla;
    showcrearFormulario.value = false; // Oculta el formulario
}

</script>

<template>
    <!-- <div class="bg-gray-100 dark:bg-gray-900 flex flex-col items-center h-[100%] py-10">
        <h2 class="text-2xl font-bold text-gray-700">Seccion Reportes en desarrollo...</h2>
        <div class="w-full flex gap-3 justify-end px-10">
            <button @click="crearTabla" class="p-3 bg-blue-500 rounded-2xl text-white hover:bg-blue-600">
                Crear Tabla
            </button>
            <button @click="crearFormulario" class="p-3 bg-blue-700 rounded-2xl text-white hover:bg-blue-600">
                Crear Formulario
            </button>
        </div>
        <div class="w-full px-10 my-5">
            <Tabla v-if="tablaConfigurada" :Propiedades="tablaConfigurada" />
        </div>
        <div class="w-full my-5">
            <Form v-if="formularioConfigurado" :Propiedades="formularioConfigurado" />
        </div>
    </div>
    <CrearTabla v-if="varView.showCrearTabla" @tabla-creada="recibirTabla" />
    <CrearFormulario v-if="showcrearFormulario" @form-creado="recibirFormulario" @ocultar="showcrearFormulario = false"/> -->
</template>