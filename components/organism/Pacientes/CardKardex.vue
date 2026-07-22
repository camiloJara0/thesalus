<script setup>
import { computed, onMounted, ref, h, watch } from 'vue'
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue'
import DynamicField from '~/components/atoms/DynamicField/DynamicField.vue'
import ModalAdminPlantilla from './ModalAdminPlantilla.vue'
import { usePaginacion } from '~/composables/Tabla/usePaginacion.js'
import { useKardexStore } from '~/stores/Entidades/Kardex'
import { storeHistorialCambioSonda } from '~/Core/Pacientes/KardexAPI.js'

const apiRest = useApiRest()
const varView = useVarView()
const kardexStore = useKardexStore()
const { hasPermiso } = usePermisos()

const puedeVer = hasPermiso('Kardex_view')
const puedeGet = hasPermiso('Kardex_get')
const puedePost = hasPermiso('Kardex_put')
const esAdmin = varView.getRol === 'Admin'

const {
    options,
    mensaje,
    alertRespuestaInput
} = useNotificacionesStore()

const historias = ref([])
let copiaKardex = []
const filasCambiadas = ref(new Set())
const actualizarCambios = ref(false)
const plantillaSeleccionadaId = ref(null)
const showAdminPlantilla = ref(false)
const cargandoTabla = ref(false)

const {
    paginaActual,
    itemsPorPagina,
    totalPaginas,
    ultimaPagina,
    cambiarItemsPorPagina,
    datosPaginados,
} = usePaginacion(historias)

const plantillasOptions = computed(() =>
    kardexStore.plantillas
        .filter(p => p.estado !== 'INACTIVO')
        .map(p => ({ label: p.nombre, value: p.id }))
)

const camposPlantilla = computed(() => kardexStore.camposPlantilla)

onMounted(async () => {
    await kardexStore.cargarPlantillas()

    if (plantillasOptions.value.length > 0) {
        const primera = plantillasOptions.value[0]
        plantillaSeleccionadaId.value = primera.value
        await kardexStore.seleccionarPlantilla(primera.value)
    }

    await cargarPacientes()
})

watch(plantillaSeleccionadaId, async (nuevoId) => {
    if (nuevoId) {
        cargandoTabla.value = true
        await kardexStore.seleccionarPlantilla(nuevoId)
        await cargarRegistrosPacientes()
        regenerarColumnas()
        cargandoTabla.value = false
    }
})

async function cargarPacientes() {
    const kardex = await apiRest.getData('', 'traeKardex')
    historias.value = kardex.map(k => ({
        ...k,
        id: k.paciente_id,
        _kardexValores: kardexStore.getRegistros(k.id_paciente)
    }))
    copiaKardex = JSON.parse(JSON.stringify(historias.value))

}

async function cargarRegistrosPacientes() {
    if (!historias.value.length) return
    // await kardexStore.cargarTodosLosRegistros(plantillaSeleccionadaId.value)

    historias.value.forEach(paciente => {
        paciente._kardexValores = kardexStore.getRegistros(paciente.id)
    })
}

function getKardexValue(pacienteId, campoId) {
    const registros = kardexStore.getRegistros(pacienteId)
    return registros[campoId] || ''
}

function setKardexValue(pacienteId, campoId, valor) {
    if (!kardexStore.todosLosRegistros[pacienteId]) {
        kardexStore.todosLosRegistros[pacienteId] = {}
    }
    kardexStore.todosLosRegistros[pacienteId][campoId] = valor
    const fila = historias.value.find(h => h.paciente_id === pacienteId)
    if (fila) {
        fila._kardexValores = { ...fila._kardexValores, [campoId]: valor }
    }
}

function actualizarFila(id) {
    actualizarCambios.value = true
    filasCambiadas.value.add(id)
}

function filaFueCambiada(id) {
    return filasCambiadas.value.has(id)
}

const columnasFijas = [
    {
        accessorKey: 'No_document',
        header: 'Documento',
        ordenar: true,
        pinned: true,
        size: 120,
        meta: { class: 'sticky-col col-1' }
    },
    {
        accessorKey: 'name',
        header: 'Nombre',
        ordenar: true,
        pinned: true,
        size: 200,
        meta: { class: 'sticky-col col-2' }
    },
    {
        accessorKey: 'Eps',
        header: 'EPS',
        ordenar: true,
        pinned: true,
        size: 200,
        meta: { class: 'sticky-col col-3' }
    },
]

const columnasKardex = computed(() => {
    return camposPlantilla.value?.map(campo => ({
        accessorKey: `kardex_${campo.nombre}`,
        header: campo.titulo,
        size: campo.tipo === 'textarea' ? 250 : 150,
        cell: ({ row }) => {
            const pacienteId = row.original.paciente_id
            const valor = getKardexValue(pacienteId, campo.id)
            return h(DynamicField, {
                campo,
                placeholder: valor || '...',
                modelValue: valor,
                variant: 'ghost',
                'onUpdate:modelValue': (val) => {
                    setKardexValue(pacienteId, campo.id, val)
                    actualizarFila(pacienteId)
                }
            })
        }
    })) || []
})

const columns = computed(() => [...columnasFijas, ...columnasKardex.value])

function regenerarColumnas() {
    filasCambiadas.value.clear()
    actualizarCambios.value = false
}

async function guardarCambios() {
    const datosActualizados = historias.value.filter(dato =>
        filasCambiadas.value.has(dato.paciente_id)
    )

    for (const fila of datosActualizados) {
        await guardar(fila)
    }

    filasCambiadas.value.clear()
    actualizarCambios.value = false
}

async function guardar(fila) {
    const pacienteId = fila.id_paciente
    const valoresNuevos = kardexStore.getRegistros(pacienteId)
    const valoresViejos = copiaKardex.find(paciente => paciente.id === pacienteId)._kardexValores

    if (plantillaActivaTieneSonida()) {
        const cambioSonda = valoresNuevos[9] !== valoresViejos[9]
        if (valoresNuevos[9] && cambioSonda) {
            options.icono = 'warning'
            options.titulo = 'Agrega detalles del cambio de sonda'
            options.html = '<div class="flex flex-col items-start">'
            options.input = 'text'
            options.inputAtributes = { placeholder: 'Observaciones de cambio de sonda' }
            options.confirmtext = 'Si, Guardar'
            options.canceltext = 'Atras'

            const respuesta = await alertRespuestaInput()

            if (respuesta.estado !== 'confirmado') return

            if (!respuesta.valor) {
                options.position = 'top-end'
                options.texto = 'Ingrese una observación de cambio de sonda.'
                options.background = '#d33'
                options.tiempo = 1500
                mensaje()
                return
            }

            const data = {
                id_paciente: fila.id_paciente,
                ultimoCambio: valoresNuevos[9],
                tipo_sonda: 'Sonda',
                observacion: respuesta.valor
            }
            await storeHistorialCambioSonda(data)
        }
    }

    try {
        await kardexStore.guardarRegistrosPaciente(pacienteId, valoresNuevos)
        options.tipo = 'success'
        options.background = '#22c55e'
        options.texto = 'Kardex actualizado correctamente'
        options.tiempo = 3000
        options.position = 'top-right'
        mensaje()
    } catch (error) {
        options.tipo = 'error'
        options.background = '#d33'
        options.texto = 'No se pudo actualizar Kardex'
        options.tiempo = 3000
        options.position = 'top-right'
        mensaje()
    }
}

function plantillaActivaTieneSonida() {
    return camposPlantilla.value.some(c => c.nombre === 'ultimo_cambio' || c.nombre === 'kit_cambioSonda')
}

async function onPlantillaGuardada() {
    await kardexStore.cargarPlantillas()
    showAdminPlantilla.value = false
}

const columnPinning = ref({
    left: ['No_document'],
})
</script>

<template>
    <UCard v-if="puedeVer"
        :ui="{ body: { padding: 'p-6' }, header: { padding: 'p-6' } }"
        class="bg-white dark:bg-gray-800">
        <template #header>
            <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                    <div
                        class="w-12 h-12 rounded-lg bg-linear-to-br from-amber-100 to-amber-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                        <i class="fa-solid fa-file-medical text-amber-600 dark:text-amber-400 text-xl"></i>
                    </div>
                    <div>
                        <h3 class="font-bold md:text-lg text-sm text-gray-900 dark:text-white">Kardex Médico</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ historias.length }} registros</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <USelect
                        v-model="plantillaSeleccionadaId"
                        :items="plantillasOptions"
                        placeholder="Seleccionar plantilla"
                        class="w-52"
                    />
                    <ModalAdminPlantilla
                        v-if="esAdmin"
                        @guardado="onPlantillaGuardada"
                    >
                    </ModalAdminPlantilla>
                    <download-excel :data="historias" name="kardex" type="xlsx">
                        <UButton icon="i-lucide-file-chart-column" color="primary" variant="ghost">
                            Descargar
                        </UButton>
                    </download-excel>
                </div>
            </div>
        </template>

        <div v-if="historias.length > 0 && columns.length > 0" class="space-y-4">
            <UTable
                :columns="columns"
                :data="datosPaginados"
                sticky
                v-model:column-pinning="columnPinning"
                :row-class="(row) => filaFueCambiada(row.paciente_id) ? 'bg-yellow-100' : ''"
                class="flex-1 max-h-[62vh]"
            />
        </div>

        <div v-if="historias.length > 0 && columns.length <= 3" class="text-center py-8">
            <i class="fa-solid fa-table-cells-large text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500 dark:text-gray-400 mb-1 font-medium">Sin campos configurados</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
                Selecciona una plantilla o configura los campos desde el botón de administrar
            </p>
        </div>

        <div v-if="historias.length > 0" class="flex justify-between mt-3">
            <UPagination
                v-model:page="paginaActual"
                active-color="primary"
                active-variant="subtle"
                :sibling-count="1"
                :total="historias.length"
                :items-per-page="itemsPorPagina"
            />
            <p class="text-sm text-gray-500 md:flex gap-1 hidden items-center">
                Mostrando
                <span class="text-gray-500">{{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</span>
                <span class="text-gray-500">de {{ historias.length }}</span>
                <select name="numRegistros"
                    class="ml-3 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    @change="cambiarItemsPorPagina($event.target.value)">
                    <option value="10" selected>10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </p>
        </div>

        <Transition name="slide-up">
            <div v-if="actualizarCambios && puedePost"
                class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-xl shadow-xl bg-yellow-400">
                <span class="text-sm font-medium">
                    Tienes cambios sin guardar en Kardex
                </span>
                <ButtonRounded @click="guardarCambios">
                    <i class="fa-solid fa-floppy-disk"></i>
                </ButtonRounded>
            </div>
        </Transition>

        <div v-if="historias.length < 1" class="text-center py-12">
            <i class="fa-solid fa-clipboard text-5xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 dark:text-gray-400 mb-2 font-medium">Kardex</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">Pacientes sin registros médicos aún</p>
        </div>
    </UCard>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translate(-50%, 20px);
}
</style>
