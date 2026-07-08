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
<div
    class="col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">

    <!-- ================= HEADER ================= -->
    <div
        class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-3 py-2 border-b border-gray-200 dark:border-gray-800">

        <div class="flex items-center gap-4">

            <div
                class="h-11 w-11 rounded-2xl bg-gray-50 dark:bg-gray-900/30 flex items-center justify-center">

                <i class="fa-solid fa-layer-group text-gray-300 text-lg"></i>

            </div>

            <div>

                <h3 class="font-semibold text-lg text-gray-900 dark:text-white">

                    {{ Propiedades.labelGroup }}

                </h3>

                <div class="flex items-center gap-3 mt-1">

                    <span
                        class="inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/40 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">

                        {{ itemsCompletos.length }}
                        {{ itemsCompletos.length == 1 ? 'registro' : 'registros' }}

                    </span>

                    <span class="text-xs text-gray-500">

                        Administra la información agregada.

                    </span>

                </div>

            </div>

        </div>

        <ButtonRounded
            v-if="!Propiedades.disabled"
            @click="showCampos = !showCampos"
            color="px-4 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition flex items-center gap-2">

            <i
                class="fa-solid"
                :class="showCampos ? 'fa-angle-up' : 'fa-plus'">
            </i>

            <!-- {{ showCampos ? 'Ocultar formulario' : 'Agregar registro' }} -->

        </ButtonRounded>

    </div>

    <!-- ================= FORM ================= -->

    <Transition
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-3"
        leave-to-class="opacity-0 -translate-y-3">

        <div
            v-if="showCampos"
            class="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">

            <!-- ALERTA EDICIÓN -->

            <div
                v-if="editIndex !== null"
                class="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4">

                <div class="flex gap-3">

                    <div
                        class="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">

                        <i class="fa-solid fa-pen text-amber-600"></i>

                    </div>

                    <div>

                        <p class="font-semibold text-base text-amber-700 dark:text-amber-300">

                            Editando registro

                        </p>

                        <p class="text-xs text-amber-600 dark:text-amber-400">

                            Al guardar se actualizará este elemento.

                        </p>

                    </div>

                </div>

            </div>

            <!-- FORMULARIO -->

            <div
                class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm">

                <div
                    :class="[Propiedades.containerCampos, 'gap-5']">

                    <div
                        v-for="campo in Propiedades.campos"
                        :key="campo.name"
                        :class="campo.tamaño">

                        <component
                            :is="campos[campo.typeCampo]"
                            :modelValue="Propiedades.liveUpdate
                                ? items.at(-1)?.[campo.name]
                                : form[campo.name]"
                            :Propiedades="campo"
                            @update:modelValue="value => updateField(campo.name, value, campo)"
                            @keyup.enter="saveItem" />

                    </div>

                </div>

                <!-- BOTONES -->

                <div
                    class="flex flex-col sm:flex-row justify-end gap-3 mt-3">

                    <button
                        v-if="editIndex !== null"
                        type="button"
                        @click="resetForm"
                        class="px-3 h-8 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">

                        <i class="fa-solid fa-xmark mr-2"></i>

                        Cancelar

                    </button>

                    <button
                        type="button"
                        @click="saveItem"
                        :disabled="!isFormValid()"
                        :class="[

                            'px-3 h-8 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2',

                            isFormValid()

                                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow hover:shadow-lg'

                                : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'

                        ]">

                        <i
                            class="fa-solid"
                            :class="editIndex !== null ? 'fa-check' : 'fa-plus'">
                        </i>

                        {{ editIndex !== null ? 'Actualizar' : 'Guardar' }}

                    </button>

                </div>

            </div>

        </div>

    </Transition>

    <!-- ================= LISTADO ================= -->

    <div class="p-6">

        <TransitionGroup
            name="list"
            tag="div"
            class="space-y-4">

            <div
                v-for="(item, index) in itemsCompletos"
                :key="index"
                class="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 overflow-hidden">

                <div class="flex flex-col xl:flex-row">

                    <!-- Información -->

                    <div
                        class="flex-1 grid gap-5 p-5"
                        :class="[
                            Propiedades.campos.length <= 2
                                ? 'md:grid-cols-2'
                                : Propiedades.campos.length <=4
                                    ? 'md:grid-cols-2 xl:grid-cols-4'
                                    : 'md:grid-cols-2 xl:grid-cols-3'
                        ]">

                        <div
                            v-for="campo in Propiedades.campos"
                            :key="campo.name"
                            class="space-y-1">

                            <p
                                class="text-xs uppercase tracking-wide text-gray-400">

                                {{ campo.label }}

                            </p>

                            <p
                                class="font-medium text-gray-800 dark:text-gray-100 wrap-break-words">

                                {{ item[campo.name] || '-' }}

                            </p>

                        </div>

                    </div>

                    <!-- Acciones -->

                    <div
                        v-if="!Propiedades.disabled"
                        class="flex xl:flex-col justify-end gap-2 p-2 border-t xl:border-t-0 xl:border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">

                        <ButtonRounded
                            v-if="!Propiedades.ocultarEditar"
                            @click="editItem(index)"
                            tooltip="Editar"

                            color="h-7 w-7 text-lg rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900 text-amber-600 flex justify-center items-center transition">

                            <i class="fa-solid fa-pen"></i>

                        </ButtonRounded>

                        <ButtonRounded
                            v-if="!Propiedades.ocultarEliminar"
                            @click="removeItem(index)"
                            tooltip="Eliminar"

                            color="h-7 w-7 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-600 flex justify-center items-center transition">

                            <i class="fa-solid fa-trash"></i>

                        </ButtonRounded>

                    </div>

                </div>

            </div>

        </TransitionGroup>

        <!-- ================= EMPTY ================= -->

        <Transition
            enter-active-class="transition duration-300"
            enter-from-class="opacity-0 scale-95">

            <div
                v-if="!itemsCompletos.length && showCampos"
                @click="!Propiedades.disabled && (showCampos = true)"
                class="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all">

                <div
                    class="w-15 h-15 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">

                    <i
                        class="fa-solid fa-folder-plus text-2xl text-primary-600">
                    </i>

                </div>

                <h3
                    class="text-base font-semibold text-gray-800 dark:text-white">

                    No hay registros agregados

                </h3>

                <p
                    class="text-gray-500 mt-2 max-w-md text-xs">

                    Agrega el primer registro para comenzar a completar esta sección.

                </p>

            </div>

        </Transition>

    </div>

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