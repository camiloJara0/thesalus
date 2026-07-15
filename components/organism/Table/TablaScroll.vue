<script setup>
import ButtonRounded from "~/components/atoms/Buttons/ButtonRounded.vue";
import DatosExcel from '~/components/organism/Forms/DatosExcel.vue';
import { ref, h } from "vue";
import { useInfiniteScroll } from '@vueuse/core'

import { useOrdenamiento } from "~/composables/Tabla/useDatosOrdenadosTabla";

const mostrarFiltros = ref(false)
const mostrarFiltrosAvanzados = ref(false)
const varView = useVarView()
const excelRef = ref(null)

const props = defineProps({
    Propiedades: {
        type: [Object, Array],
        requiered: true,
        default: {}
    }
});

const dataScrollCache = ref([]);
const data = ref([]);
// Acomodar datos de menor a mayor segun columna, filtros
const {
    busqueda,
    filtros,
    filtrosConOpciones,
    sortedItems,
    datosOrdenados,
    columnaOrden,
    menorAMayor,
    borrarFiltros
} = useOrdenamiento(data || ref([]), props.Propiedades.filtros || [], props.Propiedades.noFiltrar || []);

const isFiltrando = computed(() => {
    const busquedaActiva = busqueda.value?.trim() !== ''
    const filtrosActivos = Object.values(filtros.value).some(v => v && v !== '' && v !== 'all')
    const ordenActivo = columnaOrden.value !== ''
    return busquedaActiva || filtrosActivos || ordenActivo
})

watch(isFiltrando, (activando, desactivando) => {
    if (desactivando && !activando) {
        data.value = [...dataScrollCache.value]
        loading.value = false
        hayMasDatos.value = dataScrollCache.value.length > 0
    }
})

const items = ref([
    {
        label: 'Descargar',
        icon: 'i-lucide-file',
        onSelect: () => {
            // Dispara el click directamente sobre el enlace generado
            excelRef.value?.$el.click()

        }
    },
    {
        label: 'Configurar',
        icon: 'i-lucide-settings',
        onSelect: () => {
            varView.showDatosExcel = true
        }
    }
])

const columns = props.Propiedades.columns.map(col => {
    if (col.sorted) {
        return {
            ...col,
            header: ({ column }) =>
                h(UButton, {
                    color: "neutral",
                    variant: "ghost",
                    label: col.header || col.accessorKey,
                    icon: "i-lucide-arrow-up-down",
                    class: "-mx-2.5",
                    onClick: () => sortedItems(col.accessorKey)
                })
        }
    }
    return col
})

watch(
    () => props.Propiedades.data,
    (nuevosDatos) => {
        if (!nuevosDatos?.length) return

        if (isFiltrando.value) {
            data.value = [...nuevosDatos]
        } else {
            const idsExistentes = new Set(
                dataScrollCache.value.map(item => String(item.id))
            )
            const datosNuevos = nuevosDatos.filter(
                item => !idsExistentes.has(String(item.id))
            )
            if (datosNuevos.length) {
                datosNuevos.sort((a, b) => b.id - a.id)
                dataScrollCache.value.push(...datosNuevos)
                data.value = [...dataScrollCache.value]
            }
        }
    },
    { deep: true }
)

const porPagina = computed(
    () => props.Propiedades.porPagina || 20
)

const table = useTemplateRef('table')
const loading = ref(false)
const hayMasDatos = ref(true)

const cargarDatos = async () => {
    if (loading.value || !hayMasDatos.value || isFiltrando.value) return

    loading.value = true

    try {
        const ultimoId =
            dataScrollCache.value.length
                ? dataScrollCache.value[dataScrollCache.value.length - 1].id
                : 0

        let respuesta = []
        if (varView.isOnline) {
            respuesta = await props.Propiedades.cargarData(
                ultimoId,
                porPagina.value
            )
        } else {
            respuesta = props.Propiedades.data.value
        }

        if (!respuesta?.length) {
            hayMasDatos.value = false
            return
        }

        const idsExistentes = new Set(
            dataScrollCache.value.map(item => String(item.id))
        )

        const datosNuevos = respuesta.filter(
            item => !idsExistentes.has(String(item.id))
        )

        datosNuevos.sort((a, b) => b.id - a.id)
        dataScrollCache.value.push(...datosNuevos)
        if (!isFiltrando.value) {
            data.value = [...dataScrollCache.value]
        }

    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await cargarDatos()

    useInfiniteScroll(
        table.value?.$el,
        () => {
            cargarDatos()
        },
        {
            distance: 200,
            canLoadMore: () =>
                !loading.value && hayMasDatos.value && !isFiltrando.value
        }
    )


})

const cardConfig = computed(() => props.Propiedades.card || null)

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function columnHeader(accessorKey) {
    const col = props.Propiedades.columns.find(c => c.accessorKey === accessorKey)
    return col?.header || accessorKey
}

const expandedCards = ref(new Set())

function toggleCardExpand(rowId) {
    if (expandedCards.value.has(rowId)) {
        expandedCards.value.delete(rowId)
    } else {
        expandedCards.value.add(rowId)
    }
}

function isCardExpanded(rowId) {
    return expandedCards.value.has(rowId)
}

const CARD_BODY_MAX_LENGTH = 60

function needsExpand(row, fields) {
    if (!cardConfig.value || !fields?.length) return false
    return fields.some(f => {
        const val = String(getNestedValue(row, f) ?? '')
        return val.length > CARD_BODY_MAX_LENGTH
    })
}

function getRowActions(row) {
    if (!props.Propiedades.rowActions) return []
    return props.Propiedades.rowActions(row)
}

const loadMoreTrigger = ref()
const cardsContainer = ref()

let observer = null

const loadingMore = ref(false)
const hasMoreData = ref(true)

onMounted(() => {
    observer = new IntersectionObserver(
        async ([entry]) => {
            if (entry.isIntersecting) {
                await cargarDatos()
            }
        },
        {
            root: cardsContainer.value,
            threshold: 0.1
        }
    )

    if (loadMoreTrigger.value) {
        observer.observe(loadMoreTrigger.value)
    }
})

onBeforeUnmount(() => {
    observer?.disconnect()
})
</script>

<template>
    <!-- Titulo, Acciones y Filtros -->
    <UCard class="mb-3 bg-white dark:bg-gray-800">
        <template #header>
            <div class="flex justify-between items-center">
                <h3 class="font-bold text-lg w-1/2">{{ props.Propiedades.titulo }}</h3>
                <div class="flex flex-wrap justify-end gap-2 w-1/2">
                    <UButton v-for="button in props.Propiedades.buttons" :variant="button.variant" :color="button.color"
                        loading-auto :trailing-icon="button.icon" size="md" @click="button.accion">
                        <span class="hidden md:block">{{ button.texto }}</span>
                    </UButton>

                    <client-only v-if="Propiedades.excel">
                        <UDropdownMenu :items="items">
                            <UButton label="Open" variant="subtle" color="secondary" trailing-icon="lucide-table"
                                size="md">
                                <span class="hidden md:block">Exportar</span>
                            </UButton>
                        </UDropdownMenu>

                        <div>
                            <!-- Dropdown con tus items -->
                            <download-excel ref="excelRef"
                                :data="Array.isArray(datosOrdenados) ? datosOrdenados : props.Propiedades.data"
                                :name="props.Propiedades.titulo" type="xlsx" style="display: none;">
                                .
                            </download-excel>
                        </div>

                    </client-only>

                    <UButton @click="() => { mostrarFiltros = !mostrarFiltros }" variant="solid" color="primary"
                        trailing-icon="lucide-list-filter" size="md">
                        <span class="hidden md:block">Filtrar</span>
                    </UButton>
                    <UButton v-if="props.Propiedades.agregar" @click="props.Propiedades.agregar" variant="solid"
                        color="primary" trailing-icon="lucide-plus" size="md">
                        <span class="hidden md:block">Agregar</span>
                    </UButton>
                    <UButton v-if="props.Propiedades.llamadatos" icon="i-lucide-cloud-sync" color="primary"
                        variant="ghost" size="md" @click="props.Propiedades.llamadatos?.(true)" />
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
                        <ButtonRounded v-if="filtrosConOpciones.length > 3"
                            @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
                            :color="mostrarFiltrosAvanzados ? 'bg-blue-800 dark:bg-blue-700' : 'bg-gray-800 text-gray-700 dark:bg-gray-700 dark:text-gray-200'"
                            tooltip="Filtros Avanzados">
                            <i class="fa-solid fa-sliders"></i>
                        </ButtonRounded>
                        <ButtonRounded
                            v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
                            color="dark:text-gray-200 dark:bg-red-600 text-gray-700 bg-red-400"
                            tooltip="Limpiar filtros" tooltipPosition="top" @click="borrarFiltros">
                            <i class="fa-solid fa-xmark"></i>
                        </ButtonRounded>
                    </div>
                </div>

                <div class="flex flex-wrap items-end justify-between gap-3"">
                    <UInput v-model="busqueda" placeholder="Buscar dato en la Tabla..." icon="lucide-search"
                    variant="outline" size="lg" class="md:w-90 w-full" />

                <div class="md:flex flex-wrap justify-end gap-3 w-full md:w-fit grid grid-cols-2">
                    <USelect v-for="(filtro, key) in filtrosConOpciones.slice(0, 3)" :key="key"
                        v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                        :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="md:w-45 w-full"
                        @change="async () => { filtro.accion?.(filtros) }" />
                </div>
            </div>
            <div v-if="mostrarFiltrosAvanzados"
                class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-end">
                <USelect v-for="(filtro, key) in filtrosConOpciones.slice(3)" :key="key"
                    v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                    :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="w-full"
                    @change="async () => { filtro.accion?.(filtros) }" />
            </div>
            </div>
        </template>
    </UCard>
    <!-- Tabla -->
    <div class="md:block" :class="{ 'hidden': cardConfig, }">
        <UTable ref="table" sticky :loading="loading" loading-color="primary" loading-animation="carousel"
            :data="datosOrdenados" :columns="columns" class="flex-1 max-h-[62vh]" />
    </div>

    <!-- Cards Mobile (solo si card esta definido) -->
    <div v-if="cardConfig" ref="cards" class="md:hidden block space-y-3 overflow-y-auto max-h-[62vh]">
        <UCard v-for="row in datosOrdenados" :key="row.id || row.id_analisis"
            :ui="{ body: { padding: 'px-4 py-3' }, header: { padding: 'px-4 py-3' }, footer: { padding: 'px-4 py-2' } }">
            <template #header>
                <div class="flex justify-between items-start">
                    <div class="flex-1 min-w-0">
                        <p v-for="(field, i) in cardConfig.header" :key="field"
                            :class="[i === 0 ? 'font-bold text-base truncate' : 'text-xs text-gray-500 dark:text-gray-400']">
                            {{ getNestedValue(row, field) || '—' }}
                        </p>
                    </div>
                    <div v-if="cardConfig.headerBadge" class="ml-2 shrink-0">
                        <UBadge variant="subtle"
                            :color="getNestedValue(row, cardConfig.headerBadge.field) === cardConfig.headerBadge.activeValue ? 'success' : 'neutral'">
                            {{ getNestedValue(row, cardConfig.headerBadge.field) === cardConfig.headerBadge.activeValue
                                ? cardConfig.headerBadge.activeLabel : cardConfig.headerBadge.inactiveLabel }}
                        </UBadge>
                    </div>
                </div>
            </template>

            <div class="space-y-2">
                <template v-for="(field, idx) in cardConfig.body" :key="field">
                    <div v-if="idx < 3 || isCardExpanded(row.id || row.id_analisis)"
                        class="flex justify-between items-center gap-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400 shrink-0">{{ columnHeader(field) }}</span>
                        <span class="text-sm text-right truncate">{{ getNestedValue(row, field) || '—' }}</span>
                    </div>
                </template>
                <button v-if="needsExpand(row, cardConfig.body)" @click="toggleCardExpand(row.id || row.id_analisis)"
                    class="text-xs text-(--color-default) font-medium hover:underline w-full text-center mt-1">
                    {{ isCardExpanded(row.id || row.id_analisis) ? 'Ver menos' : 'Ver más' }}
                </button>
            </div>

            <template #footer v-if="Propiedades.rowActions">
                <div class="flex justify-end">
                    <UDropdownMenu :items="getRowActions(row)">
                        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
                    </UDropdownMenu>
                </div>
            </template>


        </UCard>

        <!-- Sentinel -->

        <div v-if="hasMoreData" ref="loadMoreTrigger" class="h-10 flex items-center justify-center">
            <UIcon v-if="loadingMore" name="i-lucide-loader-circle" class="animate-spin" />
        </div>
    </div>

    <DatosExcel v-if="varView.showDatosExcel" :datos="datosOrdenados" :tabla="props.Propiedades.titulo" />
</template>
