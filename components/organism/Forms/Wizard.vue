<script setup>
const props = defineProps({
    cerrar: {
        type: Function,
        default: () => { }
    },
    Propiedades: {
        type: [Object]
    },
    SeccionActual: {
        default: 0
    }
});
const varView = useVarView()

function editar() {
    varView.soloVer = !varView.soloVer
}
</script>

<template>
    <div
        class="relative w-full flex md:flex-row justify-between items-center gap-2 py-4 md:px-8 px-2 bg-(--color-default) rounded-t-lg">
        <div class="flex flex-col">
            <h2 class="text-white font-bold md:text-2xl text-xl">{{ Propiedades.tituloFormulario }}</h2>
            <div class="flex gap-3 pt-1">
                <p class="flex items-center text-gray-200 text-sm gap-1" v-for="(seccion, index) in Propiedades.secciones"
                :class="{ 'text-white font-medium': index === props.SeccionActual }">
                    {{ seccion.nombre }}
                    <i class="fa-solid fa-angle-right text-gray-300" v-if="index + 1 !== props.Propiedades.secciones.length"></i>
                </p>
            </div>
        </div>
        <div class="flex items-center">
            <div class="flex items-center md:ml-5 ml-2 md:gap-0 gap-1">
                <div v-if="props.Propiedades?.guardar" @click="props.Propiedades.guardar?.()"
                    class="md:w-10 w-5 md:h-10 h-5 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                    <i class="fa-solid fa-disk text-gray-100 md:text-xl text-lg"></i>
                </div>
                <div v-if="props.Propiedades?.eliminar" @click="props.Propiedades.eliminar?.()"
                    class="md:w-10 w-5 md:h-10 h-5 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                    <i class="fa-solid fa-trash text-gray-100 md:text-xl text-lg"></i>
                </div>
                <div v-if="props.Propiedades?.editarFormulario" @click="editar"
                    class="md:w-10 w-5 md:h-10 h-5 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer"
                    :class="{'bg-[rgba(0,0,0,0.1)] text-white' : !varView.soloVer}">
                    <i class="fa-solid fa-pencil text-gray-100 md:text-xl text-lg"></i>
                </div>
                <div @click="props.cerrar"
                    class="md:w-10 w-5 md:h-10 h-5 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                    <i class="fa-solid fa-close text-gray-100 hover:text-white md:text-xl text-lg"></i>
                </div>
            </div>
        </div>
    </div>
</template>