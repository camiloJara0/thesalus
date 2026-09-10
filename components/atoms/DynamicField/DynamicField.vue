<script setup>
import { computed, watch } from 'vue'
import Input from '~/components/atoms/Inputs/Input.vue'
import Select from '~/components/atoms/Selects/Select.vue'
import Textarea from '~/components/atoms/Textareas/Textarea.vue'
import { useCalculoKardex } from '~/composables/Kardex/useCalculoKardex'

const props = defineProps({
    campo: {
        type: Object,
        required: true
    },
    modelValue: {
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'ghost'
    },
    registros: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:modelValue'])

const SI_NO_OPTIONS = [
    { label: 'SI', value: "1" },
    { label: 'NO', value: "0" }
]

const esFormula = ['suma', 'resta', 'multiplicacion', 'division'].includes(props.campo.tipo)

const { resultado } = esFormula
    ? useCalculoKardex(props.campo, computed(() => props.registros))
    : { resultado: computed(() => '') }

watch(resultado, (val) => {
    if (esFormula && val !== '' && val !== props.modelValue) {
        emit('update:modelValue', val)
    }
})

const componenteRender = computed(() => {
    switch (props.campo.tipo) {
        case 'text':
        case 'number':
        case 'date':
            return Input
        case 'select':
        case 'boolean':
            return Select
        case 'textarea':
            return Textarea
        default:
            return Input
    }
})

const propsComponente = computed(() => {
    const base = {
        variant: props.variant,
        disabled: props.disabled || esFormula,
        placeholder: props.campo.placeholder || props.campo.nombre
    }

    if (esFormula) {
        return {
            ...base,
            type: 'number',
            placeholder: resultado.value !== '' ? String(resultado.value) : '0'
        }
    }

    switch (props.campo.tipo) {
        case 'text':
            return { ...base, type: 'text' }
        case 'number':
            return { ...base, type: 'number' }
        case 'date':
            return { ...base, type: 'date' }
        case 'select':
            return {
                ...base,
                items: (props.campo?.opciones || '').split('\n').map(o =>
                    typeof o === 'string' ? { label: o, value: o } : o
                )
            }
        case 'boolean':
            return {
                ...base,
                items: SI_NO_OPTIONS
            }
        case 'textarea':
            return { ...base, rows: 2 }
        default:
            return { ...base, type: 'text' }
    }
})
</script>

<template>
    <component
        :is="componenteRender"
        v-bind="propsComponente"
        :modelValue="esFormula ? resultado : modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
    />
</template>
