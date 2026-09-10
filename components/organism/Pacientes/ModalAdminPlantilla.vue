<script setup>
import { ref, computed, watch } from 'vue'
import Form from '../Forms/Form.vue'
import ModalCampo from './ModalCampo.vue'
import { usePlantillaBuilder } from '~/build/Kardex/usePlantillaBuilder'
import { useKardexStore } from '~/stores/Entidades/Kardex'

const props = defineProps({
    modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'guardado'])

const varView = useVarView()
const notificaciones = useNotificacionesStore()
const kardexStore = useKardexStore()
const { hasPermiso } = usePermisos()

const puedePost = hasPermiso('Kardex_put')
const puedeDelete = hasPermiso('Kardex_put')

const vista = ref('lista')
const plantillaSeleccionada = ref(null)
const campoEditando = ref(null)
const campoModo = ref('crear')
const campoSeleccionadoParaAsignar = ref(null)
const opcionesCampos = ref([])

const isOpen = ref(false)

onMounted(async() => {
    await kardexStore.cargarPlantillas()
    await kardexStore.cargarCamposDisponibles()

    opcionesCampos.value = kardexStore.camposDisponibles.map(c => {
        return {label: c.titulo, value: c.id}
    })
})

watch(plantillaSeleccionada.value, async (val) => {
    if (val) {
        vista.value = 'lista'
        plantillaSeleccionada.value = null
        await kardexStore.cargarPlantillas()
        await kardexStore.cargarCamposDisponibles()
    }
})

let dragIndex = null
const ordenLocal = ref([])
const ordenModificado = ref(false)
const guardandoOrden = ref(false)

function syncOrdenLocal() {
   ordenLocal.value = kardexStore.camposPlantilla
        .slice()
        .sort((a, b) => (a.pivot?.orden ?? 0) - (b.pivot?.orden ?? 0))
        .map(c => ({ ...c }))
    ordenModificado.value = false
}

watch(() => kardexStore.camposPlantilla, () => {
    if (vista.value === 'editar') syncOrdenLocal()
}, { deep: true })

function onDragStart(index) {
    dragIndex = index
}

function onDragOver(e, index) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const arr = [...ordenLocal.value]
    const moved = arr.splice(dragIndex, 1)[0]
    if (moved !== undefined) {
        arr.splice(index, 0, moved)
        ordenLocal.value = arr
        dragIndex = index
        ordenModificado.value = true
    }
}

function onDragEnd() {
    dragIndex = null
}

function onDragEnter(e, index) {
    e.preventDefault()
}

async function guardarOrden() {
    if (!plantillaSeleccionada.value || !ordenModificado.value) return
    guardandoOrden.value = true
    try {
        const camposConOrden = ordenLocal.value.map((campo, i) => ({
            id: campo.id,
            orden: i + 1,
            requerido: campo.pivot?.requerido ?? 0,
        }))
        await kardexStore.guardarOrdenCampos(plantillaSeleccionada.value.id, camposConOrden)
        ordenModificado.value = false
        notificaciones.options.icono = 'success'
        notificaciones.options.texto = 'Orden guardado correctamente'
        notificaciones.options.tiempo = 2000
        notificaciones.mensaje()
        syncOrdenLocal()
    } catch (e) {
        notificaciones.options.icono = 'error'
        notificaciones.options.texto = 'Error al guardar el orden'
        notificaciones.options.tiempo = 3000
        notificaciones.mensaje()
    } finally {
        guardandoOrden.value = false
    }
}

const propiedadesCrearPlantilla = computed(() =>
    usePlantillaBuilder({
        modo: 'crear',
        show: kardexStore.showPlantilla,
        onCerrar: () => { kardexStore.showPlantilla = false },
    })
)

const propiedadesEditarPlantilla = computed(() =>
    plantillaSeleccionada.value
        ? usePlantillaBuilder({
            modo: 'editar',
            show: kardexStore.showPlantilla,
            plantilla: plantillaSeleccionada.value,
            camposAsignados: kardexStore.camposPlantilla,
            camposDisponibles: opcionesCampos.value,
            onCerrar: () => { kardexStore.showPlantilla = false },
        })
        : null
)

const camposNoAsignados = computed(() => {
    const asignados = new Set(kardexStore.camposPlantilla.map(c => c.id))
    return kardexStore.camposDisponibles.filter(c => !asignados.has(c.id))
})

async function editarPlantilla(plantilla) {
    await kardexStore.seleccionarPlantilla(plantilla.id)
    await kardexStore.cargarCamposDisponibles()
    plantillaSeleccionada.value = { ...plantilla }
    vista.value = 'editar'
    syncOrdenLocal()
}

function editar() {
    kardexStore.Formulario.Plantilla.nombre = plantillaSeleccionada.value.nombre
    kardexStore.Formulario.Plantilla.descripcion = plantillaSeleccionada.value.descripcion
    kardexStore.Formulario.Plantilla.estado = plantillaSeleccionada.value.activo
    kardexStore.showPlantilla = true
}

async function eliminarPlantilla(plantilla) {
    notificaciones.options.icono = 'warning'
    notificaciones.options.titulo = '¿Eliminar plantilla?'
    notificaciones.options.html = `Se eliminará la plantilla "${plantilla.nombre}"`
    notificaciones.options.confirmtext = 'Si, eliminar'
    notificaciones.options.canceltext = 'Cancelar'

    const respuesta = await notificaciones.alertRespuestaInput()
    if (respuesta.estado === 'confirmado') {
        await kardexStore.eliminarPlantilla(plantilla.id)
        notificaciones.options.icono = 'success'
        notificaciones.options.background = '#22c55e'
        notificaciones.options.texto = 'Plantilla eliminada'
        notificaciones.options.tiempo = 2000
        notificaciones.mensaje()
        emit('guardado')
    }
}

async function onFormPlantillaGuardado(data) {
    try {
        if (vista.value === 'editar' && plantillaSeleccionada.value) {
            await kardexStore.actualizarPlantilla(plantillaSeleccionada.value.id, data.Plantilla)
        } else {
            await kardexStore.crearPlantilla(data.Plantilla)
        }
        notificaciones.options.icono = 'success'
        notificaciones.options.background = '#22c55e'
        notificaciones.options.texto = 'Plantilla guardada correctamente'
        notificaciones.options.tiempo = 2000
        notificaciones.mensaje()
        vista.value = 'lista'
        plantillaSeleccionada.value = null
        emit('guardado')
        return true
    } catch (error) {
        notificaciones.options.icono = 'error'
        notificaciones.options.background = '#d33'
        notificaciones.options.texto = 'No se pudo guardar la plantilla'
        notificaciones.options.tiempo = 3000
        notificaciones.mensaje()
        return false
    }
}

async function asignarCampo(campo) {
    if (!plantillaSeleccionada.value) return
    await kardexStore.agregarCampoPlantilla(plantillaSeleccionada.value.id, {
        id_campo: campo.id,
        orden: kardexStore.camposPlantilla.length + 1,
        requerido: 0,
    })
    syncOrdenLocal()
    notificaciones.options.icono = 'success'
    notificaciones.options.background = '#22c55e'
    notificaciones.options.texto = `Campo "${campo.nombre}" asignado`
    notificaciones.options.tiempo = 1500
    notificaciones.mensaje()
}

async function removerCampo(campo) {
    if (!plantillaSeleccionada.value) return
    await kardexStore.eliminarCampoPlantilla(plantillaSeleccionada.value.id, campo.id)
    syncOrdenLocal()
    notificaciones.options.icono = 'info'
    notificaciones.options.texto = `Campo "${campo.nombre}" removido`
    notificaciones.options.tiempo = 1500
    notificaciones.mensaje()
}

function abrirCrearCampo() {
    campoEditando.value = null
    campoModo.value = 'crear'
    kardexStore.showCampo = true
}

function abrirEditarCampo(campo) {
    campoEditando.value = campo
    kardexStore.Formulario.Campo = JSON.parse(JSON.stringify(campo))
    if(campo.tipo == 'suma' || campo.tipo == 'resta' || campo.tipo == 'multiplicacion' || campo.tipo == 'division'){
        // kardexStore.Formulario.Campo.formulaCampos = kardexStore.Formulario.Campo.opciones?.split('\n')
        // console.log(kardexStore.Formulario.Campo.formulaCampos)
        kardexStore.Formulario.Campo.opciones = ''
    }
    campoModo.value = 'editar'
    kardexStore.showCampo = true
}

function onCampoGuardado() {
    kardexStore.showCampo = false
    kardexStore.cargarCamposDisponibles()
    if (plantillaSeleccionada.value) {
        kardexStore.seleccionarPlantilla(plantillaSeleccionada.value.id)
    }
}
</script>

<template>
    <USlideover v-model:open="isOpen" :ui="{ width: 'w-[480px]' }">
        <UButton
            icon="i-lucide-settings-2"
            color="primary"
            variant="ghost"
            label="Administrar"
        />
        <template #header>
            <div class="flex items-center justify-between w-full">
                <h3 class="font-bold text-lg text-gray-900 dark:text-white">
                    {{ vista === 'lista' ? 'Administrar Plantillas Kardex' : (vista === 'editar' ? 'Editar Plantilla' : 'Nueva Plantilla') }}
                </h3>
                <UButton icon="i-lucide-x" variant="ghost" @click="isOpen = false" />
            </div>
        </template>

        <template #body>
            <!-- Vista: Lista de plantillas -->
            <div v-if="vista === 'lista'" class="flex flex-col gap-4 p-4">
                <div class="flex gap-2">
                    <UButton
                        v-if="puedePost"
                        icon="i-lucide-plus"
                        color="primary"
                        @click="() => {vista = 'crear'; kardexStore.showPlantilla = true}"
                        label="Nueva Plantilla"
                    />
                    <UButton
                        icon="i-lucide-plus-circle"
                        color="secondary"
                        variant="ghost"
                        @click="abrirCrearCampo"
                        label="Nuevo Campo"
                    />
                </div>

                <div v-if="kardexStore.plantillas.length === 0" class="text-center py-8">
                    <i class="fa-solid fa-folder-open text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">No hay plantillas creadas</p>
                </div>

                <div
                    v-for="plantilla in kardexStore.plantillas"
                    :key="plantilla.id"
                    class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="font-medium text-gray-900 dark:text-white">{{ plantilla.nombre }}</h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                {{ plantilla.descripcion || 'Sin descripción' }}
                                <span class="ml-2">
                                    <UBadge
                                        :color="plantilla.estado === 'ACTIVO' ? 'success' : 'neutral'"
                                        variant="soft"
                                        size="xs"
                                    >
                                        {{ plantilla.estado }}
                                    </UBadge>
                                </span>
                            </p>
                        </div>
                        <div class="flex gap-1">
                            <UButton
                                icon="i-lucide-pencil"
                                variant="ghost"
                                size="xs"
                                @click="editarPlantilla(plantilla)"
                            />
                            <UButton
                                icon="i-lucide-trash-2"
                                variant="ghost"
                                color="error"
                                size="xs"
                                @click="eliminarPlantilla(plantilla)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Vista: Crear plantilla -->
            <div v-else-if="vista === 'crear'" class="p-2">
                <UButton
                    icon="i-lucide-arrow-left"
                    variant="ghost"
                    size="xs"
                    @click="vista = 'lista'"
                    label="Volver"
                    class="mb-2"
                />
                <Form :Propiedades="propiedadesCrearPlantilla" @submit="onFormPlantillaGuardado" />
            </div>

            <!-- Vista: Editar plantilla + campos asignados -->
            <div v-else-if="vista === 'editar'" class="flex flex-col gap-4 p-2">
                <UButton
                    icon="i-lucide-arrow-left"
                    variant="ghost"
                    size="xs"
                    @click="vista = 'lista'"
                    label="Volver a plantillas"
                    class="mb-1"
                />
                <UButton
                    icon="i-lucide-pen"
                    variant="ghost"
                    color="warning"
                    size="xs"
                    @click="editar"
                    label="Editar Datos Plantilla"
                    class="mb-1"
                />
                <!-- Formulario de plantilla -->
                <Form :Propiedades="propiedadesEditarPlantilla" @submit="onFormPlantillaGuardado" />

                <!-- Campos asignados -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4 px-2">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="font-semibold text-sm text-gray-700 dark:text-gray-300">Campos Asignados</h4>
                        <div class="flex items-center gap-2">
                            <Transition name="slide-up">
                                <UButton
                                    v-if="ordenModificado"
                                    size="xs"
                                    color="success"
                                    variant="soft"
                                    label="Guardar orden"
                                    :loading="guardandoOrden"
                                    icon="i-lucide-check"
                                    @click="guardarOrden"
                                />
                            </Transition>
                            <UButton
                                size="xs"
                                color="primary"
                                variant="link"
                                label="Asigna campos"
                            />
                        </div>
                    </div>

                    <!-- Selector de campo para asignar -->
                    <div v-if="camposNoAsignados.length > 0" class="mb-3">
                        <USelect
                            v-model="campoSeleccionadoParaAsignar"
                            :items="camposNoAsignados.map(c => ({ label: `${c.titulo} (${c.tipo})`, value: c.id }))"
                            placeholder="Seleccionar campo para asignar"
                        />
                        <UButton
                            v-if="campoSeleccionadoParaAsignar"
                            size="xs"
                            color="success"
                            variant="soft"
                            label="Asignar"
                            class="mt-2"
                            @click="() => {
                                const campo = camposNoAsignados.find(c => c.id === campoSeleccionadoParaAsignar)
                                if (campo) {
                                    asignarCampo(campo)
                                    campoSeleccionadoParaAsignar = null
                                }
                            }"
                        />
                    </div>

                    <!-- Lista de campos asignados -->
                    <div v-if="ordenLocal.length > 0" class="space-y-2">
                        <TransitionGroup name="list" tag="div" class="space-y-2">
                            <div
                                v-for="(campo, index) in ordenLocal"
                                :key="campo.id"
                                draggable="true"
                                @dragstart="onDragStart(index)"
                                @dragover="onDragOver($event, index)"
                                @dragenter="onDragEnter($event, index)"
                                @dragend="onDragEnd"
                                class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <div class="flex items-center gap-2">
                                    <i class="fa-solid fa-grip-vertical text-gray-400 dark:text-gray-500 text-xs cursor-grab"></i>
                                    <span class="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">
                                        #{{ index + 1 }}
                                    </span>
                                    <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ campo.nombre }}</span>
                                    <span class="text-xs text-gray-400">{{ campo.tipo }}</span>
                                    <UBadge v-if="campo.requerido" color="error" variant="soft" size="xs">Req</UBadge>
                                </div>
                                <div class="flex gap-1">
                                    <UButton
                                        icon="i-lucide-pencil"
                                        variant="ghost"
                                        size="xs"
                                        @click="abrirEditarCampo(campo)"
                                    />
                                    <UButton
                                        icon="i-lucide-x"
                                        variant="ghost"
                                        color="error"
                                        size="xs"
                                        @click="removerCampo(campo)"
                                    />
                                </div>
                            </div>
                        </TransitionGroup>
                    </div>
                    <div v-else class="text-center py-6">
                        <p class="text-sm text-gray-400">Esta plantilla no tiene campos asignados</p>
                    </div>
                </div>
            </div>
            <!-- Modal para crear/editar campo -->
            <ModalCampo
                :campo="campoEditando"
                :modo="campoModo"
                @guardado="onCampoGuardado"
            />
        </template>
    </USlideover>

</template>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}
.list-move {
    transition: transform 0.3s ease;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(5px);
}
</style>
