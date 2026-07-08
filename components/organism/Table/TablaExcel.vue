<script setup>
// importando los reursos
import { defineProps, computed, ref, watch } from 'vue';
import BotonAccion from './BotonAccion.vue';
import Input from '~/components/atoms/Inputs/Input.vue';
import Select from '~/components/atoms/Selects/Select.vue';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import DatosExcel from '~/components/organism/Forms/DatosExcel.vue';
import { enviarCeldasPintadas } from '~/Core/CeldasPintadas/PosrCeldasPintadas';

import { usePaginacion } from '~/composables/Tabla/usePaginacion.js'
import { useColumnasResponsivas } from '~/composables/Tabla/useTablasResponsive';
import { useOrdenamiento } from '~/composables/Tabla/useDatosOrdenadosTabla';

// Variables
const btnAcciones = ref(null)
const showFiltros = ref(false)
const mostrarFiltrosAvanzados = ref(false)
const tiempoLoading = ref(false)
const varView = useVarView()
// funciones
const props = defineProps({
    Propiedades: {
        type: [Object, Array],
        requiered: true,
        default: {}
    }
});

// tamaño de pantalla
const {
    columnasVisibles,
    columnasSobrantes,
    collapse,
    activarCollapse,
    activeCollapse,
    idActivo,
    screenWidth,
} = useColumnasResponsivas(ref(props.Propiedades?.columnas), props.Propiedades.headerTabla?.espacioMargen);


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
} = useOrdenamiento(props.Propiedades.datos.content || ref([]), props.Propiedades.headerTabla.filtros, props.Propiedades.headerTabla.noBuscarPor);


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

// Funciones de tabla
const mostrarAcciones = (id) => {
    btnAcciones.value = btnAcciones.value === id ? null : id;
};

// Al buscar cambia a primera pagina
watch(busqueda, (nuevoValor, anteriorValor) => {
    if (nuevoValor !== anteriorValor) {
        paginaActual.value = 1;
    }
});

watch(filtros, (nuevoValor, anteriorValor) => {
    paginaActual.value = 1;
}, { deep: true });

function getAccionesVisibles(fila) {
    return props.Propiedades.acciones.icons.filter(action => {
        const tipo = typeof action.icon === 'function' ? action.icon(fila) : action.icon;
        return tipo !== undefined && tipo !== null && tipo !== '';
    });
}

const datosCargados = computed(() =>
    props.Propiedades?.datos.content !== undefined
)

const cargaFinalizada = computed(() =>
    datosCargados.value && !tiempoLoading.value
)

const hayBusquedaOFiltros = computed(() => {

    return (
        busqueda.value !== '' ||
        Object.values(filtros.value).some(v => v !== '')
    )

})

const mostrarSinResultados = computed(() => {

    return (
        cargaFinalizada.value &&
        datosPaginados.value.length === 0
    )

})

watch(
    () => props.Propiedades?.datos.content,
    (nuevoValor) => {

        if (nuevoValor !== undefined) {

            setTimeout(() => {
                tiempoLoading.value = false
            }, 1000)

        } else {

            tiempoLoading.value = true
        }
    },
    { immediate: true }
)

const mostrarSkeleton = computed(() => {
    return (
        !datosCargados.value ||
        (datosCargados.value && tiempoLoading.value)
    )

})


// Scroll del header calculado por columnas scrolleables
const bodyScroll = ref(null)
const headerInner = ref(null)

const syncHeaderScroll = () => {
    const x = bodyScroll.value.scrollLeft;
    headerInner.value.style.transform =
        `translateX(-${x}px)`;
}

// Columnas pinned y scroll
const columnasPinned = computed(() => {
    if (props.Propiedades.configuracion.tipo === 'pinned') {
        return props.Propiedades.columnas.filter(c => c.pinned)
    } else {
        return []
    }
})

const columnasScrollable = computed(() => {
    if (props.Propiedades.configuracion.tipo === 'pinned') {
        return props.Propiedades.columnas.filter(c => !c.pinned)
    } else {
        return columnasVisibles.value
    }
})

const estiloColumnasPinned = computed(() => {

    const tamaños = columnasPinned.value
        .map(col =>
            screenWidth.value > 748
                ? `${col.tamaño}px`
                : '100px'
        )
        .join(' ');

    return {
        gridTemplateColumns: tamaños
    };

});

// Tamaño numero de columnas
const estiloColumnasScrollable = computed(() => {
    if (!columnasVisibles.value || columnasVisibles.value.length === 0) return {};

    const tamaños = columnasScrollable.value
        .map(col => col.tamaño && !isNaN(col.tamaño) ?
            screenWidth.value > 748 ? `${col.tamaño}px` : '100px'
            : '80px')
        .join(' ');

    return {
        gridTemplateColumns: `${tamaños}${props.Propiedades.acciones.botones ? ' 70px' : ''}`
    };
});


// Tipo de tabla editable
const celdaActiva = ref({
    fila: null,
    columna: null
})

const pintarCeldas = ref(false);
const celdasPintadas = ref(props.Propiedades.configuracion.celdasPintadas);
const colorPicker = ref(null)

const filasCambiadas = ref(new Set());
const actualizarCambios = ref(false);

const pintarCelda = (fila, columna, color) => {
    const index = celdasPintadas.value.findIndex(
        c => c.fila === fila && c.columna === columna
    );
    if (index !== -1) {
        // actualizar color
        celdasPintadas.value[index].color = color;
    } else {
        // agregar nueva celda
        celdasPintadas.value.push({ fila, columna, color });
    }
};

const despintarCelda = (fila, columna, color) => {
    console.log(fila, columna)
    celdasPintadas.value = celdasPintadas.value.filter(C => {
        return !(C.fila === fila && C.columna === columna)
    });
};

const obtenerColorCelda = (fila, columna) => {
    const celda = celdasPintadas.value.find(
        c => c.fila === fila && c.columna === columna
    );
    return celda ? celda.color : 'transparent';
};


const estaEditando = (f, c) =>
    celdaActiva.value.fila === f &&
    celdaActiva.value.columna === c

function actualizarFila(id) {
    // marcar la fila como cambiada
    actualizarCambios.value = true;
    filasCambiadas.value.add(id);
}

function filaFueCambiada(id) {
    return filasCambiadas.value.has(id);
}

async function guardarCambios() {
    const datosActualizados = datosPaginados.value.filter((dato, index) => {
        return filasCambiadas.value.has(dato.id)
    });

    for (const fila of datosActualizados) {
        await props.Propiedades.configuracion.onUpdate(fila);
    }

    // limpiar cambios
    filasCambiadas.value.clear();
    actualizarCambios.value = false;

}

const campos = {
    input: Input,
    select: Select,
}

// Función para verificar si el texto necesita tooltip
const necesitaTooltip = (texto) => {
    const textoStr = String(texto || '');
    return textoStr.length > 30;
}

// Función para obtener el título truncado
const obtenerTituloTooltip = (texto) => {
    const textoStr = String(texto || '');
    return necesitaTooltip(texto) ? textoStr : '';
}

// Excel
onMounted(() => {
    document.addEventListener('keydown', manejarTeclado);
});

onUnmounted(() => {
    document.removeEventListener('keydown', manejarTeclado);
});

const manejarTeclado = (e) => {
    if (!celdaActiva.value.fila) return;

    const filas = datosPaginados.value;
    const cols = columnasScrollable.value;

    if (!filas || filas.length === 0 || !cols || cols.length === 0) return;

    let filaIndex = filas.findIndex(f => f.id === celdaActiva.value.fila);
    let colIndex = cols.findIndex(c => c.titulo === celdaActiva.value.columna);

    if (filaIndex === -1 || colIndex === -1) return;

    let movido = false;

    switch (e.key) {
        case 'ArrowDown':
            if (filaIndex < filas.length - 1) {
                filaIndex++;
                movido = true;
                e.preventDefault();
            }
            break;
        case 'ArrowUp':
            if (filaIndex > 0) {
                filaIndex--;
                movido = true;
                e.preventDefault();
            }
            break;
        case 'ArrowRight':
            if (colIndex < cols.length - 1) {
                colIndex++;
                movido = true;
                e.preventDefault();
            }
            break;
        case 'ArrowLeft':
            if (colIndex > 0) {
                colIndex--;
                movido = true;
                e.preventDefault();
            }
            break;
        case 'Tab':
            if (e.shiftKey && colIndex > 0) {
                colIndex--;
            } else if (!e.shiftKey && colIndex < cols.length - 1) {
                colIndex++;
            }
            movido = true;
            e.preventDefault();
            break;
        case 'Enter':
            if (e.ctrlKey || e.metaKey) {
                guardarCambios();
            } else if (filaIndex < filas.length - 1) {
                filaIndex++;
                movido = true;
                e.preventDefault();
            }
            break;
        case 'c':
        case 'C':
            if (e.ctrlKey || e.metaKey) {
                copiar();
                e.preventDefault();
            }
            break;
        case 'v':
        case 'V':
            if (e.ctrlKey || e.metaKey) {
                pegar();
                e.preventDefault();
            }
            break;
    }

    if (movido) {
        const nuevaFila = filas[filaIndex];
        const nuevaCol = cols[colIndex];
        celdaActiva.value = {
            fila: nuevaFila.id,
            columna: nuevaCol.titulo
        };
    }
};

const seleccion = ref({
    inicio: null,
    fin: null
});

const iniciarSeleccion = (fila, columna) => {
    seleccion.value.inicio = { fila, columna };
};

const expandirSeleccion = (fila, columna) => {
    if (!seleccion.value.inicio) return;
    seleccion.value.fin = { fila, columna };
};

const estaCeldaEnSeleccion = (filaId, colTitulo) => {
    if (!seleccion.value.inicio || !seleccion.value.fin) {
        if (seleccion.value.inicio && seleccion.value.inicio.fila === filaId && seleccion.value.inicio.columna === colTitulo) {
            return true;
        }
        return false;
    }

    const filas = datosPaginados.value;
    const cols = columnasScrollable.value;

    const filaInicio = Math.min(
        filas.findIndex(f => f.id === seleccion.value.inicio.fila),
        filas.findIndex(f => f.id === seleccion.value.fin.fila)
    );
    const filaFin = Math.max(
        filas.findIndex(f => f.id === seleccion.value.inicio.fila),
        filas.findIndex(f => f.id === seleccion.value.fin.fila)
    );

    const colInicio = Math.min(
        cols.findIndex(c => c.titulo === seleccion.value.inicio.columna),
        cols.findIndex(c => c.titulo === seleccion.value.fin.columna)
    );
    const colFin = Math.max(
        cols.findIndex(c => c.titulo === seleccion.value.inicio.columna),
        cols.findIndex(c => c.titulo === seleccion.value.fin.columna)
    );

    const filaActual = filas.findIndex(f => f.id === filaId);
    const colActual = cols.findIndex(c => c.titulo === colTitulo);

    return filaActual >= filaInicio && filaActual <= filaFin &&
        colActual >= colInicio && colActual <= colFin;
};

const clipboardData = ref({
    datos: [],
    rango: null,
    tipo: 'celdas' // 'celdas' o 'fila'
});

const generarTextoSeleccion = () => {
    if (!seleccion.value.inicio || !seleccion.value.fin) return '';

    const filas = datosPaginados.value;
    const cols = columnasScrollable.value;

    const filaInicio = Math.min(
        filas.findIndex(f => f.id === seleccion.value.inicio.fila),
        filas.findIndex(f => f.id === seleccion.value.fin.fila)
    );
    const filaFin = Math.max(
        filas.findIndex(f => f.id === seleccion.value.inicio.fila),
        filas.findIndex(f => f.id === seleccion.value.fin.fila)
    );

    const colInicio = Math.min(
        cols.findIndex(c => c.titulo === seleccion.value.inicio.columna),
        cols.findIndex(c => c.titulo === seleccion.value.fin.columna)
    );
    const colFin = Math.max(
        cols.findIndex(c => c.titulo === seleccion.value.inicio.columna),
        cols.findIndex(c => c.titulo === seleccion.value.fin.columna)
    );

    const filas_arr = filas.slice(filaInicio, filaFin + 1);
    const cols_arr = cols.slice(colInicio, colFin + 1);

    return filas_arr.map(fila =>
        cols_arr.map(col => fila[col.titulo] || '').join('\t')
    ).join('\n');
};

const copiar = async () => {
    if (!celdaActiva.value.fila) return;

    const filas = datosPaginados.value;
    const cols = columnasScrollable.value;
    const texto = generarTextoSeleccion();

    if (!texto) {
        // Copiar celda individual
        const fila = filas.find(f => f.id === celdaActiva.value.fila);
        const valor = fila[celdaActiva.value.columna] || '';
        await navigator.clipboard.writeText(String(valor));
        clipboardData.value = {
            datos: [[valor]],
            rango: { filaInicio: 0, filaFin: 0, colInicio: 0, colFin: 0 },
            tipo: 'celdas'
        };
    } else {
        // Copiar rango
        await navigator.clipboard.writeText(texto);
        const filaInicio = Math.min(
            filas.findIndex(f => f.id === seleccion.value.inicio?.fila),
            filas.findIndex(f => f.id === seleccion.value.fin?.fila)
        );
        const colInicio = Math.min(
            cols.findIndex(c => c.titulo === seleccion.value.inicio?.columna),
            cols.findIndex(c => c.titulo === seleccion.value.fin?.columna)
        );

        clipboardData.value = {
            datos: texto.split('\n').map(f => f.split('\t')),
            rango: { filaInicio, colInicio },
            tipo: 'celdas'
        };
    }
};

const pegar = async () => {
    if (!celdaActiva.value.fila) return;

    try {
        const texto = await navigator.clipboard.readText();
        const filas = datosPaginados.value;
        const cols = columnasScrollable.value;

        const filaInicio = filas.findIndex(f => f.id === celdaActiva.value.fila);
        const colInicio = cols.findIndex(c => c.titulo === celdaActiva.value.columna);

        if (filaInicio === -1 || colInicio === -1) return;

        const datos = texto.split('\n').map(f => f.split('\t'));

        datos.forEach((fila, i) => {
            const filaActual = filas[filaInicio + i];
            if (!filaActual) return;

            fila.forEach((valor, j) => {
                const colActual = cols[colInicio + j];
                if (colActual) {
                    filaActual[colActual.titulo] = valor;
                    actualizarFila(filaActual.id);
                }
            });
        });
    } catch (err) {
        console.warn('No se pudo acceder al portapapeles:', err);
    }
};

const hojas = ref([
    { 
        nombre: 'Hoja 1', 
        datos: props.Propiedades.datos.content || [],
        columnas: props.Propiedades.columnas || [],
        id: Date.now()
    }
]);

const hojaActiva = ref(0);
const nombreNuevaHoja = ref('');
const mostrarAgregarHoja = ref(false);

const crearNuevaHoja = () => {
    const nuevoNombre = nombreNuevaHoja.value.trim() || `Hoja ${hojas.value.length + 1}`;
    hojas.value.push({
        nombre: nuevoNombre,
        datos: [],
        columnas: props.Propiedades.columnas || [],
        id: Date.now() + Math.random()
    });
    hojaActiva.value = hojas.value.length - 1;
    nombreNuevaHoja.value = '';
    mostrarAgregarHoja.value = false;
};

const cambiarHoja = (index) => {
    hojaActiva.value = index;
};

const eliminarHoja = (index) => {
    if (hojas.value.length === 1) {
        alert('No puedes eliminar la última hoja');
        return;
    }
    hojas.value.splice(index, 1);
    if (hojaActiva.value >= hojas.value.length) {
        hojaActiva.value = hojas.value.length - 1;
    }
};

const renombrarHoja = (index, nuevoNombre) => {
    if (nuevoNombre.trim()) {
        hojas.value[index].nombre = nuevoNombre.trim();
    }
};
</script>

<template>
    <div class="h-[90%]">
        <!-- Header -->
        <div class="flex w-full justify-between items-center md:flex-row flex-col gap-3">
            <div>
                <h1 class="font-bold md:text-2xl text-xl tituloTabla text-gray-800 dark:text-gray-200">
                    {{ props.Propiedades.headerTabla?.titulo }}
                </h1>
                <p>{{ props.Propiedades.headerTabla?.descripcion }}</p>
            </div>
            <div class="flex gap-3 md:w-[45%] w-full justify-end">

                <div v-if="Propiedades.headerTabla.filtros?.length > 0" class="flex items-center gap-1 cursor-pointer"
                    @click="showFiltros = !showFiltros">
                    <ButtonRounded color="bg-blue-700">
                        <i class="fa-solid fa-filter"></i>
                    </ButtonRounded>
                    <h4 class="md:block hidden select-none">Filtrar Datos</h4>
                </div>

                <client-only v-if="Propiedades.headerTabla.excel">
                    <div class="flex relative dropdown cursor-pointer ">
                        <div class="flex gap-1 items-center">
                            <ButtonRounded color="bg-green-500">
                                <i class="fa-solid fa-file-excel"></i>
                            </ButtonRounded>
                            <h4 class="md:block hidden select-none">Exportar</h4>
                        </div>
                        <div
                            class="configExcel flex flex-col absolute top-full md:left-0 left-[-70%] bg-(--color-default-500) text-gray-300 md:p-3 p-1 z-9 gap-4 items-center justify-center rounded-lg">

                            <download-excel class="flex gap-1 hover:text-white"
                                :data="Array.isArray(datosOrdenados) ? unref(datosOrdenados) : unref(props.Propiedades.datos.content)"
                                :name="props.Propiedades.headerTabla.titulo" type="xlsx">
                                <i class="fa-solid fa-download"></i>
                                <p class="text-xs">Descargar</p>
                            </download-excel>

                            <div class="flex gap-1 hover:text-white" @click="varView.showDatosExcel = true">
                                <i class="fa-solid fa-gear"></i>
                                <p class="text-xs">Configurar</p>
                            </div>

                        </div>
                    </div>
                </client-only>

                <div v-if="props.Propiedades.headerTabla?.accionAgregar"
                    @click="props.Propiedades.headerTabla.accionAgregar"
                    class="flex gap-1 items-center cursor-pointer user-select-none">
                    <ButtonRounded color="bg-blue-500">
                        <i class="fa-solid fa-plus"></i>
                    </ButtonRounded>
                    <h4 class="md:block hidden">Agregar</h4>
                </div>

                <div v-for="boton in props.Propiedades.headerTabla?.acciones" @click="boton.accion"
                    class="flex gap-1 items-center cursor-pointer">
                    <ButtonRounded :color="boton.color || 'bg-blue-500'">
                        <i class="fa-solid" :class="boton.icon"></i>
                    </ButtonRounded>
                    <h4 class="md:block hidden">{{ boton.text }}</h4>
                </div>

            </div>
        </div>
        <!-- Filtos -->
        <div class="w-full mt-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
            v-if="Propiedades.headerTabla.bucador && showFiltros || Propiedades.headerTabla.filtros && showFiltros">
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
                    <ButtonRounded v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
                        color="dark:text-gray-200 dark:bg-red-600 text-gray-700 bg-red-400" tooltip="Limpiar filtros"
                        tooltipPosition="top" @click="borrarFiltros">
                        <i class="fa-solid fa-xmark"></i>
                    </ButtonRounded>
                </div>
            </div>
            <div class="flex flex-wrap items-end justify-between gap-3"">
                <Input v-if="Propiedades.headerTabla.buscador" :Propiedades="{
                    placeholder: 'Buscar dato en la Tabla...',
                    icon: 'fa-solid fa-search',
                    modelValue: busqueda,
                    tamaño: 'w-full sm:w-2/5',
                    upperCase: true,
                    estilo: 'bg-white dark:bg-gray-900'
                }" v-model="busqueda" />

            <div class="flex flex-wrap justify-end gap-3">
                <Select v-for="(filtro, key) in filtrosConOpciones.slice(0, 3)" :key="key" :Propiedades="{
                    placeholder: filtro.placeholder,
                    label: filtro.placeholder,
                    modelValue: busqueda,
                    tamaño: 'md:w-[180px] w-full',
                    estilo: 'bg-white dark:bg-gray-900',
                    options: [{ text: 'Todos', value: '' }, ...filtro.datos,],
                }" v-model="filtros[filtro.columna]" />
            </div>
        </div>
        <div v-if="mostrarFiltrosAvanzados"
            class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-end">
            <Select v-for="(filtro, key) in filtrosConOpciones.slice(3)" :key="key" :Propiedades="{
                placeholder: filtro.placeholder,
                label: filtro.placeholder,
                modelValue: busqueda,
                tamaño: 'w-full',
                estilo: 'bg-white dark:bg-gray-900',
                options: [{ text: 'Todos', value: '' }, ...filtro.datos,],
            }" v-model="filtros[filtro.columna]" />
        </div>
    </div>

    <Transition name="slide-up">
        <div v-if="actualizarCambios"
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-xl shadow-xl bg-yellow-400 dark:bg-gray-800 border border-yellow-500 dark:border-gray-600 animate-fadeIn">
            <span class="text-sm font-medium">
                Tienes cambios sin guardar
            </span>
            <ButtonRounded color="dark:text-gray-200 dark:bg-red-600 text-gray-700 bg-yellow-400"
                tooltip="Guardar Cambios" tooltipPosition="top" @click="guardarCambios">
                <i class="fa-solid fa-floppy-disk"></i>
            </ButtonRounded>
        </div>
    </Transition>

    <!-- Tabla -->
    <div
        class="mt-5 shadow-lg dark:shadow-[0_2px_4px_rgba(255,255,255,0.1)] bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
        <div class="w-full" role="table">

            <!-- Header Columnas -->
            <div class="flex w-max min-w-full relative">

                <!-- COLUMNAS FIJAS -->
                <div v-if="props.Propiedades.configuracion.tipo === 'pinned'"
                    class="sticky top-0 z-20 grid justify-between text-xs font-bold bg-(--color-default) dark:bg-(--color-default-600) border-b border-gray-200 dark:border-gray-700 text-white"
                    :style="estiloColumnasPinned"
                    :class="{ 'rounded-lt-lg': props.Propiedades.configuracion.tipo === 'pinned', 'rounded-t-lg': props.Propiedades.configuracion.tipo !== 'pinned' }"
                    role="row">

                    <h2 v-for="(col, key) in columnasPinned" :key="col.titulo" class="flex items-center py-4 px-2"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }" role="cell">
                        {{ col.value }}
                        <ButtonRounded id="key" v-if="col.ordenar" @click="sortedItems(col.titulo)"
                            color="bg-inherit h-fit " tooltip="Ordenar">
                            <i class="fa-solid fa-sort cursor-pointer text-gray-300 dark:text-gray-300"
                                :class="{ 'text-blue-400! dark:text-blue-800': col.titulo == columnaOrden }"></i>
                        </ButtonRounded>
                    </h2>

                </div>

                <!-- COLUMNAS SCROLLEABLES O VISIBLES -->
                <div ref="headerInner"
                    class="w-full sticky top-0 z-3 grid justify-between text-xs bg-(--color-default) dark:bg-(--color-default-600) border-b border-gray-200 dark:border-gray-700 font-bold"
                    :class="[Propiedades.headerTabla?.color, { 'rounded-rt-lg': props.Propiedades.configuracion.tipo === 'pinned', 'rounded-t-lg': props.Propiedades.configuracion.tipo !== 'pinned' }]"
                    :style="estiloColumnasScrollable" role="row">

                    <h2 v-for="(col, key) in columnasScrollable" :key="col.titulo" class="flex items-center px-2 py-4"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }" role="cell">
                        {{ col.value }}
                        <ButtonRounded id="key" v-if="col.ordenar" @click="sortedItems(col.titulo)"
                            color="bg-inherit h-fit " tooltip="Ordenar">
                            <i class="fa-solid fa-sort cursor-pointer text-gray-300 dark:text-gray-300"
                                :class="{ 'text-blue-400! dark:text-blue-800': col.titulo == columnaOrden }"></i>
                        </ButtonRounded>
                    </h2>
                    <h2 v-if="Propiedades.acciones.botones" :class="Propiedades.acciones.class" role="cell"
                        class="py-4 pr-2 text-center">Acciones
                    </h2>

                </div>
            </div>

            <!-- Skeleton cuando se cargan los daotos -->
            <template v-if="mostrarSkeleton">
                <div v-for="i in itemsPorPagina" :key="`skeleton-${i}`"
                    class="bodyTable justify-between grid text-center animate-pulse" :style="estiloColumnasScrollable">
                    <div v-for="(col, key) in columnasVisibles" :key="key"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }">
                        <div class="h-3 bg-gray-200 rounded w-3/4 my-3.75 mx-2"></div>
                    </div>
                    <div v-if="Propiedades.acciones.botones"
                        class="flex items-center justify-center accionesTabla text-center gap-2"
                        :class="Propiedades.acciones.class">
                        <div class="h-3 bg-gray-200 rounded w-1/2 mt-1 my-2"></div>
                    </div>
                </div>
            </template>

            <div v-else-if="mostrarSinResultados" class="flex flex-col items-center justify-center py-16 text-center">
                <i class="fa-regular fa-folder-open text-4xl text-gray-300 mb-4"></i>
                <p class="text-gray-600 dark:text-gray-400 font-medium">
                    No hay resultados
                </p>
                <p class="text-sm text-gray-400 mt-1">
                    Ajusta los filtros o cambia el término de búsqueda.
                </p>

            </div>

            <!-- Body tabla -->
            <div v-else ref="bodyScroll" @scroll="syncHeaderScroll"
                class="overflow-auto max-h-103 relative scrollFormT">

                <div v-for="(fila, id) in datosPaginados" role="row"
                    :class="{ 'bg-yellow-50 dark:bg-yellow-900/20': filaFueCambiada(fila.id) }"
                    class="bodyTable justify-between flex w-max min-w-full odd:bg-(--color-default-claro-100) odd:hover:bg-(--color-default-claro) dark:odd:bg-gray-800  dark:odd:hover:bg-gray-700 group transition-colors duration-150 hover:bg-(--color-default-claro) dark:hover:bg-gray-700">
                    <div
                        class="relative before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-500 before:scale-y-0 group-hover:before:scale-y-100 before:transition-transform before:duration-200">
                    </div>

                    <!-- COLUMNAS FIJAS -->
                    <div v-if="props.Propiedades.configuracion.tipo === 'pinned'"
                        class="sticky left-0 z-20 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_6px_-1px_rgba(255,255,255,0.05)] flex flex-col justify-center backdrop-blur-3xl">
                        <div class="grid w-full justify-between " :style="estiloColumnasPinned">
                            <div v-for="col in columnasPinned" :key="col.titulo" :style="{ width: `${col.tamaño}px` }" 
                                    @mousedown="iniciarSeleccion(fila.id, col.titulo)"
                                    @mouseover="expandirSeleccion(fila.id, col.titulo)"
                                    @mouseup="finalizarSeleccion"
                            >
                                <p class="font-medium text-gray-900 dark:text-white truncate p-2 py-2">
                                    {{ fila[col.titulo] }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- COLUMNAS SCROLLEABLES O VISIBLES -->
                    <div class="grid w-full justify-between" :style="estiloColumnasScrollable">
                        <div v-for="(col, key) in columnasScrollable" :key="key"
                            :style="{ width: `${col.tamaño}px`, minWidth: '60px' }" role="cell"
                            class="relative transition-colors duration-150"
                            :class="{
                                'bg-blue-200 dark:bg-blue-900': estaCeldaEnSeleccion(fila.id, col.titulo),
                                'bg-blue-300 dark:bg-blue-800': celdaActiva.fila === fila.id && celdaActiva.columna === col.titulo
                            }">

                            <div v-if="props.Propiedades.configuracion.camposInputs"
                                class="relative w-full h-full px-2 py-2 cursor-text rounded-md transition-all duration-150 hover:bg-(--color-default-claro) dark:hover:bg-gray-700"
                                :style="{
                                    backgroundColor: obtenerColorCelda(fila.id, col.titulo)
                                }" @click="celdaActiva = { fila: fila.id, columna: col.titulo }"
                                @mousedown="iniciarSeleccion(fila.id, col.titulo)"
                                @mouseover="expandirSeleccion(fila.id, col.titulo)"
                                @mouseup="finalizarSeleccion">

                                <component v-if="!estaEditando(fila.id, col.titulo)" :is="campos[col.campo]"
                                    v-model="fila[col.titulo]" class=" truncate text-gray-800 dark:text-gray-200"
                                    :Propiedades="{ ...col, placeholder: '...', estilo: 'bg-transparent border-none! outline-none rounded-md text-gray-900 dark:text-white shadow-none! transition-all duration-150 w-full h-full px-0! py-0!' }" />

                                <!-- INPUT O SELECT SOLO EN EDICION -->
                                <component v-else :is="campos[col.campo]" ref="inputEditable" v-model="fila[col.titulo]"
                                    @blur="celdaActiva = { fila: null, columna: null }"
                                    @change="actualizarFila(fila.id)"
                                    @keydown.enter="celdaActiva = { fila: null, columna: null }"
                                    class="absolute inset-0 w-full h-full hover:bg-(--color-default-claro)/60 hover:dark:bg-(--color-default-oscuro)/60 dark:bg-gray-800 border border-blue-400 outline-none px-2 rounded-md text-gray-900 dark:text-white shadow-sm transition-all duration-150"
                                    :Propiedades="{ ...col, placeholder: fila[col.titulo] ? fila[col.titulo] : 'Editar dato...', disabled: props.Propiedades.configuracion.camposEditables, estilo: 'bg-transparent border-none! outline-none px-2 rounded-md text-gray-900 dark:text-white shadow-none! transition-all duration-150 w-full h-full' }" />
                            </div>

                            <p v-else class="w-full truncate py-2 px-2 relative group cursor-cell" 
                                @mousedown="iniciarSeleccion(fila.id, col.titulo)"
                                @mouseover="expandirSeleccion(fila.id, col.titulo)"
                                @mouseup="finalizarSeleccion"
                                @click="celdaActiva = { fila: fila.id, columna: col.titulo }"
                                :class="{
                                'font-medium text-gray-900 dark:text-white': key === 0 && props.Propiedades.configuracion.tipo !== 'pinned',
                                'text-gray-800 dark:text-gray-200': key != 0,
                                'hasTooltip': necesitaTooltip(fila[col.titulo])
                            }">
                                {{ fila[col.titulo] }}
                            </p>

                        </div>

                        <!-- Acciones -->
                        <div v-if="Propiedades.acciones.botones"
                            class="flex items-center justify-center accionesTabla text-center gap-2 group"
                            :class="Propiedades.acciones.class">

                            <!-- Acciones por props -->
                            <BotonAccion
                                v-if="!collapse && Propiedades.acciones.icons.length < 4 || Propiedades.acciones.icons.length < 2"
                                v-for="action in getAccionesVisibles(fila)" :key="action"
                                :tipo="typeof action.icon === 'function' ? action.icon(fila) : action.icon"
                                @click="action.action(fila)" />


                            <!-- Boton de tablas ocultas por responsive  -->
                            <button @click="activarCollapse(id, Propiedades.headerTabla.titulo)"
                                v-if="collapse && props.Propiedades.configuracion.tipo !== 'pinned'"
                                class="flex items-center justify-center bg-gray-300 dark:bg-gray-700 w-6 h-6 text-xs rounded-md transition-all duration-300 cursor-pointer active:scale-95 hover:opacity-75">
                                <i v-if="!activeCollapse || id !== idActivo"
                                    class="fa-solid fa-angle-down text-gray-600 dark:text-gray-200"></i>
                                <i v-if="activeCollapse && id === idActivo"
                                    class="fa-solid fa-angle-up text-gray-600 dark:text-gray-200"></i>
                            </button>

                            <!-- Boton para desplegar acciones porp props Responsive -->
                            <div class="relative inline-block text-left">
                                <button @click="mostrarAcciones(id)"
                                    v-if="collapse && Propiedades.acciones.icons.length > 1 || Propiedades.acciones.icons.length > 3"
                                    class="btn-accionesOcultas flex items-center justify-center bg-gray-300 dark:bg-gray-700 w-6 h-6 rounded-md transition-all duration-300 cursor-pointer active:scale-95 hover:opacity-75">
                                    <i
                                        class="fa-solid fa-ellipsis-vertical text-gray-600 dark:text-gray-200 text-xs"></i>
                                </button>

                                <!-- Dropdown -->
                                <div v-if="btnAcciones === id"
                                    class="acciones absolute right-0 mt-2 w-16 bg-white dark:bg-gray-800 shadow-lg rounded-md z-5"
                                    :id="id">
                                    <BotonAccion v-for="action in getAccionesVisibles(fila)" :key="action"
                                        :tipo="typeof action.icon === 'function' ? action.icon(fila) : action.icon"
                                        @click="() => { action.action(fila); mostrarAcciones(id) }"
                                        class="w-full text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md">
                                    </BotonAccion>
                                </div>
                            </div>

                        </div>


                        <!-- collapse -->
                        <div class="collapse-text col-span-full" :id="`${id}-${Propiedades.headerTabla.titulo}`">
                            <div class="w-full grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2">
                                <div v-for="(col, key) in columnasSobrantes" class="flex-wrap truncate px-2 my-2">
                                    <p
                                        class="text-gray-600 dark:text-gray-200 text-xs font-bold border-t border-t-gray-100 dark:border-t-gray-600 mb-1 truncate">
                                        {{ col.titulo }}
                                    </p>
                                    {{ fila[col.titulo] }}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


                <!-- filas vacías para rellenar -->
                <div v-if="datosPaginados?.length > 0" v-for="n in (itemsPorPagina - datosPaginados.length)"
                    :key="`empty-${n}`"
                    class="bodyTable w-full justify-between grid p-2 text-center hover:bg-(--color-default-claro) odd:bg-(--color-default-claro-100) odd:hover:bg-(--color-default-claro) dark:odd:bg-gray-800 dark:hover:bg-gray-700 dark:odd:hover:bg-gray-700"
                    :style="estiloColumnasScrollable" role="row">

                    <div v-for="(col, key) in columnasScrollable" :key="key" role="cell"
                        :style="{ width: `${col.tamaño}px`, minWidth: '60px' }">
                        <p class="text-transparent select-none">.</p>
                    </div>
                </div>

            </div>

        </div>
    </div>

    <div v-if="celdaActiva.fila !== null && celdaActiva.columna !== null"
        class="w-full flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md relative">
        <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Selecciona color:</label>
        <input v-model="colorPicker" type="color"
            class="w-5 h-5 cursor-pointer rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform duration-200">
            <ButtonRounded v-if="colorPicker" color="bg-inherit w-fit! h-fit! p-0" tooltip="Pintar celda"
                @click="pintarCelda(celdaActiva.fila, celdaActiva.columna, colorPicker)">
                <i class="fa-solid fa-paintbrush text-sm text-black dark:text-white"></i>
            </ButtonRounded>
            <ButtonRounded color="bg-inherit w-fit! h-fit! p-0" tooltip="Borrar Color"
                @click="despintarCelda(celdaActiva.fila, celdaActiva.columna, colorPicker)">
                <i class="fa-solid fa-trash text-sm text-black dark:text-white"></i>
            </ButtonRounded>

            <div class="absolute right-3">
                <ButtonRounded color="bg-inherit w-fit! h-fit! p-0" tooltip="Guardar" @click="enviarCeldasPintadas({
                    celdasPintadas: unref(celdasPintadas),
                    tabla: props.Propiedades.headerTabla.titulo,
                    id_infoUsuario: varView.getUser.id
                })">
                    <i class="fa-solid fa-floppy-disk text-sm text-black dark:text-white"></i>
                </ButtonRounded>
            </div>
    </div>

    <div
        class="w-full flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-b-md shadow-md overflow-x-auto">
        <!-- Hojas existentes -->
        <div class="flex gap-1 border-b border-gray-300 dark:border-gray-600">
            <div v-for="(hoja, index) in hojas" :key="hoja.id"
                @click="cambiarHoja(index)"
                class="flex items-center gap-2 px-3 py-2 rounded-t-md cursor-pointer transition-all duration-200"
                :class="hojaActiva === index 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-b-2 border-blue-500' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'">
                <i class="fa-solid fa-table text-sm"></i>
                <span class="text-sm font-medium max-w-25 truncate">{{ hoja.nombre }}</span>
                <button @click.stop="eliminarHoja(index)" 
                    v-if="hojas.length > 1"
                    class="ml-1 text-xs hover:text-red-500 transition-colors"
                    title="Eliminar hoja">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>

        <!-- Botón agregar hoja -->
        <button @click="mostrarAgregarHoja = true"
            class="flex items-center gap-1 px-3 py-2 primary text-white rounded-md text-sm transition-colors">
            <i class="fa-solid fa-plus"></i>
            <span class="hidden sm:inline">Nueva Hoja</span>
        </button>

        <!-- Modal para nueva hoja -->
        <div v-if="mostrarAgregarHoja"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-md">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Nueva Hoja</h3>
                <input v-model="nombreNuevaHoja" type="text"
                    placeholder="Nombre de la hoja"
                    @keyup.enter="crearNuevaHoja"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4">
                <div class="flex gap-2 justify-end">
                    <button @click="mostrarAgregarHoja = false"
                        class="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
                        Cancelar
                    </button>
                    <button @click="crearNuevaHoja"
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Crear
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Paginador -->
    <div class="flex items-center justify-between px-4 py-2 mt-2">
        <p class="text-sm text-gray-500 md:flex gap-1 hidden">
            Mostrando
            <span class="text-gray-500">{{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</span>
            <span class="text-gray-500">de {{ datosOrdenados.length }}</span>
        </p>

        <div class="btnsPagina flex items-center gap-2">
            <!-- <ButtonRounded v-if="paginaActual > 2" tooltip="Ir a Primera Pagina"
                    color="text-l p-2 text-white !w-[30px] !h-[30px] flex justify-center items-center rounded-full cursor-pointer md:mr-4"
                    @click="irAPagina(1)">
                    <i class="fa-solid fa-angles-left"></i>
                </ButtonRounded> -->

            <ButtonRounded tooltip="Atras" :disabled="paginaActual === 1"
                color="p-1.5 text-gray-500! dark:text-gray-400! hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition"
                @click="paginaAnterior()">
                <i class="fa-solid fa-chevron-left"></i>
            </ButtonRounded>
            <div class="flex gap-2 pagina select-none">

                <!-- Página actual -->
                <span class="text-sm text-gray-600 dark:text-gray-300">
                    Página
                    <span class="font-semibold">
                        {{ paginaActual }}
                    </span>
                    de
                    <span @click="irAPagina(totalPaginas == 0 ? 1 : totalPaginas)"
                        class="font-semibold underline cursor-pointer hover:text-gray-900 dark:hover:text-gray-400">
                        {{ totalPaginas === 0 ? 1 : totalPaginas }}
                    </span>
                </span>

            </div>
            <ButtonRounded :disabled="paginaActual === (totalPaginas == 0 ? 1 : totalPaginas)" tooltip="Siguiente"
                color="p-1.5 text-gray-500! dark:text-gray-400! hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 transition"
                @click="siguientePagina()">
                <i class="fa-solid fa-chevron-right"></i>
            </ButtonRounded>
        </div>


        <div class="flex items-center">
            <p class="text-sm text-gray-500 md:block hidden">Número de registros</p>
            <select name="numRegistros"
                class="ml-3 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                @change="cambiarItemsPorPagina($event.target.value)">
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="20">20</option>
                <option value="50">50</option>
            </select>
        </div>

    </div>
    </div>
    <DatosExcel v-if="varView.showDatosExcel" :datos="datosOrdenados" :tabla="props.Propiedades.headerTabla.titulo" />
</template>



<style scoped>
.configExcel {
    opacity: 0;
    pointer-events: none;
    transform: translateX(0) translateY(-10%);
    transition: all 0.3s ease;
}

.dropdown:hover .configExcel {
    opacity: 1;
    pointer-events: all;
    transform: translateX(0) translateY(0);
}

.containerTable::-webkit-scrollbar {
    display: none;
}


.btnActions {
    border: none;
    color: white;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    padding: .40rem;
    margin: 0;
    border-radius: 50%;
}

.collapse-text {
    display: none;
    margin-top: 20px;
    pointer-events: none;
    justify-content: space-evenly;
}

.collapseActive {
    display: flex;
    pointer-events: all;
}

.acciones {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.btn-accionesOcultas {
    transition: background-color 0.2s ease;
}

.btn-accionesOcultas:hover {
    background-color: #d1d5db;
    /* gris más oscuro */
}

/* Paginador css */
/* .btnsPagina button {
    background: linear-gradient(to left, var(--color-default), var(--color-default-700));
} */

.scrollFormT {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
}

.scrollFormT::-webkit-scrollbar {
    width: 3px;
}

.scrollFormT::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 9999px;
}

input {
    animation: scaleIn .12s ease;
}

@keyframes scaleIn {
    from {
        transform: scale(.98);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.hasTooltip {
    position: relative;
    cursor: help;
}

/* Tooltip oculto por defecto */
.hasTooltip .tooltip {
    position: absolute;
    bottom: -20%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(241, 241, 241, 0.92);
    color: #000;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    line-height: 1.4;
    max-width: 260px;
    white-space: normal;
    word-wrap: break-word;
    z-index: 50;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s ease, transform 0.25s ease;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(75, 85, 99, 0.25);
    pointer-events: none;
}

/* Flecha */
.hasTooltip .tooltip::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: rgba(31, 41, 55, 0.92);
}

/* Mostrar al hover */
.hasTooltip:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-4px);
}

/* Dark mode */
:dark .hasTooltip .tooltip {
    background: rgba(17, 24, 39, 0.95);
    color: #e5e7eb;
    border-color: rgba(55, 65, 81, 0.3);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

:dark .hasTooltip .tooltip::before {
    border-bottom-color: rgba(17, 24, 39, 0.95);
}

/* Selección de celdas - Excel style */
.bg-blue-200 {
    background-color: rgba(59, 130, 246, 0.2) !important;
    border: 1px solid rgba(59, 130, 246, 0.5);
}

.dark .bg-blue-200 {
    background-color: rgba(59, 130, 246, 0.15) !important;
}

.bg-blue-300 {
    background-color: rgba(59, 130, 246, 0.4) !important;
    border: 2px solid rgba(59, 130, 246, 1) !important;
}

.dark .bg-blue-300 {
    background-color: rgba(59, 130, 246, 0.25) !important;
}

/* Cursor para agarrar rango */
.cursor-cell {
    cursor: cell;
}

/* Animación de enfoque en celda */
@keyframes cellFocus {
    0%, 100% { box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.8); }
    50% { box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 1); }
}

.bg-blue-300 {
    animation: cellFocus 1s ease-in-out;
}
</style>