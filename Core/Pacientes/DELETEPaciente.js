import { usePacientesStore } from '~/stores/Entidades/Paciente.js';
import { actualizarEnIndexedDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
export const eliminarPaciente = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const store = usePacientesStore()

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'DELETE',
                url: config.public.pacientes + '/' + datos.id,
                token: token,
                body: {
                    id: datos.id,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                await store.traer(true, true)
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        // Actualizar local
        await actualizarEnIndexedDB(JSON.parse(JSON.stringify(
            {
                Paciente: {
                    ...datos,
                    estado: 0,
                    sincronizado: 0
                }
            }
        )));
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'Sin conexión';
        notificacionesStore.options.texto = 'Se guardará localmente'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};