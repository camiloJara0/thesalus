import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

export const enviarTrabajoSocial = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const varView = useVarView()
    const citasStore = useCitasStore();
    citasStore.mesCitaGuardada = datos.Analisis.Cita.fecha;

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.historiasClinicasTrabajoSocial,
                token: token,
                body: datos.Analisis
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                varView.propiedadesPDF = {
                    id: respuesta.Analisis.id,
                    servicio: 'Trabajo Social'
                }
                varView.showPDFServicio = true
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {

        try {
            await guardarEnDB(JSON.parse(JSON.stringify({Analisis: {...datos.Analisis, sincronizado: 0}})))
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};