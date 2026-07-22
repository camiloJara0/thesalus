<script setup>
import Input from '~/components/atoms/Inputs/Input.vue'
import Select from '~/components/atoms/Selects/Select.vue'
import Textarea from '~/components/atoms/Textareas/Textarea.vue'

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
    }
})

const emit = defineEmits(['update:modelValue'])

const SI_NO_OPTIONS = [
    { label: 'SI', value: "1" },
    { label: 'NO', value: "0" }
]

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
        disabled: props.disabled,
        placeholder: props.campo.placeholder || props.campo.nombre
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
                items: (props.campo?.opciones || []).split('\n').map(o =>
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
        :modelValue="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
    />
</template>
