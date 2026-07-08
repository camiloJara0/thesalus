<script setup>
const props = defineProps({
    Propiedades: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div class="flex flex-col" :class="Propiedades.contenedor">
        <!-- Header -->
        <div v-if="Propiedades.header && Propiedades.header.title" class="py-5 flex justify-between">
            <div>
                <h3 class="text-xl font-bold">{{ Propiedades.header.title }}</h3>
                <p>{{ Propiedades.header.subtitle }}</p>
            </div>
            <div>
                <span v-html="Propiedades.header.html"></span>
            </div>
        </div>
        <!-- Card -->
        <div class="space-y-4" :class="Propiedades.contenedorCards">
            <!-- Skeleton cuando no hay datos -->
            <template v-if="!unref(props.Propiedades.cards) || unref(props.Propiedades.cards).length === 0">
                <div v-for="i in props.Propiedades.numeroCards || 1" :key="i" :class="Propiedades.tamaño"
                    class="w-full p-4 shadow-md bg-white dark:bg-gray-700 flex flex-col gap-4 animate-pulse">
                    <!-- HEADER -->
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div class="flex flex-col gap-2">
                        <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div class="w-20 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                        </div>
                    </div>
                    <!-- BODY -->
                    <div class="space-y-2">
                        <div class="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div class="w-3/4 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                    </div>
                    <!-- FOOTER -->
                    <div class="flex gap-2 pt-2">
                        <div class="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div class="w-16 h-6 bg-gray-200 dark:bg-gray-500 rounded-full"></div>
                    </div>
                </div>
            </template>

            <div v-for="(card, i) in unref(props.Propiedades.cards)" @click="card.accion"
                class="w-full p-4 shadow-md bg-white dark:bg-gray-700 flex flex-col gap-4" :class="Propiedades.tamaño">
                <!-- HEADER -->
                <div class="flex items-center gap-3" v-if="card.header">
                    <!-- Icono -->
                    <div v-if="card.header.icon" class="w-10 h-10 flex items-center justify-center rounded-full"
                        :class="card.header.iconBg || 'bg-blue-100 dark:bg-blue-900'">
                        <i :class="card.header.icon" class="text-xl"></i>
                    </div>

                    <span v-html="card.header.html"></span>
                    <!-- Imagen -->
                    <img v-if="card.header.img" :src="card.header.img" alt="imagen"
                        class="w-12 h-12 rounded-full object-cover" />

                    <div v-if="card.header.title">
                        <h3 class="font-semibold text-gray-900 dark:text-white" :class="card.header.titleClass">
                            {{ card.header.title }}
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-300" :class="card.header.subtitleClass">
                            {{ card.header.subtitle }}
                        </p>
                    </div>
                </div>

                <!-- BODY -->
                <div v-if="card.body">
                    <p class="text-sm text-gray-700 dark:text-gray-200" :class="card.body.style" v-if="card.body.text">
                        {{ card.body.text }}
                    </p>

                    <div v-if="card.body.html" v-html="card.body.html"></div>
                </div>

                <!-- FOOTER -->
                <div class="flex flex-col items-center justify-between pt-2 gap-2" v-if="card.footer">
                    <!-- Estado -->
                    <span v-if="card.footer.status" class="px-3 py-1 text-xs font-medium rounded-full"
                        :class="card.footer.statusClass">
                        {{ card.footer.status }}
                    </span>

                    <!-- Botones -->
                    <div class="flex gap-2" v-if="card.footer.buttons">
                        <button v-for="(btn, i) in card.footer.buttons" :key="i" :class="btn.class">
                            <i v-if="btn.icon" :class="btn.icon"></i>
                            {{ btn.text }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>