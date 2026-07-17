<script setup>
import { computed, watch } from 'vue'
import Form from '../Forms/Form.vue'
import { useCampoBuilder } from '~/build/Kardex/useCampoBuilder'
import { useKardexStore } from '~/stores/Entidades/Kardex'

const props = defineProps({
    modelValue: Boolean,
    campo: { type: Object, default: null },
    modo: { type: String, default: 'crear' }
})

const emit = defineEmits(['update:modelValue', 'guardado'])

const notificaciones = useNotificacionesStore()
const kardexStore = useKardexStore()

const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})

const propiedadesCampo = computed(() =>
    useCampoBuilder({
        modo: props.modo,
        campo: props.campo,
        onCerrar: () => { kardexStore.showCampo = false },
        show: kardexStore.showCampo
    })
)

async function onFormGuardado(data) {
    try {
        const campoData = data.Campo || {}

        if (campoData.opciones_texto) {
            campoData.opciones = campoData.opciones_texto
                .split('\n')
                .map(o => o.trim())
                .filter(o => o.length > 0)
            delete campoData.opciones_texto
        } else {
            campoData.opciones = []
        }

        campoData.requerido = Number(campoData.requerido) || 0

        if (props.modo === 'editar' && props.campo) {
            await kardexStore.actualizarCampo(props.campo.id, campoData)
        } else {
            await kardexStore.crearCampo(campoData)
        }

        notificaciones.options.icono = 'success'
        notificaciones.options.background = '#22c55e'
        notificaciones.options.texto = props.modo === 'editar' ? 'Campo actualizado' : 'Campo creado'
        notificaciones.options.tiempo = 2000
        notificaciones.mensaje()

        emit('guardado')
        isOpen.value = false
        return true
    } catch (error) {
        notificaciones.options.icono = 'error'
        notificaciones.options.background = '#d33'
        notificaciones.options.texto = 'No se pudo guardar el campo'
        notificaciones.options.tiempo = 3000
        notificaciones.mensaje()
        return false
    }
}
</script>

<template>
    <!-- <UModal v-model="isOpen" :ui="{ width: 'w-[480px]' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                    {{ modo === 'editar' ? 'Editar Campo' : 'Nuevo Campo' }}
                </h3>
                <UButton icon="i-lucide-x" variant="ghost" @click="isOpen = false" />
            </div>
        </template>

        <template #default>
            <div class="p-2">
            </div>
        </template>
    </UModal> -->

    <Form :Propiedades="propiedadesCampo" @submit="onFormGuardado" />
</template>
