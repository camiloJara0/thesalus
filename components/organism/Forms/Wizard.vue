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
    },
    irASeccion: {
        type: Function,
        default: () => {}
    },
    progreso: {
        type: Number,
        default: null
    },
    estadoGuardado: {
        type: String,
        default: 'idle'
    },
    ultimoGuardado: {
        type: [Date, Object, String],
        default: null
    }
});
const varView = useVarView()

function editar() {
    varView.soloVer = !varView.soloVer
}
</script>

<template>
    <div class="w-full">
        <div
            class="relative w-full flex md:flex-row justify-between items-center gap-2 py-4 md:px-8 px-2 bg-(--color-default) rounded-t-lg">
            <div class="flex flex-col">
                <h2 class="text-white font-bold md:text-2xl text-xl">{{ Propiedades.tituloFormulario }}</h2>
                <div class="flex gap-3 pt-1">
                    <p class="flex items-center text-gray-200 text-sm gap-1 hover:text-gray-100 cursor-pointer" v-for="(seccion, index) in Propiedades.secciones"
                    :class="{ 'text-white font-medium': index === props.SeccionActual }" @click="props.irASeccion(index)">
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

        <!-- Indicador de avance y estado de guardado -->
        <div v-if="Propiedades?.tipo === 'Wizard'" class="w-full px-5 pb-2 bg-(--color-default)">
            <!-- <div class="h-1 w-full bg-white/25 rounded-full overflow-hidden">
                <div class="h-full bg-white/90 rounded-full transition-all duration-500"
                    :style="{ width: Math.max(props.progreso ?? 0, 2) + '%' }"></div>
            </div> -->
            <div class="flex justify-between text-[11px] text-gray-200 px-0.5">
                <span>
                    Paso {{ (props.SeccionActual ?? 0) + 1 }} de {{ props.Propiedades?.secciones?.length || 0 }}
                    <span v-if="props.progreso !== null && props.progreso !== undefined">· {{ props.progreso }}%</span>
                </span>
                <span v-if="props.estadoGuardado === 'guardado'">
                    <i class="fa-solid fa-cloud-arrow-up mr-1"></i>Borrador guardado
                </span>
                <span v-else-if="props.estadoGuardado === 'guardando'">
                    <i class="fa-solid fa-rotate mr-1"></i>Guardando…
                </span>
            </div>
        </div>
    </div>
</template>