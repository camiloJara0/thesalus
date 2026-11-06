<script setup>
const props = defineProps({
    icono: {
        type: String,
        default: 'i-lucide-calendar-x',
    },
    titulo: {
        type: String,
        required: true,
    },
    accion: {
        type: String,
        default: '',
    },
})

const emit = defineEmits(['accion'])
</script>

<template>
    <div class="flex flex-col items-center justify-center text-center py-14 px-6">
        <div class="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-4">
            <UIcon :name="props.icono" class="size-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p class="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-sm">
            {{ props.titulo }}
        </p>
        <UButton v-if="props.accion" class="mt-4" size="sm" color="primary" variant="soft" :label="props.accion"
            @click="emit('accion')" />
    </div>
</template>
