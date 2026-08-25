import { useApiRest } from "~/stores/apiRest";
import { decryptData } from '~/composables/Formulario/crypto';

export const useTipoEquipoStore = defineStore('TipoEquipo', {
    state: () => ({
        Formulario: {
            Tipo_equipo: {
                nombre: '',
                descripcion: ''
            }
        },
        TipoEquipos: [],
    }),

    getters: {},

    actions: {
        async guardar(datos) {
            const validate = await this.validar(datos.Tipo_equipo)
            if (!validate) return false

            const api = useApiRest()
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            const online = navigator.onLine;
            if (online) {
                try {
                    let options = {
                        metodo: 'POST',
                        url: config.public.tipoEquipos,
                        token: token,
                        body: datos.Tipo_equipo
                    }
                    const respuesta = await api.functionCall(options)
                    return respuesta.success
                } catch (error) {
                    console.error('Error al guardar tipo de equipo', error)
                    return false
                }
            } else {
                const notificacionesStore = useNotificacionesStore()
                notificacionesStore.options.icono = 'warning'
                notificacionesStore.options.titulo = 'Sin conexión'
                notificacionesStore.options.texto = 'No se puede guardar sin conexión a internet'
                notificacionesStore.options.tiempo = 3000
                await notificacionesStore.simple()
                return false
            }
        },

        async validar(datos) {
            const notificaciones = useNotificacionesStore()

            if (!datos.nombre || datos.nombre.trim() === '') {
                notificaciones.options.icono = 'error'
                notificaciones.options.titulo = 'Datos incompletos'
                notificaciones.options.texto = 'El nombre del tipo de equipo es obligatorio'
                notificaciones.options.tiempo = 4000
                await notificaciones.simple()
                return false
            }

            if (datos.nombre.length < 3) {
                notificaciones.options.icono = 'error'
                notificaciones.options.titulo = 'Nombre inválido'
                notificaciones.options.texto = 'El nombre debe tener mínimo 3 caracteres'
                notificaciones.options.tiempo = 4000
                await notificaciones.simple()
                return false
            }

            return true
        }
    }
});
