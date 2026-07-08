import { useHistoriasStore } from "~/stores/Formularios/historias/Historia";
import { decryptData } from "~/composables/Formulario/crypto";

export const eliminarAnalisis = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const store = useHistoriasStore()
console.log(datos)
    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.analisis + '/' + datos.id,
                token: token,
                body: {id: datos.id}
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await store.analisisPaginado([{id: datos.id - 1}], 10, datos.servicio.name, datos.historia.id_paciente)
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}

export const eliminarNotas = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const store = useHistoriasStore()

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.notas + '/' + datos.nota.id,
                token: token,
                body: {id: datos.nota.id}
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await store.analisisPaginado([{id: datos.id - 1}], 10, datos.servicio.name, datos.historia.id_paciente)
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}

export const eliminarTerapias = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const store = useHistoriasStore()

    // Guardar Local
    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.terapias + '/' + datos.terapia.id,
                token: token,
                body: {id: datos.terapia.id}
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await store.analisisPaginado([{id: datos.id - 1}], 10, datos.servicio.name, datos.historia.id_paciente)
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        await guardarEnDB(JSON.parse(JSON.stringify(datos)), "HistoriaClinica");
        return true
    }
}