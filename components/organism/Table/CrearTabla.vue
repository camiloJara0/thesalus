<script setup>
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import Label from '~/components/atoms/Labels/Label.vue';
import SelectMultiple from '~/components/atoms/Selects/SelectMultiple.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue'
import Checkbox from '~/components/atoms/Checkbox/Checkbox.vue';
import { watch, reactive } from 'vue'
import { Tablas } from '~/data/Tablas';
import { TablaBuilder, TablaDirector } from '~/build/Constructores/TablaBuilder';

const varView = useVarView()
const notificacionesStore = useNotificacionesStore();
const storeExcel = useExcelExport();
const emit = defineEmits(['tabla-creada']);

const {
    mensaje,
    options
} = notificacionesStore;


const showInsertar = ref(false)
const insertarTabla = ref(false)
const datos = ref()
const datosOptions = ref([])
const datosOptionsTabla = ref([])
const columnas = ref([])
const datosTabla = ref([])

const tabla = reactive({
    tabla: '',
    titulo: '',
    descripcion: '',
    color: '',
    buscador: false,
    excel: false,
    accionAgregar: '', // puede ser una función o nombre de acción
    acciones: {
        icons: [{
            icon: '',
            action: ''
        }],
        botones: false
    },
    datos: '',
    columnas: []

});

const tablaInsert = reactive({
    tabla: '',
    id_comparar: '',
    id_compararTabla: '',
})

const camposRequeridos = [
    'datos', 'tabla', 'titulo', 'descripcion', 'color'
];

const camposRequeridosInsert = [
    'tabla', 'id_comparar', 'id_compararTabla'
];

watch(tabla, async (newValue) => {
    tabla.value = newValue

    if (newValue.tabla !== '') {
        datosOptions.value = await storeExcel.obtenerCamposTabla(newValue.tabla)
        datosTabla.value = await storeExcel.obtenerDatos(newValue.tabla)
    }

    datos.value = datosOptions.value.map(dato => dato.value)
    // Validacion
    const camposValidos = camposRequeridos.every((campo) => tabla.value[campo] !== '') && tabla.columnas?.length > 0;
    varView.formComplete = camposValidos;
});

// traer campos de tabla a insertar
watch(tablaInsert, async (newValue) => {
    tablaInsert.value = newValue

    if (newValue.tabla !== '') {
        datosOptionsTabla.value = await storeExcel.obtenerCamposTabla(newValue.tabla)
    }
    // Validacion
    const camposValidos = camposRequeridosInsert.every((campo) => tablaInsert.value[campo] !== '');
    showInsertar.value = camposValidos;
});

watch(
    () => columnas.value,
    (newVal) => {
        // Si los elementos son strings, transformarlos en objetos
        if (newVal.length && typeof newVal[0] === 'string') {
            tabla.columnas = newVal.map(val => ({
                titulo: val,
                value: val,
                tamaño: '',
                ordenar: false
            }));
        }
    }
);


function agregarDB() {
    insertarTabla.value = !insertarTabla.value
    datosOptions.value = datos.value.map((dato) => {
        return { text: dato, value: dato }
    })
    console.log(datosOptions.value)
}

async function InsertarTabla(tabla, id_comparar, id_compararTabla) {
    const datosCombinados = await storeExcel.obtenerTabla(datosTabla.value, tabla, id_comparar, id_compararTabla);
    datosTabla.value = datosCombinados
    datos.value = Object.keys(datosTabla.value[0])
};

function cerrar() {
    varView.showCrearTabla = false
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = 'top-end';
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500
        mensaje()
    }
};

function construirTabla() {
    const builder = new TablaBuilder();
    const director = new TablaDirector(builder);

    const tablaFinal = director.construirDesdeFormulario({
        columnas: tabla.columnas.map(col => ({
            titulo: col.titulo,
            value: col.value,
            tamaño: parseInt(col.tamaño) || 100,
            ordenar: !!col.ordenar
        })),
        titulo: tabla.titulo,
        descripcion: tabla.descripcion,
        color: tabla.color,
        accionAgregar: () => console.log(tabla.accionAgregar),
        acciones: tabla.acciones,
        datos: datosTabla
    });

    console.log('Tabla construida:', tablaFinal);
    console.log('Tabla datos:', datosTabla.value);
    emit('tabla-creada', tablaFinal);
}

const colores = ref([
    { text: 'Default', value: 'bg-[var(--color-default)] text-white' },
    { text: 'Default Obscuro', value: 'bg-[var(--color-default-600)] text-white' },
    { text: 'Azul', value: 'bg-blue-500 text-white' },
    { text: 'Verde', value: 'bg-green-500 text-white' }
]);

</script>

<template>
    <FondoBlur>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7 md:w-[65%] md:h-[70%] w-[90%] h-[80%]">
        <div class="py-5 h-full flex flex-col justify-between">
            <h2 class="text-2xl font-semibold text-center text-black dark:text-white py-2">Configuracion Tabla</h2>
            <div class="h-full pt-5 overflow-y-auto scrollForm px-10">

                <div class="flex justify-between items-center">
                    <p class="text-lg text-gray-600 dark:text-gray-200">Tablas <i class="fa-solid fa-gear"></i></p>
                    <p class="text-lg text-blue-500 cursor-pointer" @click="agregarDB">
                        <i v-if="showInsertar" class="fa-solid fa-download mr-3 text-green-700"
                            @click="InsertarTabla(tablaInsert.tabla, tablaInsert.id_comparar, tablaInsert.id_compararTabla)"></i>
                        <i class="fa-solid fa-plus"></i> <i class="fa-solid fa-database"></i>
                    </p>
                </div>

                <!-- Insertar tabla -->
                <div v-if="insertarTabla" class="flex md:flex-row flex-col gap-3 pt-3">
                    <Select v-model="tablaInsert.tabla" :Propiedades="{
                        placeholder: 'Tabla de datos',
                        options: Tablas,
                        modelValue: tablaInsert.tabla,
                        name: 'tabla',
                        tamaño: 'w-full'
                    }" />
                    <Select v-model="tablaInsert.id_comparar" :Propiedades="{
                        placeholder: 'Campo a comparar',
                        options: datosOptions,
                        modelValue: tablaInsert.id_comparar,
                        name: 'campoComparar',
                        tamaño: 'w-full'
                    }">
                    </Select>
                    <Select v-model="tablaInsert.id_compararTabla" :Propiedades="{
                        placeholder: 'Campo de Tabla a insertar',
                        options: datosOptionsTabla,
                        modelValue: tablaInsert.id_compararTabla,
                        name: 'campoCompararTabla',
                        tamaño: 'w-full'
                    }" />
                </div>

                <div>
                    <!-- Selección de tabla y campos -->
                    <div class="flex md:flex-row flex-col gap-3 pt-3">
                        <Select v-model="tabla.tabla" :Propiedades="{
                            placeholder: 'Tabla de datos',
                            options: Tablas,
                            modelValue: tabla.tabla,
                            name: 'tabla',
                            tamaño: 'w-full'
                        }" />
                        <SelectMultiple v-model="columnas" :Propiedades="{
                            placeholder: 'Seleccione los campos',
                            options: datos,
                            modelValue: columnas,
                            name: 'columnas',
                            tamaño: 'w-full'
                        }" />

                    </div>

                    <!-- Configuración de columnas -->
                    <div class="grid grid-cols-3 gap-5 p-3 my-5 max-h-50 overflow-y-auto">
                        <div v-for="(col, index) in tabla.columnas" :key="index"
                            class="flex flex-col gap-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-xl p-2">
                            <Label class="text-gray-600" :Propiedades="{
                                forLabel: 'tituloVisible',
                                tamaño: 'text-sm text-gray-600'
                            }">{{ col.titulo }}</Label>
                            <Input v-model="col.value" :Propiedades="{
                                placeholder: 'Titulo Visible',
                                modelValue: col.value,
                                mayuscula: false,
                                name: 'tituloVisible',
                            }" />
                            <Input v-model="col.tamaño" :Propiedades="{
                                placeholder: 'Tamaño en px (opcional)',
                                type: 'number',
                                max: 500,
                                modelValue: col.value,
                                mayuscula: false,
                                name: 'tamaño',
                            }" />
                            <Checkbox v-model="col.ordenar" :Propiedades="{
                                placeholder: 'Boton de Ordenar',
                                name: index,
                                modelValue: col.ordenar
                            }" />
                        </div>
                        <div v-if="tabla.columnas.length < 1"
                            class="col-span-3 text-center text-gray-500 font-semibold">
                            <p>No hay columnas Seleccionadas.</p>
                        </div>
                    </div>

                    <!-- Header de la tabla -->
                    <div class="flex items-center gap-3">
                        <i class="fa-solid fa-folder text-blue-500"></i>
                        <Label :Propiedades="{
                            forLabel: 'header',
                            tamaño: 'text-sm text-gray-600'
                        }">Header (opcional)</Label>
                    </div>

                    <div class="flex md:flex-row flex-col gap-3 pt-3">
                        <Input v-model="tabla.titulo" :Propiedades="{
                            placeholder: 'Titulo Header',
                            modelValue: tabla.titulo,
                            mayuscula: false,
                            name: 'titulo',
                            tamaño: 'w-full'
                        }" />
                        <Input v-model="tabla.descripcion" :Propiedades="{
                            placeholder: 'Descripción',
                            modelValue: tabla.descripcion,
                            mayuscula: false,
                            name: 'descripcion',
                            tamaño: 'w-full'
                        }" />
                        <Select v-model="tabla.color" :Propiedades="{
                            placeholder: 'Color',
                            options: colores,
                            modelValue: tabla.color,
                            name: 'color',
                            tamaño: 'w-full'
                        }" />
                    </div>

                    <div class="flex md:flex-row flex-col gap-3 pt-3">
                        <Checkbox v-model="tabla.buscador" :Propiedades="{
                            placeholder: 'Mostrar botones',
                            name: 'botones',
                            modelValue: tabla.buscador,
                            tamaño: 'w-full'
                        }" />
                        <Checkbox v-model="tabla.excel" :Propiedades="{
                            placeholder: 'Mostrar botones',
                            name: 'botones',
                            modelValue: tabla.excel,
                            tamaño: 'w-full'
                        }" />
                    </div>

                    <!-- Acciones -->
                    <div class="flex items-center gap-3 pt-5">
                        <i class="fa-solid fa-folder text-blue-500"></i>
                        <Label :Propiedades="{
                            forLabel: 'botones',
                            tamaño: 'text-sm text-gray-600'
                        }">Acciones (opcional)</Label>
                    </div>
                    <div class="flex flex-col gap-3 pt-5">
                        <Checkbox v-model="tabla.acciones.botones" :Propiedades="{
                            placeholder: 'Mostrar botones',
                            name: 'botones',
                            modelValue: tabla.acciones.botones,
                            tamaño: 'w-full'
                        }" />
                        <div class="flex gap-2" v-if="tabla.acciones.botones">
                            <Input v-model="tabla.acciones.icons.at(-1).icon" :Propiedades="{
                                placeholder: 'Icono (ej. ver)',
                                modelValue: tabla.acciones.icons.at(-1).icon,
                                mayuscula: false,
                                name: 'iconoNombre',
                                tamaño: 'w-full'
                            }" />
                            <Input v-model="tabla.acciones.icons.at(-1).action" :Propiedades="{
                                placeholder: 'Acción (ej. verPaciente)',
                                modelValue: tabla.acciones.icons.at(-1).action,
                                mayuscula: false,
                                name: 'iconoFuncion',
                                tamaño: 'w-full'
                            }" />
                        </div>
                    </div>

                </div>


            </div>
            <div class="flex ">
                <div class="w-full flex justify-center items-center gap-3">
                    <ButtonForm color="bg-gray-500 " @click="cerrar">
                        Cancelar
                    </ButtonForm>

                    <ButtonForm color="bg-blue-500" @click="!varView.formComplete ? construirTabla() : validarform()">
                        Generar
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