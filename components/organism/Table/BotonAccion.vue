<template>
    <button class="action-btn group relative flex items-center justify-center
        w-6 h-6 rounded-md
        hover:bg-gray-200 dark:hover:bg-gray-500
        transition-all duration-150
        active:scale-90" :class="variantClase">
        <i :class="iconoClase" class="text-xs px-1 transition-transform duration-150 group-hover:scale-110"></i>
    </button>
</template>

<script setup>
const props = defineProps({
    tipo: String, // 'ver', 'actualizar', 'borrar'
});

const iconoClase = computed(() => {
    switch (props.tipo) {
        case 'ver':
            return 'fa-regular fa-eye';
        case 'actualizar':
            return 'fa-regular fa-pen-to-square';
        case 'borrar':
            return 'fa-regular fa-trash-can';
        case 'completar':
            return 'fa-solid fa-check';
        case 'agregar':
            return 'fa-solid fa-plus';
        case 'download':
            return 'fa-solid fa-download';
        case 'observacion eliminada':
            return 'fa-solid fa-info';
        case 'observacion editada':
            return 'fa-solid fa-info';
        case 'observacion completada':
            return 'fa-solid fa-info';
        case 'pdf':
            return 'fa-solid fa-file-pdf';
        case 'movimiento':
            return 'fa-solid fa-chart-line';
        case 'configurar':
            return 'fa-solid fa-cog';
        default:
            return props.tipo;
    }
});

const variantClase = computed(() => {
    switch (props.tipo) {
        case 'ver':
            return 'text-blue-600 dark:text-blue-400';
        case 'actualizar':
            return 'text-amber-600 dark:text-amber-400';
        case 'borrar':
            return 'text-red-600 dark:text-red-400';
        case 'completar':
            return 'text-green-600 dark:text-green-400';
        case 'agregar':
            return 'text-blue-500 ';
        case 'download':
            return 'text-blue-700 ';
        case 'observacion eliminada':
            return 'text-red-500';
        case 'observacion editada':
            return 'text-amber-500 ';
        case 'observacion completada':
            return 'text-blue-600 ';
        case 'pdf':
            return 'text-black dark:text-white';
        case 'movimiento':
            return ' text-amber-600 dark:text-amber-700';
        case 'Rojo':
            return 'bg-red-500 hover:bg-red-500! w-[10px] h-[10px]';
        case 'Naranja':
            return 'bg-orange-400 hover:bg-orange-400! w-[10px] h-[10px]';
        case 'Verde':
            return 'bg-green-600 hover:bg-green-600! w-[10px] h-[10px]';
        default:
            return '';
    }
});
</script>

<style>
.action-btn {
  backdrop-filter: blur(4px);
}
</style>