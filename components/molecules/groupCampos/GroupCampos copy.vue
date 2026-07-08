<script setup>
import { ref, watch } from 'vue';

import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import SelectMultiple from '~/components/atoms/Selects/SelectMultiple.vue';
import SelectSearch from '~/components/atoms/Selects/SelectSearch.vue';
import Textarea from '~/components/atoms/Textareas/Textarea.vue';
import Checkbox from '~/components/atoms/Checkbox/Checkbox.vue';
import SelectSearchOld from '~/components/atoms/Selects/SelectSearchOld.vue';

const props = defineProps({
    Propiedades: { type: Object, required: true },
    modelValue: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue']);

const campos = { Input, Select, SelectMultiple, SelectSearch, Textarea, Checkbox, SelectSearchOld };

// Registro actual del formulario
const form = ref({ ...props.Propiedades.addItem });

// Listado
const items = ref([...props.modelValue]);
const showCampos = ref(false);
const draftIndex = ref(null);

// Índice en edición
const editIndex = ref(null);

watch(() => props.modelValue, val => {
    items.value = [...val];
});

// Agregar o actualizar
const saveItem = () => {
    if (!isFormValid()) return;

    draftIndex.value = null;
    editIndex.value = null;

    if (props.Propiedades.liveUpdate) {
        // Confirmar el último item y crear uno nuevo vacío
        const nuevoDraft = { ...props.Propiedades.addItem };
        items.value.push(nuevoDraft);
        draftIndex.value = items.value.length - 1;

        form.value = { ...props.Propiedades.addItem };
    } else {
        // Modo normal
        form.value = { ...props.Propiedades.addItem };
    }

    emit('update:modelValue', [...items.value]);
};
// Validacion al agregar
const isFormValid = () => {
    if (props.Propiedades.liveUpdate) {
        // Validar directamente el último item
        const lastIndex = items.value.length - 1;
        if (lastIndex < 0) return false;
        return props.Propiedades.campos.every(campo => {
            const value = items.value[lastIndex][campo.name];
            return value !== null && value !== undefined && value !== '';
        });
    } else {
        // Validar contra form en modo normal
        return props.Propiedades.campos.every(campo => {
            const value = form.value[campo.name];
            return value !== null && value !== undefined && value !== '';
        });
    }
};

// Editar
const editItem = (index) => {
    form.value = { ...items.value[index] };
    editIndex.value = index;
    draftIndex.value = null; // forzar recreación
    showCampos.value = true;
};

// Eliminar
const removeItem = (index) => {
    console.log(index)
    // Si es el único item, limpiar valores en lugar de eliminar
    if (items.value.length === 1) {
        const emptyItem = { ...props.Propiedades.addItem };
        items.value[index] = emptyItem;
        draftIndex.value = index;
    } else {
        // Si hay más items, eliminar normalmente
        items.value.splice(index, 1);
    }
    emit('update:modelValue', [...items.value]);
};

// Reset
const resetForm = () => {
    if (props.Propiedades.liveUpdate) {
        // Eliminar el draft actual y crear uno nuevo vacío
        if (draftIndex.value !== null) {
            items.value.splice(draftIndex.value, 1);
        }
        const nuevoDraft = { ...props.Propiedades.addItem };
        items.value.push(nuevoDraft);
        draftIndex.value = items.value.length - 1;

        form.value = { ...props.Propiedades.addItem };
        emit('update:modelValue', [...items.value]);
    } else {
        if (draftIndex.value !== null) {
            items.value.splice(draftIndex.value, 1);
            draftIndex.value = null;
            emit('update:modelValue', [...items.value]);
        }
        form.value = { ...props.Propiedades.addItem };
    }
};

const ensureDraftItem = () => {
    if (draftIndex.value !== null) return;

    const draft = { ...props.Propiedades.addItem };
    items.value.push(draft);
    draftIndex.value = items.value.length - 1;

    emit('update:modelValue', [...items.value]);
};

const updateField = (field, value, campoDef) => {
    // Si se edita, mover al final
    if (editIndex.value !== null) {
        const editedItem = items.value[editIndex.value];
        items.value.splice(editIndex.value, 1);

        const newDraft = { ...editedItem };
        items.value.push(newDraft);

        draftIndex.value = items.value.length - 1;
        editIndex.value = null;
    }

    // Asegurar draft
    ensureDraftItem();

    const lastIndex = items.value.length - 1;

    // 👉 Si liveUpdated está activo, siempre escribir en items
    if (props.Propiedades.liveUpdated) {
        if (campoDef.typeCampo === 'SelectSearch') {
            if (value && typeof value === 'object') {
                // Selección de objeto
                Object.keys(value).forEach(key => {
                    items.value[lastIndex][key] = value[key];
                });
            } else {
                // Texto libre escrito en el input
                items.value[lastIndex][field] = value;
            }
        } else {
            items.value[lastIndex][field] = value;
        }
    } else {
        // Modo normal: mantener en form y draft
        if (campoDef.typeCampo === 'SelectSearch' && value && typeof value === 'object') {
            Object.keys(value).forEach(key => {
                items.value[lastIndex][key] = value[key];
                form.value[key] = value[key];
            });
        } else {
            items.value[lastIndex][field] = value;
            form.value[field] = value;
        }
    }

    emit('update:modelValue', [...items.value]);
};

// Computada que filtra solo los completos
const itemsCompletos = computed(() =>
    items.value.filter(item =>
        props.Propiedades.campos.every(campo => item[campo.name] !== '' && item[campo.name] != null)
    )
)


</script>

<template>
    <div class="col-span-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-4 space-y-4">

        <!-- Título -->
        <div class="flex justify-between items-center">
            <label class="flex gap-2 font-medium text-gray-700 dark:text-gray-200 w-fit">

                {{ Propiedades.labelGroup }}

            </label>

            <div class="flex items-center gap-1">
                <ButtonRounded v-if="Propiedades.labelGroup && !Propiedades.disabled" @click="showCampos = !showCampos" color="w-7.5 h-7.5 flex justify-center items-center gap-1 hover:bg-gray-200 
                            hover:dark:bg-gray-700 bg-inherit cursor-pointer rounded-full" tooltip="Desplegar/ocultar">
                    <i class="fa-solid text-blue-700 font-bold"
                        :class="{ 'fa-angle-up': showCampos, 'fa-plus': !showCampos }">
                    </i>
                </ButtonRounded>
            </div>
        </div>

        <!-- FORMULARIO ÚNICO -->
        <div v-if="showCampos" class="grid gap-3 bg-white dark:bg-gray-900 p-4 rounded-lg">

            <div :class="Propiedades.containerCampos">
                <div v-for="campo in Propiedades.campos" :key="campo.name" :class="campo.tamaño">
                    <component :is="campos[campo.typeCampo]" :modelValue="Propiedades.liveUpdate
                        ? items.at(-1)?.[campo.name]
                        : form[campo.name]" :Propiedades="campo"
                        @update:modelValue="value => updateField(campo.name, value, campo)" @keyup.enter="saveItem" />
                </div>
            </div>

            <!-- Acciones -->
            <div class="flex grid-cols-2 justify-end gap-2 pt-2">
                <button type="button" v-if="editIndex !== null" @click="resetForm"
                    class="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-700 rounded-lg">
                    Cancelar
                </button>

                <!-- Botón de cancelar solo aparece si falta algún campo -->
                <!-- <button v-if="!isFormValid() && editIndex === null" type="button"
                    @click="removeItem(items.value.length - 1)"
                    class="ml-2 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 cursor-pointer active:scale-95">
                    <i class="fa-solid fa-xmark"></i> Cancelar
                </button> -->

                <button type="button" @click="saveItem" :class="[
                    'px-4 py-2 text-sm rounded-lg transition-all duration-300 cursor-pointer active:scale-95',
                    isFormValid()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                ]" :disabled="!isFormValid()">
                    <i class="fa-solid fa-plus"></i>
                    {{ editIndex !== null ? 'Actualizar' : 'Guardar' }}
                </button>

            </div>
        </div>

        <!-- TABLA -->
        <div v-if="itemsCompletos.length" class="overflow-x-auto">
            <table class="w-full text-sm rounded-lg overflow-hidden" border="0">
                <thead class="bg-gray-200 dark:bg-gray-600">
                    <tr>
                        <th v-for="campo in Propiedades.campos" :key="campo.name" class="px-3 py-2 text-left">
                            {{ campo.placeholder }}
                        </th>
                        <th v-if="!Propiedades.disabled" class="px-3 py-2 text-center">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in itemsCompletos" :key="index"
                        class="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">

                        <td v-for="campo in Propiedades.campos" :key="campo.name" class="px-3 py-2">
                            {{ item[campo.name] }}
                        </td>

                        <td v-if="!Propiedades.disabled" class="px-3 py-2 text-center flex justify-center gap-2">
                            <ButtonRounded v-if="!Propiedades.ocultarEditar" color="bg-yellow-500"
                                @click="editItem(index)">
                                <i class="fa-solid fa-pen"></i>
                            </ButtonRounded>

                            <ButtonRounded v-if="!Propiedades.ocultarEliminar" color="bg-red-500"
                                @click="removeItem(index)">
                                <i class="fa-solid fa-trash"></i>
                            </ButtonRounded>
                        </td>


                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Vacío -->
        <p v-else @click="showCampos = !showCampos" class="text-center text-gray-400 py-4 cursor-pointer">
            No hay registros agregados.
        </p>

    </div>
</template>


<style scoped>
.incompleto {
    border: 1px solid var(--color-red-500);
}

input:invalid {
    border: 1px solid var(--color-red-500);
}

.inputFondo {
    padding: 5px 10px 5px 35px;
}

.iconInput {
    transform: translateY(-50%);
}
</style>