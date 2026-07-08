import { useApiRest } from "~/stores/apiRest";

export const useAdministradorStore = defineStore('Administrador', {
    state: () => ({
        Formulario: {
            Administrador: {
                Usuario: {
                    correo: '',
                },
                info_usuario: {
                    id: '',
                    name: '',
                    No_document: '',
                    type_doc: '',
                    celular: '',
                    telefono: '',
                    nacimiento: '',
                    direccion: '',
                    municipio: '',
                    departamento: '',
                    barrio: '',
                    zona: '',
                },
                password: '',
                estado: 1,
            },
        },
        Administradores: [] // Lista de administradores
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            this.validar(datos.Administrador)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'POST',
                url: config.public.administrador,
                token: token,
                body: datos.Administrador
            }

            return await api.functionCall(options)
        },

        async actualizar(datos) {
            this.validar(datos.Administrador)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'PUT',
                url: `${config.public.administrador}/${datos.Administrador.id}`,
                token: token,
                body: datos.Administrador
            }

            return await api.functionCall(options)
        },

        async eliminar(id) {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'DELETE',
                url: `${config.public.administrador}/${id}`,
                token: token
            }

            return await api.functionCall(options)
        },

        async traer() {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            const online = navigator.onLine;
            if (online) {
                try {
                    let options = {
                        metodo: 'GET',
                        url: config.public.administrador,
                        token: token
                    }
                    const respuesta = await api.functionCall(options)
                    if (respuesta.success) {
                        this.Administradores = respuesta.data || [];
                        return this.Administradores;
                    }
                } catch (error) {
                    console.error('Fallo al traer administradores', error);
                }
            }
            return [];
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'name', 'No_document', 'type_doc', 'celular', 'nacimiento',
                'direccion', 'municipio', 'departamento', 'barrio', 'zona',
                'correo'
            ]

            const camposFaltantes = camposObligatorios.filter(campo => !datos.info_usuario[campo] || datos.info_usuario[campo].toString().trim() === '');

            if (camposFaltantes.length > 0 || !datos.Usuario.correo) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Datos incompletos';
                notificaciones.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
                notificaciones.options.tiempo = 6000;
                await notificaciones.simple();
                return false;
            }

            // 📞 Validar número de celular
            const celularRegex = /^\d{10}$/;
            if (!celularRegex.test(datos.info_usuario.celular)) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Celular inválido';
                notificaciones.options.texto = 'El número de celular debe tener 10 dígitos';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            // 📧 Validar formato de correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datos.Usuario.correo)) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Correo inválido';
                notificaciones.options.texto = 'El correo electrónico no tiene un formato válido';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        }

    }
});
