<template>
    <Loader v-if="varView.cargando"></Loader>
    <div class="absolute inset-0 bg-white text-black w-[100vh] h-[100vh] z-999">
        <slot></slot>
    </div>

</template>

<script setup>
import { useVarView } from '~/stores/varview';
import Loader from '~/components/molecules/Spinner/Loader.vue';
const varView = useVarView();

</script>