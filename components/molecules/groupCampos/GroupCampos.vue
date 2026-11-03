<script setup>
import { ref, watch, computed } from 'vue';

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

// Compatibilidad: liveUpdate y liveUpdated (alias histórico)
const esLive = () => props.Propiedades.liveUpdate ?? props.Propiedades.liveUpdated;

// Estado del acordeón: abierto solo si está vacío (o si el builder lo pide)
const hayCompletos = (lista) => lista.some(item =>
    props.Propiedades.campos.every(campo => item[campo.name] !== '' && item[campo.name] != null)
);

const showCampos = ref(
    props.Propiedades.disabled
        ? false
        : (props.Propiedades.abierto ?? !hayCompletos(props.modelValue || []))
);

const draftIndex = ref(null);

// Índice en edición
const editIndex = ref(null);

// Fila expandida en el listado (para textos largos)
const expandedIndex = ref(null);

watch(() => props.modelValue, val => {
    items.value = [...val];
});

// Agregar o actualizar
const saveItem = () => {
    if (!isFormValid()) return;

    draftIndex.value = null;
    editIndex.value = null;

    if (esLive()) {
        // Confirmar el último item y crear uno nuevo vacío
        const nuevoDraft = { ...props.Propiedades.addItem };
        items.value.push(nuevoDraft);
        draftIndex.value = items.value.length - 1;

        form.value = { ...props.Propiedades.addItem };
    } else {
        // Modo normal
        form.value = { ...props.Propiedades.addItem };
    }

    showCampos.value = true;
    emit('update:modelValue', [...items.value]);
};

// Validacion al agregar
const isFormValid = () => {
    if (esLive()) {
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
    if (esLive()) {
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
    editIndex.value = null;
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

    if (esLive()) {
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

// Valor a mostrar en cada campo del editor (corrige el prellenado en liveUpdate)
const modelValueDe = (campo) => {
    if (editIndex.value !== null) return form.value[campo.name];
    if (esLive() && draftIndex.value !== null) return items.value.at(-1)?.[campo.name];
    return form.value[campo.name];
};

// Computada que filtra solo los completos
const itemsCompletos = computed(() =>
    items.value.filter(item =>
        props.Propiedades.campos.every(campo => item[campo.name] !== '' && item[campo.name] != null)
    )
);

// Resumen del último registro (se muestra en el header colapsado)
const resumenUltimo = computed(() => {
    const item = itemsCompletos.value.at(-1);
    if (!item) return '';
    const valores = props.Propiedades.campos
        .map(campo => item[campo.name])
        .filter(valor => valor !== '' && valor != null);
    return valores.slice(0, 2).join(' · ');
});

// Columnas del listado según cantidad de campos
const columnasListado = computed(() => {
    const total = props.Propiedades.campos.length;
    if (total <= 2) return 'sm:grid-cols-2';
    if (total <= 4) return 'sm:grid-cols-2 lg:grid-cols-4';
    return 'sm:grid-cols-2 xl:grid-cols-3';
});

const esTarjetas = () => props.Propiedades.vista === 'tarjetas';

</script>

<template>
    <div
        class="col-span-2 rounded-2xl border border-primary-200/70 dark:border-primary-800/50 bg-primary-50/25 dark:bg-gray-900 shadow-sm overflow-hidden">

        <!-- ================= HEADER ================= -->
        <div class="flex items-center gap-3 px-3 py-2.5 border-b border-primary-100 dark:border-gray-800"
            :class="Propiedades.disabled ? '' : 'cursor-pointer select-none'"
            @click="!Propiedades.disabled && (showCampos = !showCampos)">

            <div
                class="h-9 w-9 shrink-0 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">

                <i class="fa-solid fa-layer-group text-primary-600 dark:text-primary-400 text-sm"></i>

            </div>

            <div class="min-w-0 flex-1">

                <div class="flex items-center gap-2 flex-wrap">

                    <h3 class="font-semibold text-sm text-gray-900 dark:text-white truncate">

                        {{ Propiedades.labelGroup }}

                    </h3>

                    <span
                        class="inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:text-primary-300">

                        {{ itemsCompletos.length }}

                    </span>

                    <span
                        class="hidden sm:inline text-[10px] uppercase tracking-wider text-primary-500 dark:text-primary-400">

                        Campo múltiple

                    </span>

                </div>

                <p v-if="!showCampos && resumenUltimo" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">

                    {{ resumenUltimo }}

                </p>

            </div>

            <button v-if="!Propiedades.disabled" type="button" @click.stop="showCampos = !showCampos"
                class="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition"
                :class="showCampos
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'">

                <i class="fa-solid" :class="showCampos ? 'fa-angle-up' : 'fa-plus'">
                </i>

                {{ showCampos ? 'Ocultar' : 'Agregar' }}

            </button>

        </div>

        <!-- ================= FORM ================= -->

        <Transition enter-active-class="transition-all duration-300" leave-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-3" leave-to-class="opacity-0 -translate-y-3">

            <div v-if="showCampos"
                class="px-3 py-3 border-b border-primary-100 dark:border-gray-800 bg-white/70 dark:bg-gray-950/40">

                <!-- ALERTA EDICIÓN -->
                <div v-if="editIndex !== null"
                    class="mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-3 py-1.5">

                    <i class="fa-solid fa-pen text-amber-600 text-xs"></i>

                    <p class="text-xs text-amber-700 dark:text-amber-300">

                        <span class="font-semibold">Editando registro</span> — al guardar se actualizará este elemento.

                    </p>

                </div>

                <!-- FORMULARIO -->
                <div :class="[Propiedades.containerCampos, 'gap-3']">

                    <div v-for="campo in Propiedades.campos" :key="campo.name" :class="campo.tamaño"
                        class="[&_textarea]:max-h-32">

                        <component :is="campos[campo.typeCampo]" :modelValue="modelValueDe(campo)" :Propiedades="campo"
                            @update:modelValue="value => updateField(campo.name, value, campo)"
                            @keyup.enter="saveItem" />

                    </div>

                </div>

                <!-- BOTONES -->
                <div class="flex justify-end gap-2 mt-3">

                    <button v-if="editIndex !== null" type="button" @click="resetForm"
                        class="h-8 px-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium transition">

                        <i class="fa-solid fa-xmark mr-1.5"></i>

                        Cancelar

                    </button>

                    <button type="button" @click="saveItem" :disabled="!isFormValid()"
                        class="h-8 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
                        :class="isFormValid()
                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'">

                        <i class="fa-solid" :class="editIndex !== null ? 'fa-check' : 'fa-plus'">
                        </i>

                        {{ editIndex !== null ? 'Actualizar' : 'Guardar' }}

                    </button>

                </div>

            </div>

        </Transition>

        <!-- ================= LISTADO ================= -->

        <div class="px-3 py-2">

            <!-- Vista: filas (default) -->
            <TransitionGroup v-if="!esTarjetas()" name="list" tag="div"
                class="divide-y divide-primary-100/70 dark:divide-gray-800">

                <div v-for="(item, index) in itemsCompletos" :key="index"
                    class="flex items-start gap-2 py-2 px-2 rounded-lg hover:bg-primary-50/60 dark:hover:bg-primary-900/15 transition">

                    <div class="flex-1 min-w-0 grid gap-x-4 gap-y-1" :class="columnasListado">

                        <div v-for="campo in Propiedades.campos" :key="campo.name" class="min-w-0">

                            <p class="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 truncate">

                                {{ campo.label }}

                            </p>

                            <p class="text-sm text-gray-700 dark:text-gray-200 cursor-pointer" :class="expandedIndex === index
                                ? 'whitespace-pre-wrap wrap-break-words'
                                : 'line-clamp-2'"
                                :title="expandedIndex === index ? '' : String(item[campo.name] ?? '')"
                                @click="expandedIndex = expandedIndex === index ? null : index">

                                {{ item[campo.name] || '—' }}

                            </p>

                        </div>

                    </div>

                    <div v-if="!Propiedades.disabled" class="flex gap-1 shrink-0">

                        <ButtonRounded v-if="!Propiedades.ocultarEditar" @click="editItem(index)" tooltip="Editar"
                            color="h-7 w-7 text-sm rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900 text-amber-600 flex justify-center items-center transition">

                            <i class="fa-solid fa-pen"></i>

                        </ButtonRounded>

                        <ButtonRounded v-if="!Propiedades.ocultarEliminar" @click="removeItem(index)" tooltip="Eliminar"
                            color="h-7 w-7 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-600 flex justify-center items-center transition">

                            <i class="fa-solid fa-trash"></i>

                        </ButtonRounded>

                    </div>

                </div>

            </TransitionGroup>

            <!-- Vista: tarjetas -->
            <TransitionGroup v-else name="list" tag="div" class="space-y-3">

                <div v-for="(item, index) in itemsCompletos" :key="index"
                    class="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:border-primary-200 dark:hover:border-primary-700 transition-all overflow-hidden">

                    <div class="flex flex-col xl:flex-row">

                        <div class="flex-1 grid gap-4 p-4" :class="columnasListado">

                            <div v-for="campo in Propiedades.campos" :key="campo.name" class="space-y-1 min-w-0">

                                <p class="text-xs uppercase tracking-wide text-gray-400">

                                    {{ campo.label }}

                                </p>

                                <p class="font-medium text-gray-800 dark:text-gray-100 wrap-break-words">

                                    {{ item[campo.name] || '-' }}

                                </p>

                            </div>

                        </div>

                        <div v-if="!Propiedades.disabled"
                            class="flex xl:flex-col justify-end gap-2 p-2 border-t xl:border-t-0 xl:border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">

                            <ButtonRounded v-if="!Propiedades.ocultarEditar" @click="editItem(index)" tooltip="Editar"
                                color="h-7 w-7 text-lg rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900 text-amber-600 flex justify-center items-center transition">

                                <i class="fa-solid fa-pen"></i>

                            </ButtonRounded>

                            <ButtonRounded v-if="!Propiedades.ocultarEliminar" @click="removeItem(index)"
                                tooltip="Eliminar"
                                color="h-7 w-7 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-600 flex justify-center items-center transition">

                                <i class="fa-solid fa-trash"></i>

                            </ButtonRounded>

                        </div>

                    </div>

                </div>

            </TransitionGroup>

            <!-- ================= EMPTY ================= -->

            <!-- <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0 scale-95">

                <div v-if="!itemsCompletos.length && showCampos" @click="!Propiedades.disabled && (showCampos = true)"
                    class="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-2 py-3 flex-col items-center justify-center text-center transition-all">
                    <div class="divide-y divide-primary-100/70 dark:divide-gray-800">
                        <div v-for="n in 1" :key="n" class="flex items-start gap-2 py-2 px-2">

                            <div class="flex-1 min-w-0 grid gap-x-4 gap-y-1" :class="columnasListado">
                                <div v-for="c in 2" :key="c" class="min-w-0">

                                    <div class="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700 mb-1" />


                                    <div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />

                                    <div class="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mt-1" />
                                </div>
                            </div>


                            <div class="flex gap-1 shrink-0">
                                <div class="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                                <div class="h-7 w-7 rounded-lg bg-gray-200 dark:bg-gray-700" />
                            </div>
                        </div>
                    </div>

                </div>

            </Transition> -->

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
