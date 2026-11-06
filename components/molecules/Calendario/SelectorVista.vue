<script setup>
const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])

const VISTAS = [
    { id: 'scroll', label: 'Scroll', icon: 'i-lucide-layout-list' },
    { id: 'calendario', label: 'Calendario', icon: 'i-lucide-calendar-days' },
    { id: 'tabla', label: 'Tabla', icon: 'i-lucide-table-properties' },
]
</script>

<template>
    <div role="tablist" aria-label="Selector de vista de agenda"
        class="inline-flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-1">
        <button v-for="v in VISTAS" :key="v.id" type="button" role="tab" :aria-selected="props.modelValue === v.id"
            :aria-label="v.label" :title="v.label"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-default)"
            :class="props.modelValue === v.id
                ? 'bg-(--color-default) text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'"
            @click="emit('update:modelValue', v.id)">
            <UIcon :name="v.icon" class="size-4" />
            <span class="hidden md:inline">{{ v.label }}</span>
        </button>
    </div>
</template>
