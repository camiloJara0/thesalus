import { watch } from 'vue';

// loader: 'global' (default) usa el loader a pantalla completa;
// 'suave' solo muestra el indicador sutil de actualización (sin bloquear la UI).
async function refrescar({ fetchFn, refresh }, suave, varView) {
    if (!suave) varView.cargando = true;
    try {
        await fetchFn();
        refresh.value++;
        varView.cambioEnApi = false;
    } finally {
        if (!suave) {
            varView.cargando = false;
        } else {
            varView.datosActualizados();
        }
    }
}

export function useAutoRefresh({ showRef, fetchFn, refresh, cambioEnApi, loader = 'global' }) {
    const varView = useVarView();
    const suave = loader === 'suave';

    watch(() => showRef.value, async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await refrescar({ fetchFn, refresh }, suave, varView);
        }
    });
}

export function useMultiAutoRefresh(watches, { loader = 'global' } = {}) {
    const varView = useVarView();
    const suave = loader === 'suave';

    for (const { showRef, fetchFn, refresh } of watches) {
        watch(() => showRef.value, async (estado) => {
            if (!estado && varView.cambioEnApi) {
                await refrescar({ fetchFn, refresh }, suave, varView);
            }
        });
    }
}
