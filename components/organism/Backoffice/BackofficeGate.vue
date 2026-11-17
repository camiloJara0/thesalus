<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Breadcrumb from '~/components/molecules/BreadCrumbs/Breadcrumb.vue';
import Restringido from '~/components/organism/NoEnviados/Restringido.vue'

defineProps({
    titulo: { type: String, default: 'Backoffice' },
    subtitulo: { type: String, default: '' }
})

const { puedeBackoffice } = usePermisos()
</script>

<template>
    <Restringido v-if="!puedeBackoffice" />
    <FondoDefault v-else class="p-4 md:p-6 space-y-5">
        <Breadcrumb :navbar="false" :show="true"></Breadcrumb>
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UIcon name="i-lucide-shield-check" class="text-primary" />
                    {{ titulo }}
                </h1>
                <p v-if="subtitulo" class="text-sm text-gray-500 dark:text-gray-400">{{ subtitulo }}</p>
            </div>
            <UBadge color="warning" variant="soft">SuperAdmin</UBadge>
        </div>
        <slot />
    </FondoDefault>
</template>
