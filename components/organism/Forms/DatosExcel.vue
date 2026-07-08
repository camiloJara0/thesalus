<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import SelectMultiple from '~/components/atoms/Selects/SelectMultiple.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import { watch, reactive } from 'vue'
import { Tablas } from '~/data/Tablas';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
const storeExcel = useExcelExport();

const {
    mensaje,
    options
} = notificacionesStore;

const props = defineProps({
    datos: {
        type: [Object],
    },
    tabla: String,
});

const datosAExportar = ref(props.datos)
const showInsertar = ref(false)
const insertarTabla = ref(false)
const datos = ref(Object.keys(datosAExportar.value[0]))
const datosOptions = ref([])
const datosOptionsTabla = ref([])

const excel = reactive({
    nombreArchivo: '',
    tipoArchivo: '',
    worksheet: '',
    opciones: []
});
const tablaInsert = reactive({
    tabla: '',
    id_comparar: '',
    id_compararTabla: '',
})

const camposRequeridos = [
    'nombreArchivo', 'tipoArchivo', 'worksheet'
];

const camposRequeridosInsert = [
    'tabla', 'id_comparar', 'id_compararTabla'
];

watch(excel, (newValue) => {
    excel.value = newValue

    // Validacion
    const camposValidos = camposRequeridos.every((campo) => excel.value[campo] !== '') && excel.opciones?.length > 0;
    varView.formComplete = camposValidos;
});

const jsonfields = computed(() => {
    return excel.opciones.reduce((obj, dato) => {
        obj[dato] = dato
        return obj
    }, {})
})

watch(tablaInsert, async (newValue) => {
    tablaInsert.value = newValue

    if (newValue.tabla !== '') {
        datosOptionsTabla.value = await storeExcel.obtenerCamposTabla(newValue.tabla)
    }
    // Validacion
    const camposValidos = camposRequeridosInsert.every((campo) => tablaInsert.value[campo] !== '');
    showInsertar.value = camposValidos;
});

function agregarDB() {
    insertarTabla.value = !insertarTabla.value
    datosOptions.value = datos.value.map((dato) => {
        return { text: dato, value: dato }
    })
}

async function InsertarTabla(tabla, id_comparar, id_compararTabla) {
    const datosCombinados = await storeExcel.obtenerTabla(props.datos, tabla, id_comparar, id_compararTabla);
    datosAExportar.value = datosCombinados
    datos.value = Object.keys(datosAExportar.value[0])
};

function cerrar() {
    varView.showDatosExcel = false
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

function mostrar() {
}
</script>

<template>
    <FondoBlur>
            <div
                class="bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 md:w-[55%] md:h-[65%] w-[90%] h-[80%] transform transition-all duration-300 animate-fadeIn">
                <div class="py-6 h-full flex flex-col justify-between">
                    <h2 class="text-2xl font-bold text-center py-3 text-gray-800 dark:text-gray-100 tracking-wide">
                        Configuración de Exportación
                    </h2>
                    <div class="h-full pt-5 overflow-y-auto scrollForm px-10">
                        <div class="flex justify-between items-center">
                            <p class="text-lg text-gray-600"><i class="fa-solid fa-gear"></i> {{ props.tabla }}</p>

                            <div class="text-lg text-blue-500 cursor-pointer flex gap-1" @click="agregarDB">
                                <ButtonRounded color="bg-inherit w-[30px]! h-[30px]! mr-3" tooltip="Descargar"
                                    tooltipPosition="left">
                                    <i v-if="showInsertar" class="fa-solid fa-download text-green-700"
                                        @click="InsertarTabla(tablaInsert.tabla, tablaInsert.id_comparar, tablaInsert.id_compararTabla)"></i>
                                </ButtonRounded>
                                <ButtonRounded color="bg-inherit w-[30px]! h-[30px]! gap-1" tooltip="Agregar Datos"
                                    tooltipPosition="left">
                                    <i class="fa-solid fa-plus text-blue-600"></i>
                                    <i class="fa-solid fa-database text-blue-600"></i>
                                </ButtonRounded>
                            </div>
                        </div>
                        <div v-if="insertarTabla" class="grid md:grid-cols-3 grid-cols-1 gap-3 pt-3">
                            <Select v-model="tablaInsert.tabla" :Propiedades="{
                                placeholder: 'Tabla de datos',
                                id: 'datos',
                                name: 'datos',
                                options: Tablas,
                                tamaño: 'w-full'
                            }" />
                            <Select v-model="tablaInsert.id_comparar" :Propiedades="{
                                placeholder: 'Campo a comparar',
                                id: 'campoComparar',
                                name: 'campoComparar',
                                options: datosOptions,
                            }">
                            </Select>
                            <Select v-model="tablaInsert.id_compararTabla" :Propiedades="{
                                placeholder: 'Campo de Tabla a insertar',
                                id: 'campoCompararTabla',
                                name: 'campoCompararTabla',
                                options: datosOptionsTabla,
                            }" />
                            <div class="bg-gray-300 dark:bg-gray-700 h-0.5 w-full col-span-3"></div>
                        </div>
                        <div class="grid md:grid-cols-3 grid-cols-1 gap-3 pt-3">
                            <Input v-model="excel.nombreArchivo" :Propiedades="{
                                placeholder: 'Nombre Archivo',
                                id: 'nombre',
                                name: 'nombre',
                                type: 'text',
                            }" />
                            <Select v-model="excel.tipoArchivo" :Propiedades="{
                                placeholder: 'Formato Hoja de calculo',
                                id: 'tipoArchivo',
                                name: 'tipoArchivo',
                                options: [{ text: 'xlsx', value: 'xlsx' }, { text: 'xls', value: 'xls' }, { text: 'csv', value: 'csv' }],
                            }">
                            </Select>
                            <Input v-model="excel.worksheet" :Propiedades="{
                                placeholder: 'Worksheet',
                                id: 'worksheet',
                                name: 'worksheet',
                                type: 'text',
                            }" />
                        </div>
                        <div class="flex md:flex-row pt-5 relative">
                            <SelectMultiple v-model="excel.opciones" :Propiedades="{
                                placeholder: 'Seleccione los campos que deseas',
                                id: 'campos',
                                name: 'campos',
                                options: datos,
                                opciones: [{ text: '', value: '' }],
                                tamaño: 'w-full'
                            }" />
                        </div>
                    </div>

                    <div class="w-full flex justify-center items-center gap-4 px-4 mt-6">
                        <ButtonForm
                            color="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="cerrar">
                            Cancelar
                        </ButtonForm>

                        <ButtonForm
                            color="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="validarform">
                            <download-excel v-if="varView.formComplete" :data="datosAExportar"
                                :name="excel.nombreArchivo" :type="excel.tipoArchivo" :fields="jsonfields"
                                :worksheet="excel.worksheet" :before-finish="cerrar" :before-generate="mostrar">
                                Generar
                            </download-excel>
                            <div v-if="!varView.formComplete">
                                Generar
                            </div>
                        </ButtonForm>
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