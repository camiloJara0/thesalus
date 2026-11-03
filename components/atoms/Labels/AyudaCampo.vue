<script setup>
// Ayuda de campo estandar para formularios.
// - Propiedades.help: texto breve de ayuda (se muestra con icono)
// - Propiedades.slot.tooltip: HTML adicional (compatibilidad con el uso existente)
const props = defineProps({
    Propiedades: {
        type: Object,
        default: () => ({})
    }
});

const hayHelp = computed(() => Boolean(props.Propiedades?.help));
const hayTooltip = computed(() => Boolean(props.Propiedades?.slot?.tooltip));
</script>

<template>
    <div v-if="hayHelp || hayTooltip">
        <p v-if="hayHelp" class="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-start gap-1">
            <UIcon name="i-lucide-circle-help" class="size-3.5 shrink-0 mt-px" />
            <span>{{ Propiedades.help }}</span>
        </p>
        <!-- <div v-if="hayTooltip" v-html="Propiedades.slot?.tooltip"></div> -->
    </div>
</template>
