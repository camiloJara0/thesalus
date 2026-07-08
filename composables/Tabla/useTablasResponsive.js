import { ref, watchEffect, onMounted, onUnmounted } from 'vue';

export function useColumnasResponsivas(columnas, espacioMargen = 200) {
    const screenWidth = ref(0);
    const columnasVisibles = ref([]);
    const columnasSobrantes = ref([]);
    const collapse = ref(false);
    const activeCollapse = ref(false)
    const idActivo = ref(0)

    function updateWidth() {
        screenWidth.value = window.innerWidth;
    }

    onMounted(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateWidth);
    });

    watchEffect(() => {
        let acumulado = 0;
        columnasVisibles.value = [];
        columnasSobrantes.value = [];

        const margen = screenWidth.value < 748 ? 150 : espacioMargen;
        columnas.value.forEach(col => {
            acumulado += col.tamaño;
            if (acumulado <= screenWidth.value - margen) {
                columnasVisibles.value.push(col);
            } else {
                columnasSobrantes.value.push(col);
            }
        });

        collapse.value = columnasSobrantes.value.length > 0;
    });

    // Collapse activo
    const activarCollapse = (id, headertabla) => {
        const collapseElement = document.getElementById(`${id}-${headertabla}`);

        if (!collapseElement) return;

        collapseElement.classList.toggle('collapseActive');
        activeCollapse.value = !activeCollapse.value
        idActivo.value = id
    };

    return {
        columnasVisibles,
        columnasSobrantes,
        collapse,
        activarCollapse,
        activeCollapse,
        idActivo,
        screenWidth,
    };
}