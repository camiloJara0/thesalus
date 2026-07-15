<script setup>
import ButtonRounded from "~/components/atoms/Buttons/ButtonRounded.vue";
import DatosExcel from '~/components/organism/Forms/DatosExcel.vue';
import { ref, h } from "vue";


import { useOrdenamiento } from "~/composables/Tabla/useDatosOrdenadosTabla";
import { usePaginacion } from "~/composables/Tabla/usePaginacion";

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

const data = ref(props.Propiedades.data);
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
} = useOrdenamiento(data || ref([]), props.Propiedades.filtros || [], props.Propiedades.noFiltrar || [], props.Propiedades.columns || []);


// Paginador
const {
    paginaActual,
    itemsPorPagina,
    totalPaginas,
    ultimaPagina,
    cambiarItemsPorPagina,
    siguientePagina,
    paginaAnterior,
    irAPagina,
    datosPaginados,
} = usePaginacion(datosOrdenados);

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

const columnPinning = ref(props.Propiedades.columnPinning)

watch(
  () => [paginaActual.value, itemsPorPagina.value],
  async () => {
      if (props.Propiedades.fetchData) {
      const result = await props.Propiedades.fetchData(datosPaginados.value, itemsPorPagina.value)

    //   data.value = result.data
    //   totalItems.value = result.total
    }
  },
  { immediate: true }
)

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

                    <UButton @click="() => { mostrarFiltros = !mostrarFiltros }" :variant="mostrarFiltros ? 'soft' : 'solid'" color="primary"
                        trailing-icon="lucide-list-filter" size="md">
                        <span class="hidden md:block">Filtrar</span>
                    </UButton>
                    <UButton v-if="props.Propiedades.agregar" @click="props.Propiedades.agregar" variant="solid"
                        color="primary" trailing-icon="lucide-plus" size="md">
                        <span class="hidden md:block">Agregar</span>
                    </UButton>
                    <UButton v-if="props.Propiedades.llamadatos" icon="i-lucide-cloud-sync" color="primary" variant="ghost" size="md" @click="props.Propiedades.llamadatos?.(true)" />
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
                        :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="md:w-45 w-full" @change="async() => {filtro.accion?.(filtros)}" />
                </div>
            </div>
            <div v-if="mostrarFiltrosAvanzados"
                class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-end">
                <USelect v-for="(filtro, key) in filtrosConOpciones.slice(3)" :key="key"
                    v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                    :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="w-full" @change="async() => {filtro.accion?.(filtros)}" />
            </div>
            </div>
        </template>
    </UCard>
    <!-- Tabla Desktop -->
    <div class="hidden md:block">
        <UTable v-model:column-pinning="columnPinning" sticky :loading="!props.Propiedades.data || varView.cargando || varView.actualizando" loading-color="primary" loading-animation="carousel" :data="datosPaginados" :columns="columns"
            class="flex-1 max-h-[62vh]" />
    </div>
    <!-- Cards Mobile (solo si card esta definido) -->
    <div v-if="cardConfig" class="md:hidden block space-y-3">
        <UCard v-for="row in datosPaginados" :key="row.id || row.id_analisis" :ui="{ body: { padding: 'px-4 py-3' }, header: { padding: 'px-4 py-3' }, footer: { padding: 'px-4 py-2' } }">
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
                            {{ getNestedValue(row, cardConfig.headerBadge.field) === cardConfig.headerBadge.activeValue ? cardConfig.headerBadge.activeLabel : cardConfig.headerBadge.inactiveLabel }}
                        </UBadge>
                    </div>
                    <div v-else class="w-5 h-5 rounded-full flex justify-center items-center">
                        <UIcon :name="cardConfig.icon ? cardConfig.icon : 'i-lucide-file'"></UIcon>
                    </div>
                </div>
            </template>

            <div v-if="cardConfig.body?.length" class="space-y-2">
                <template v-for="(field, idx) in cardConfig.body" :key="field">
                    <div v-if="idx < 3 || isCardExpanded(row.id || row.id_analisis)"
                        class="flex justify-between items-center gap-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400 shrink-0">{{ columnHeader(field) }}</span>
                        <span class="text-sm text-right truncate">{{ getNestedValue(row, field) || '—' }}</span>
                    </div>
                </template>
                <button v-if="needsExpand(row, cardConfig.body)"
                    @click="toggleCardExpand(row.id || row.id_analisis)"
                    class="text-xs text-(--color-default) font-medium hover:underline w-full text-center mt-1">
                    {{ isCardExpanded(row.id || row.id_analisis) ? 'Ver menos' : 'Ver más' }}
                </button>
            </div>

            <template #footer v-if="Propiedades.rowActions">
                <div class="flex justify-between items-center">
                    <h4 class="text-xs">Acciones:</h4>
                    <UDropdownMenu :items="getRowActions(row)">
                        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" size="sm" />
                    </UDropdownMenu>
                </div>
            </template>
        </UCard>
    </div>
    <!-- Fallback: tabla en mobile si NO hay card config -->
    <div v-else class="md:hidden block">
        <UTable v-model:column-pinning="columnPinning" sticky :loading="!props.Propiedades.data || varView.cargando || varView.actualizando" loading-color="primary" loading-animation="carousel" :data="datosPaginados" :columns="columns"
            class="flex-1 max-h-[62vh]" />
    </div>
    <!-- Paginador -->
    <div class="flex justify-between mt-3">
        <UPagination v-model:page="paginaActual" active-color="primary" active-variant="subtle" :sibling-count="1"
            :total="datosOrdenados.length" :items-per-page="itemsPorPagina"></UPagination>
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
    <DatosExcel v-if="varView.showDatosExcel" :datos="datosOrdenados" :tabla="props.Propiedades.titulo" />
</template>
