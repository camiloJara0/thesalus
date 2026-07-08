<script setup>
import { ref } from 'vue'
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue'
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import Checkbox from '~/components/atoms/Checkbox/Checkbox.vue';
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue';

const emit = defineEmits(['form-creado', 'ocultar']);
// Opciones disponibles
const tiposComponentes = [
    { text: 'Campo de texto', value: 'Input' },
    { text: 'Contraseña', value: 'Password' },
    { text: 'Área de texto', value: 'TextArea' },
    { text: 'Selector', value: 'Select' },
    { text: 'Checkbox', value: 'Checkbox' },
    { text: 'Radio', value: 'Radio' },
]

const tamaños = [
    { text: 'SM', value: 'SM' },
    { text: 'LG', value: 'LG' },
    { text: 'XL', value: 'XL' },
]

const stores = [
    { text: 'Notas', value: 'Notas' },
    { text: 'Pacientes', value: 'Pacientes' },
    { text: 'Profesionales', value: 'Profesionales' },
]

// Datos del formulario meta
const metaForm = ref({
    tituloFormulario: '',
    tamaño: 'LG',
    fondo: false,
    secciones: [],
    store: '',
})

// Datos para crear sección/campo temporal
const nuevaSeccion = ref({ nombre: '', descripcion: '' })
const nuevoCampo = ref({
    component: 'Input',
    key: '',
    label: '',
    placeholder: '',
    vmodel: '',
    required: false,
    options: [],
})

// Agregar sección
const agregarSeccion = () => {
    if (!nuevaSeccion.value.nombre) return
    metaForm.value.secciones.push({
        nombre: nuevaSeccion.value.nombre,
        descripcion: nuevaSeccion.value.descripcion,
        campos: []
    })
    nuevaSeccion.value = { nombre: '', descripcion: '' }
}

// Agregar campo a la última sección
const agregarCampo = () => {
    if (metaForm.value.secciones.length === 0) return alert('Primero crea una sección')
    const ultima = metaForm.value.secciones.at(-1)
    ultima.campos.push({ ...nuevoCampo.value })
    nuevoCampo.value = { component: 'Input', key: '', label: '', placeholder: '', vmodel: '', required: false, options: [] }
}


// Generar JSON con FormularioBuilder
const generarFormulario = () => {
    let builder = new FormularioBuilder()
        .setFormularioTitulo(metaForm.value.tituloFormulario)
        .setFormulariotamaño(metaForm.value.tamaño)
        .setFormularioFondo(metaForm.value.fondo)
        .setStorePinia(metaForm.value.store)

    metaForm.value.secciones.forEach(seccion => {
        builder.nuevaSeccion(seccion.nombre, seccion.descripcion)
        seccion.campos.forEach(campo => builder.addCampo(campo))
    })

    console.log('Formulario generado:', builder.build())
    const form = builder.build()
    emit('form-creado', form);
}

function cerrar() {
    emit('ocultar')
};
</script>

<template>
    <FondoBlur>
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg pb-7 md:w-[65%] md:h-[70%] w-[90%] h-[80%]">
            <div class="p-6 overflow-y-auto scrollForm h-[90%]">
                <div class="flex flex-col gap-5">
                    <h2 class="text-xl text-center font-bold text-black dark:text-white">Creador de Formularios</h2>

                    <!-- Configuración básica -->
                    <div class="gap-2 py-2 grid md:grid-cols-3 grid-cols-1">
                        <Input v-model="metaForm.tituloFormulario" :Propiedades="{
                            placeholder: 'Ej: Registro de usuario',
                            label: 'titulo del Formulario'
                        }" />

                        <div>
                            <label class="block font-semibold text-xs text-black dark:text-white">Tamaño</label>
                            <Select v-model="metaForm.tamaño" :Propiedades="{
                                placeholder: 'Ej: Registro de usuario',
                                label: 'Tamaño',
                                options: tamaños,
                                tamaño: 'w-full'
                            }">
                            </Select>
                        </div>
                        <div>
                            <label class="block font-semibold text-xs text-black dark:text-white">Store</label>
                            <Select v-model="metaForm.store" :Propiedades="{
                                placeholder: 'Ej: Registro de usuario',
                                label: 'titulo del Formulario',
                                options: stores,
                                tamaño: 'w-full'
                            }">
                            </Select>
                        </div>

                        <Checkbox v-model="metaForm.fondo" :Propiedades="{
                            placeholder: 'Fondo Activado',
                        }" />
                    </div>

                    <!-- Sección -->
                    <div class="gap-2 grid md:grid-cols-3 grid-cols-1 items-center py-2">
                        <Input v-model="nuevaSeccion.nombre" :Propiedades="{
                            placeholder: 'Titulo',
                            label: 'Nueva Seccion'
                        }" />
                        <Input v-model="nuevaSeccion.descripcion" :Propiedades="{
                            placeholder: 'Descripcion',
                            label: 'Subtitulo'
                        }" />
                        <button @click="agregarSeccion" class="bg-blue-600 text-white h-1/2 rounded">Agregar
                            Sección</button>
                    </div>

                    <!-- Campos -->
                    <div class="space-y-2 py-2">
                        <h3 class="font-bold text-black dark:text-white">Nuevo Campo</h3>
                        <label class="block text-black dark:text-white">Tipo de componente</label>
                        <Select v-model="nuevoCampo.component" :Propiedades="{
                            placeholder: 'Ej: Registro de usuario',
                            label: 'Tipo de componente',
                            options: tiposComponentes,
                            tamaño: 'w-full'
                        }" />

                        <Input v-model="nuevoCampo.key" :Propiedades="{
                            placeholder: 'Key (ej. correo)',
                        }" />
                        <Input v-model="nuevoCampo.label" :Propiedades="{
                            placeholder: 'Label (ej: Correo electrónico)',
                        }" />
                        <Input v-model="nuevoCampo.placeholder" :Propiedades="{
                            placeholder: 'Placeholder',
                        }" />
                        <Input v-model="nuevoCampo.vmodel" :Propiedades="{
                            placeholder: 'Vmodel',
                        }" />

                        <Checkbox v-model="nuevoCampo.required" :Propiedades="{
                            placeholder: 'Requerido',
                        }" />

                        <!-- Opciones (para Select/Radio/Checkbox) -->
                        <div v-if="['Select', 'Radio', 'Checkbox'].includes(nuevoCampo.component)" class="space-y-2">
                            <label class="block">Opciones (separadas por coma)</label>
                            <Input @blur="nuevoCampo.options = $event.target.value.split(',').map(o => o.trim())"
                                class="border rounded p-2 w-full" placeholder="Ej: Hombre,Mujer,Otro" />
                        </div>

                        <button @click="agregarCampo" class="bg-blue-600 text-white px-4 py-2 rounded">Agregar
                            Campo</button>
                    </div>

                </div>
            </div>
            <div class="flex ">
                <div class="w-full flex justify-center items-center gap-3">
                    <ButtonForm color="bg-gray-500 " @click="cerrar">
                        Cancelar
                    </ButtonForm>

                    <ButtonForm color="bg-blue-500" @click="generarFormulario">
                        Generar
                    </ButtonForm>
                </div>
            </div>
        </div>
    </FondoBlur>
</template>
