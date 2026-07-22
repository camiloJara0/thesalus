import { watch } from 'vue';

export function useAutoRefresh({ showRef, fetchFn, refresh, cambioEnApi }) {
    const varView = useVarView();

    watch(() => showRef.value, async (estado) => {
        if (!estado && varView.cambioEnApi) {
            varView.cargando = true;
            await fetchFn();
            refresh.value++;
            varView.cambioEnApi = false;
            varView.cargando = false;
        }
    });
}

export function useMultiAutoRefresh(watches) {
    const varView = useVarView();

    for (const { showRef, fetchFn, refresh, cambioEnApi } of watches) {
        watch(() => showRef.value, async (estado) => {
            if (!estado && varView.cambioEnApi) {
                varView.cargando = true;
                await fetchFn();
                refresh.value++;
                varView.cambioEnApi = false;
                varView.cargando = false;
            }
        });
    }
}
