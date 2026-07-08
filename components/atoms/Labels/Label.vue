<script setup>
import ButtonRounded from '../Buttons/ButtonRounded.vue';
const props = defineProps({
    Propiedades: {
        type: Object,
        default: {}
    }
});

const isHtml = computed(() => /<\/?[a-z][\s\S]*>/i.test(props.Propiedades.text))
</script>
<template>
    <label :for="Propiedades.forLabel" class="font-medium text-gray-700 dark:text-gray-200 flex justify-between items-center"
        :class="Propiedades.tamaño" @click="Propiedades.events?.onClick" @change="Propiedades.events?.onChange"
        @blur="Propiedades.events?.onBlur" @keyup.enter="Propiedades.events?.onKeyUp">
        <slot></slot>
        <span v-if="isHtml" v-html="Propiedades.text" class="w-full"></span>
        <span v-else>{{ text }}</span>
        <div v-if="Propiedades.buttons" class="flex gap-2 items-center">
            <a v-for="button in Propiedades.buttons" @click="button.action">
                <ButtonRounded :color="button.color"><i :class="button.icon"></i></ButtonRounded>
            </a>
        </div>
    </label>
</template>