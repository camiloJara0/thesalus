<script setup>
import { computed, onMounted, ref, h, watch, unref } from 'vue'
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue'
import DynamicField from '~/components/atoms/DynamicField/DynamicField.vue'
import ModalAdminPlantilla from './ModalAdminPlantilla.vue'
import { usePaginacion } from '~/composables/Tabla/usePaginacion.js'
import { useKardexStore } from '~/stores/Entidades/Kardex'
import { storeHistorialCambioSonda } from '~/Core/Pacientes/KardexAPI.js'
import { useOrdenamiento } from "~/composables/Tabla/useDatosOrdenadosTabla";
import { traerCeldasPintadas } from '~/Core/CeldasPintadas/GetCeldasPintadas'
import { enviarCeldasPintadas } from '~/Core/CeldasPintadas/PosrCeldasPintadas'

const apiRest = useApiRest()
const varView = useVarView()
const kardexStore = useKardexStore()
const { hasPermiso } = usePermisos()

const puedeVer = hasPermiso('Kardex_view')
const puedeGet = hasPermiso('Kardex_get')
const puedePost = hasPermiso('Kardex_put')
const esAdmin = varView.getRol === 'Admin'
const mostrarFiltros = ref(false)
const camposAfiltrar = ref([])
const mostrarFiltrosAvanzados = ref(false)
const columnasFijas = [
    {
        accessorKey: 'No_document',
        header: 'Documento',
        ordenar: true,
        pinned: true,
        size: 120,
        meta: { class: 'sticky-col col-1' },
        cell: ({ row }) => {
            return h('div', {
                class: 'w-full h-full flex justify-center bg-white dark:bg-slate-900/80',
            }, [
                h('p', {class: 'text-black dark:text-white'}, [row.original.No_document])
            ])
        }
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
    }
]
const campoTotalizado = ref(0)
const nombreCampoTotalizado = ref('')

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

const celdaActiva = ref({ fila: null, columna: null })
const celdasPintadas = ref([])
const colorPicker = ref(null)

const columnasFiltros = computed(() => [
    { columna: 'Eps', placeholder: 'EPS' },
    ...camposAfiltrar.value.map((campo) => {
        const campoEnPlantilla = camposPlantilla.value.find(c => c.nombre === campo)
        return { columna: `_kardexValores.${campoEnPlantilla.id}`, placeholder: campo }
    })
])

const {
    busqueda,
    filtros,
    filtrosConOpciones,
    sortedItems,
    datosOrdenados,
    columnaOrden,
    menorAMayor,
    borrarFiltros,
} = useOrdenamiento(historias, columnasFiltros, [], columnasFijas);

const {
    paginaActual,
    itemsPorPagina,
    totalPaginas,
    ultimaPagina,
    cambiarItemsPorPagina,
    datosPaginados,
} = usePaginacion(datosOrdenados)

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
    await cargarCeldasPintadas()
})

watch(plantillaSeleccionadaId, async (nuevoId) => {
    if (nuevoId) {
        cargandoTabla.value = true
        await kardexStore.seleccionarPlantilla(nuevoId)
        await cargarRegistrosPacientes()
        regenerarColumnas()
        await cargarCeldasPintadas()
        cargandoTabla.value = false
    }
})

async function cargarPacientes() {
    const kardex = await apiRest.getData('', 'traeKardex')
    historias.value = kardex.map(k => ({
        ...k,
        id: k.paciente_id,
        _kardexValores: kardexStore.getRegistros(k.paciente_id)
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

const pintarCelda = (fila, columna, color) => {
    const index = celdasPintadas.value.findIndex(
        c => c.fila === fila && c.columna === columna
    )
    if (index !== -1) {
        celdasPintadas.value[index].color = color
    } else {
        celdasPintadas.value.push({ fila, columna, color })
    }
}

const despintarCelda = (fila, columna) => {
    celdasPintadas.value = celdasPintadas.value.filter(
        c => !(c.fila === fila && c.columna === columna)
    )
}

const obtenerColorCelda = (fila, columna) => {
    const celda = celdasPintadas.value.find(
        c => c.fila === fila && c.columna === columna
    )
    return celda ? celda.color : 'transparent'
}

async function cargarCeldasPintadas() {
    try {
        const datos = await traerCeldasPintadas()
        if (datos) {
            celdasPintadas.value = datos.map(c => ({
                fila: c.fila,
                columna: c.columna,
                color: c.color
            }))
        }
    } catch (e) {
        console.error('Error cargando celdas pintadas:', e)
    }
}

async function guardarCeldasPintadas() {
    try {
        await enviarCeldasPintadas({
            celdasPintadas: unref(celdasPintadas),
            tabla: 'Kardex',
            id_infoUsuario: varView.getUser?.id
        })
        options.tipo = 'success'
        options.background = '#22c55e'
        options.texto = 'Colores guardados correctamente'
        options.tiempo = 2000
        options.position = 'top-right'
        mensaje()
    } catch (e) {
        console.error('Error guardando celdas pintadas:', e)
    }
}

function calcularColumnaTotalizada(celda) {
    campoTotalizado.value = 0
    nombreCampoTotalizado.value = celda.nombre
    datosOrdenados.value.map(d => {
        if (d._kardexValores[celda.id]) {
            campoTotalizado.value += parseInt(d._kardexValores[celda.id])
        }
    })
}

const columnasKardex = computed(() => {
    camposAfiltrar.value = []
    return camposPlantilla.value?.map(campo => ({
        accessorKey: `kardex_${campo.nombre}`,
        header: ({ row }) => {
            if (campo.tipo === 'number') {
                return h(UButton, {
                    color: 'neutral',
                    variant: 'ghost',
                    label: campo.titulo,
                    icon: 'i-lucide-sigma',
                    class: '-mx-2.5',
                    onClick: () => { calcularColumnaTotalizada(campo) }
                })
            } else {
                return campo.titulo
            }
        },
        size: campo.tipo === 'textarea' ? 250 : 150,
        cell: ({ row }) => {
            const pacienteId = row.original.paciente_id
            const valor = getKardexValue(pacienteId, campo.id)
            const registros = computed(() => kardexStore.getRegistros(pacienteId))
            const colorFondo = obtenerColorCelda(pacienteId, campo.titulo)

            return h('div', {
                class: 'w-full h-full rounded-md cursor-pointer transition-colors duration-150',
                style: { backgroundColor: colorFondo },
                onClick: () => { celdaActiva.value = { fila: pacienteId, columna: campo.titulo } }
            }, [
                h(DynamicField, {
                    campo,
                    placeholder: valor || '...',
                    modelValue: valor,
                    variant: 'ghost',
                    registros,
                    'onUpdate:modelValue': (val) => {
                        setKardexValue(pacienteId, campo.id, val)
                        actualizarFila(pacienteId)
                    }
                })
            ])
        }
    })) || []
})

const columns = computed(() => [...columnasFijas, ...columnasKardex.value])

const datosExcel = computed(() => {
    return datosOrdenados.value.map(d => {
        const kardexConTitulos = {}

        camposPlantilla.value.forEach(campo => {
            kardexConTitulos[campo.titulo] =
                d._kardexValores?.[campo.id] ?? '.'
        })

        return {
            Paciente: d.name,
            Documento: d.No_document,
            EPS: d.Eps,
            ...kardexConTitulos
        }
    })
})

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
    const pacienteId = fila.paciente_id
    const valoresNuevos = kardexStore.getRegistros(pacienteId)
    const valoresViejos = copiaKardex.find(paciente => paciente.id === pacienteId)?._kardexValores

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
                id_paciente: fila.paciente_id,
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

const copiado = ref(false)

const campoTotalizadoFormateado = computed(() => {
    const valor = Number(campoTotalizado.value) || 0

    return new Intl.NumberFormat('es-CO', {
        maximumFractionDigits: 0
    }).format(valor)
})

const copiarTotal = async () => {
    try {
        await navigator.clipboard.writeText(
            String(campoTotalizado.value)
        )

        copiado.value = true

        setTimeout(() => {
            copiado.value = false
        }, 1500)
    } catch (error) {
        console.error('No se pudo copiar el total:', error)
    }
}
</script>

<template>
    <UCard v-if="puedeVer" :ui="{ body: { padding: 'p-6' }, header: { padding: 'p-6' } }"
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
                    <USelect v-model="plantillaSeleccionadaId" :items="plantillasOptions"
                        placeholder="Seleccionar plantilla" class="w-52" />
                    <UButton icon="i-lucide-filter" color="neutral" variant="outline"
                        @click="mostrarFiltros = !mostrarFiltros">
                        <p class="hidden md:block">Filtrar</p>
                    </UButton>
                    <ModalAdminPlantilla v-if="esAdmin" @guardado="onPlantillaGuardada">
                    </ModalAdminPlantilla>
                    <download-excel :data="datosExcel" name="kardex" type="xlsx">
                        <ButtonRounded tooltip="Formato Excel" color="w-fit">
                            <UButton icon="i-lucide-file-chart-column" color="primary" variant="ghost">
                                Descargar
                            </UButton>
                        </ButtonRounded>
                    </download-excel>
                </div>
            </div>
            <div v-if="mostrarFiltros" class="w-full">
                <div class="w-full py-4">
                    <USeparator></USeparator>
                </div>
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-filter text-gray-400"></i>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Filtros de la tabla
                            <span v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
                                class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                Filtros activos
                            </span>
                        </p>
                    </div>

                    <div class="flex gap-2">
                        <ButtonRounded
                            v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
                            color="dark:text-gray-200 dark:bg-red-600 text-gray-700 bg-red-400"
                            tooltip="Limpiar filtros" tooltipPosition="top" @click="borrarFiltros">
                            <i class="fa-solid fa-xmark"></i>
                        </ButtonRounded>
                        <UModal v-model:open="mostrarFiltrosAvanzados">
                            <ButtonRounded
                                :color="mostrarFiltrosAvanzados ? 'bg-blue-800 dark:bg-blue-700' : 'bg-gray-800 text-gray-700 dark:bg-gray-700 dark:text-gray-200'"
                                tooltip="Filtros Avanzados">
                                <i class="fa-solid fa-sliders"></i>
                            </ButtonRounded>
                            <template #content>
                                <div class="p-6">

                                    <!-- Header -->
                                    <div class="flex items-start gap-4 mb-6">
                                        <div class="flex items-center justify-center shrink-0
                                                w-12 h-12 rounded-xl
                                                bg-blue-100 text-blue-600
                                                dark:bg-blue-900/40 dark:text-blue-400">
                                            <i class="fa-solid fa-filter text-lg"></i>
                                        </div>

                                        <div class="flex-1">
                                            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                                                Configurar filtros
                                            </h2>

                                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                Selecciona los campos que quieres utilizar para filtrar
                                                la información de la tabla.
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Selector -->
                                    <div class="space-y-2">
                                        <div class="flex items-center justify-between">
                                            <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                Campos disponibles
                                            </label>

                                            <span v-if="camposAfiltrar.length" class="text-xs font-medium px-2.5 py-1 rounded-full
                               bg-blue-100 text-blue-700
                               dark:bg-blue-900/40 dark:text-blue-300">
                                                {{ camposAfiltrar.length }}
                                                {{ camposAfiltrar.length === 1 ? 'seleccionado' : 'seleccionados' }}
                                            </span>
                                        </div>

                                        <USelect v-model="camposAfiltrar" :items="camposPlantilla" multiple
                                            label-key="titulo" value-key="nombre"
                                            placeholder="Selecciona los campos a filtrar" class="w-full" size="lg" />
                                    </div>

                                    <!-- Empty state -->
                                    <div v-if="!camposAfiltrar.length" class="mt-4 flex items-center gap-3
                       text-sm text-gray-500 dark:text-gray-400">
                                        <i class="fa-solid fa-lightbulb text-yellow-500"></i>

                                        <span>
                                            Selecciona al menos un campo para comenzar a filtrar.
                                        </span>
                                    </div>

                                    <!-- Footer -->
                                    <div class="flex items-center justify-between
                       mt-6 pt-4 border-t
                       border-gray-200 dark:border-gray-800">
                                        <span class="text-xs text-gray-400">
                                            Los cambios se aplican automáticamente
                                        </span>

                                        <UButton color="primary" variant="soft"
                                            @click="mostrarFiltrosAvanzados = false">
                                            <i class="fa-solid fa-check mr-1.5"></i>
                                            Listo
                                        </UButton>
                                    </div>

                                </div>
                            </template>
                        </UModal>
                    </div>
                </div>

                <div class="flex flex-wrap items-end justify-between gap-3"">
                    <UInput v-model="busqueda" placeholder="Buscar Documento o Nombre..." icon="lucide-search"
                    variant="outline" size="lg" class="md:w-90 w-full" />

                <div class="md:flex flex-wrap justify-end gap-3 w-full md:w-fit grid grid-cols-2">
                    <USelect v-for="(filtro, key) in filtrosConOpciones.slice(0, 3)" :key="key"
                        v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                        :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="md:w-45 w-full"
                        @change="async () => { filtro.accion?.(filtros) }" />
                </div>
            </div>
            <div v-if="filtrosConOpciones.length > 3"
                class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-end">
                <USelect v-for="(filtro, key) in filtrosConOpciones.slice(3)" :key="key"
                    v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                    :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="w-full"
                    @change="async () => { filtro.accion?.(filtros) }" />
            </div>
            </div>
        </template>

        <div v-if="historias.length > 0 && columns.length > 0" class="space-y-4">
            <UTable :columns="columns" :data="datosPaginados" sticky v-model:column-pinning="columnPinning"
                :row-class="(row) => filaFueCambiada(row.paciente_id) ? 'bg-yellow-100' : ''"
                class="flex-1 max-h-[62vh]" />
            <!-- Totalización -->
            <div v-if="campoTotalizado > 0" class="
            flex flex-col sm:flex-row
            items-start sm:items-center
            justify-end
            gap-3
            px-4 py-3
            rounded-xl
            border border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800/60
        ">
                <!-- Información -->
                <div class="flex items-center gap-3">
                    <div class="
                    flex items-center justify-center
                    w-9 h-9
                    rounded-lg
                    bg-blue-100 dark:bg-blue-900/30
                    text-blue-600 dark:text-blue-400
                ">
                        <i class="fa-solid fa-calculator"></i>
                    </div>

                    <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Total
                        </p>

                        <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {{ nombreCampoTotalizado }} :
                        </p>
                    </div>
                </div>

                <!-- Valor -->
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <UInput :model-value="campoTotalizadoFormateado" readonly class="w-full sm:w-48" :ui="{
                        base: 'text-right font-semibold tabular-nums cursor-pointer'
                    }" @click="copiarTotal">
                        <template #trailing>
                            <button type="button" class="
                            text-gray-400
                            hover:text-blue-600
                            dark:hover:text-blue-400
                            transition-colors
                        " title="Copiar total" @click.stop="copiarTotal">
                                <i :class="[
                                    'fa-solid',
                                    copiado
                                        ? 'fa-check text-green-500'
                                        : 'fa-copy'
                                ]"></i>
                            </button>
                        </template>
                    </UInput>
                </div>

                <UButton icon="i-lucide-x" @click="campoTotalizado = 0" variant="soft"></UButton>
            </div>
        </div>

        <div v-if="historias.length > 0 && columns.length <= 3" class="text-center py-8">
            <i class="fa-solid fa-table-cells-large text-4xl text-gray-300 mb-3"></i>
            <p class="text-gray-500 dark:text-gray-400 mb-1 font-medium">Sin campos configurados</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">
                Selecciona una plantilla o configura los campos desde el botón de administrar
            </p>
        </div>

        <div v-if="datosOrdenados.length > 0" class="flex justify-between mt-3">
            <UPagination v-model:page="paginaActual" active-color="primary" active-variant="subtle" :sibling-count="1"
                :total="datosOrdenados.length" :items-per-page="itemsPorPagina" />
            <p class="text-sm text-gray-500 md:flex gap-1 hidden items-center">
                Mostrando
                <span class="text-gray-500">{{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</span>
                <span class="text-gray-500">de {{ datosOrdenados.length }}</span>
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
                <span class="text-sm font-semibold">
                    Tienes cambios sin guardar en Kardex
                </span>
                <ButtonRounded @click="guardarCambios">
                    <i class="fa-solid fa-floppy-disk"></i>
                </ButtonRounded>
            </div>
        </Transition>

        <Transition name="slide-up">
            <div v-if="celdaActiva.fila !== null && celdaActiva.columna !== null && !actualizarCambios"
                class="fixed bottom-23  left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Color:</label>
                <input v-model="colorPicker" type="color"
                    class="w-6 h-6 cursor-pointer rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform duration-200">
                <ButtonRounded v-if="colorPicker" tooltip="Pintar celda"
                    @click="pintarCelda(celdaActiva.fila, celdaActiva.columna, colorPicker)">
                    <i class="fa-solid fa-paintbrush text-xs"></i>
                </ButtonRounded>
                <ButtonRounded tooltip="Borrar Color" @click="despintarCelda(celdaActiva.fila, celdaActiva.columna)">
                    <i class="fa-solid fa-trash text-xs"></i>
                </ButtonRounded>
                <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
                <ButtonRounded tooltip="Guardar colores" @click="guardarCeldasPintadas">
                    <i class="fa-solid fa-floppy-disk text-xs"></i>
                </ButtonRounded>
                <ButtonRounded tooltip="Cerrar" @click="celdaActiva = { fila: null, columna: null }">
                    <i class="fa-solid fa-xmark text-xs"></i>
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
