<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';

import { ref } from 'vue'
import { decryptData } from '~/composables/Formulario/crypto';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
const store = useIndexedDBStore();
const api = useApiRest();
const config = useRuntimeConfig();

const props = defineProps({
    cerrar: {
        type: Function
    }
});

const generandoPDFs = ref(false);
const progreso = ref(0);

const file = ref('')

function handleFile (e) {
    file.value = e.target.files[0]
}

const enviarArchivo = async () => {
    try {

        generandoPDFs.value = true;
        progreso.value = 0;

        // Cargar datos necesarios

        try {
            const token = decryptData(localStorage.getItem('token'))
            const formData = new FormData()
            formData.append("file", file.value);
            let options = {
                metodo: 'POST',
                url: config.public.importarInsumos,
                token: token,
                formData: true,
                body: formData,
            }
                const res = await api.functionCall(options)
                if (!res.success) {
                    throw new Error(`Error en la petición: ${res.status}`);
                }

                progreso.value = 100
                notificacionesStore.options.background = '#22c55e'
                notificacionesStore.options.position = 'top-end';
                notificacionesStore.options.texto = "Archivo importado correctamente.";
                notificacionesStore.options.tiempo = 2000;
                notificacionesStore.mensaje();
                props.cerrar()
            } catch (err) {
                console.error("Error al obtener el PDF:", err);
            }

    } catch (error) {
        console.error('Error al importar:', error);
        notificacionesStore.options.background = '#d33'
        notificacionesStore.options.position = 'top-end';
        notificacionesStore.options.texto = "Error al importar Archivo.";
        notificacionesStore.options.tiempo = 2000;
        notificacionesStore.mensaje();
    } finally {
        generandoPDFs.value = false;
        progreso.value = 0;
    }
}
</script>

<template>
    <FondoBlur>
        <div class="bg-[rgba(0,0,0,0.5)] w-full h-full flex justify-center items-center">
            <div
                class="bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 md:w-[55%] md:h-[65%] w-[90%] h-[80%] transform transition-all duration-300 animate-fadeIn">
                <div class="py-6 h-full flex flex-col justify-between">
                    <!-- Título -->
                    <h2 class="text-2xl font-bold text-center py-3 text-gray-800 dark:text-gray-100 tracking-wide">
                        Configuración de Importacion
                    </h2>

                    <!-- Contenido scrollable -->
                    <div class="h-full pt-10 overflow-y-auto scrollForm px-10 space-y-6">
                        <!-- Sección rango de fechas -->
                        <div class="flex items-center gap-2 mb-5">
                            <i class="fa-solid fa-file text-blue-500"></i>
                            <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Elige el archivo en formato .CSV</p>
                        </div>

                        <a href="/Plantilla_Insumos.xlsm" download="Formato_Insumos" class="hover:text-blue-500">
                            <p>Descargar Formato <i class="fa-solid fa-download"></i></p>
                        </a>

                        <!-- Inputs fechas -->
                        <div class="pt-10">
                            <Input @change="handleFile" :Propiedades="{
                                id: 'archivo',
                                name: 'archivo',
                                label: 'Archivo a importar:',
                                type: 'file',
                            }" />
                        </div>

                        <!-- Progreso -->
                        <div v-if="generandoPDFs" class="mt-6 space-y-3">
                            <div class="flex justify-between items-center">
                                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">Guardando Insumos...</p>
                                <span class="text-sm font-bold text-blue-600">{{ progreso }}%</span>
                            </div>
                            <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div class="bg-linear-to-r from-blue-400 to-blue-600 h-full transition-all duration-500 ease-out"
                                    :style="{ width: progreso + '%' }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="w-full flex justify-center items-center gap-4 px-4 mt-6">
                        <ButtonForm
                            color="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="varView.importarArchivo = false">
                            Cancelar
                        </ButtonForm>

                        <ButtonForm
                            color="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="enviarArchivo">
                            Enviar
                        </ButtonForm>
                    </div>
                </div>
            </div>

        </div>
    </FondoBlur>
</template>

<style scoped>
.autocomplete-list li {
    padding: 10px 15px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid #eee;
}

.autocomplete-list li:last-child {
    border-bottom: none;
}

.autocomplete-list li:hover {
    background-color: #e5f0ff;
}
</style>