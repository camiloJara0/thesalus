import { useIndexedDBStore } from '@/stores/indexedDB.js';
import { decryptData } from './crypto.js';

export async function guardarEnDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();

    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;
        if (Array.isArray(contenido)) {
            for (const item of contenido) await store.guardardatosID({ ...item });
        } else if (typeof contenido === "object" && contenido !== null) {
            await store.guardardatosID({ ...contenido });
        }
    }
}

export async function getAll(url) {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            let options = {
                metodo: 'GET',
                url: url,
                token: token
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                return respuesta.data
            }
        } catch (error) {
            console.error('Fallo al traer datos', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'en desarrollo'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return false
    }
}

export async function actualizarEnIndexedDB(data) {
    const store = useIndexedDBStore();
    await store.initialize();
    for (const [almacen, contenido] of Object.entries(data)) {
        store.almacen = almacen;

        if (Array.isArray(contenido)) {
            for (const item of contenido) {
                await store.actualiza({ ...item });
            }
        } else if (typeof contenido === 'object' && contenido !== null) {
            await store.actualiza({ ...contenido });
        }
    }
}