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

const dataProps = ref(props.Propiedades.data)
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
  () => props.Propiedades.data.value,
  (nuevosDatos) => {
    if (!nuevosDatos?.length) return
    //datos guardados
    const idsExistentes = new Set(
    data.value.map(item => String(item.id))
    )

    const datosNuevos = nuevosDatos.filter(
    item => !idsExistentes.has(String(item.id))
    )

    //ordenar los datos descendentes por id
    datosNuevos.sort((a, b) => b.id - a.id)
    data.value.push(...datosNuevos)
  },
  {
    deep: true
  }
)

const porPagina = computed(
  () => props.Propiedades.porPagina || 20
)

const table = useTemplateRef('table')
const loading = ref(false)
const hayMasDatos = ref(true)

const cargarDatos = async () => {
  if (loading.value || !hayMasDatos.value) return

  loading.value = true

  try {
    const ultimoId =
      data.value.length
        ? data.value[data.value.length - 1].id
        : 0

        let respuesta = []
        if(varView.isOnline){
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

    // data.value.push(...respuesta)

    const idsExistentes = new Set(
    data.value.map(item => String(item.id))
    )

    const datosNuevos = respuesta.filter(
    item => !idsExistentes.has(String(item.id))
    )

    //ordenar los datos descendentes por id
    datosNuevos.sort((a, b) => b.id - a.id)
    data.value.push(...datosNuevos)

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
        !loading.value && hayMasDatos.value
    }
  )
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
    <!-- Tabla -->
    <UTable ref="table" sticky :loading="loading" loading-color="primary" loading-animation="carousel" :data="datosOrdenados" :columns="columns"
        class="flex-1 max-h-[62vh]" />

    <DatosExcel v-if="varView.showDatosExcel" :datos="datosOrdenados" :tabla="props.Propiedades.titulo" />
</template>
