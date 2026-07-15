
import { traerProfesionales } from "~/Core/Profesional/GETProfesionales";
import { guardarProfesional } from "~/Core/Profesional/POSTMedico";
import { editarProfesional } from "~/Core/Profesional/PUTMedico";
import { eliminarProfesional } from "~/Core/Profesional/DELETEMedico";

// Pinia Medicos
export const useProfesionalStore = defineStore('Profesional', {
    state: () => ({
        Formulario: {
            Profesional: {
                user: {
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
                departamento_laboral: '',
                municipio_laboral: '',
                zona_laboral: '',
                profesion: {
                    id: ''
                },
                id_profesion: '',
                correoProfesional: '',
                estado: 1,
            },
        },
        Profesionales: [], // Lista de profesionales
        NoEnviados: [],
        showModificarOffline: false,
        showNuevoProfesional: false,
        showModificarProfesional: false
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            const validacion = this.validar(datos)
            if(validacion) {
                return await guardarProfesional(datos.Profesional);
            }
        },

        async actualizar(datos) {
            const validacion = this.validar(datos)
            if(validacion) {
                return await editarProfesional(datos.Profesional);
            }
        },

        async eliminar(datos) {
            return await eliminarProfesional(datos);
        },

        async traer(online = true, cambio = false) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();
            
            indexedDB.almacen = 'Profesional';
            const refrescar = await indexedDB.necesitaRefrescar('Profesional');
            
            let profesionales;

            if ((online && refrescar) || cambio) {
                // Traer de API
                profesionales = await traerProfesionales();
                await apiRest.postOfflineData('Profesional', profesionales);
            } else {
                // Traer de IndexedDB
                profesionales = await apiRest.getOfflineData('Profesional');
            }

            this.Profesionales = profesionales;
            return this.Profesionales;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Profesional'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Profesional'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {

                const data = this.NoEnviados[i]
                let res = false
                if (data.editado == 1 && data.estado == 0){
                    res = await eliminarProfesional( data.id )
                } else if (data.editado == 1){
                    res = editarProfesional(data)
                } else {
                    res = await guardarProfesional(data)
                }
                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            await this.traer(true, true)
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'name', 'No_document', 'type_doc', 'celular', 'nacimiento',
                'direccion', 'municipio', 'departamento', 'barrio', 'zona',
                'id_profesion', 'departamento_laboral', 'municipio_laboral', 'zona_laboral',
                'correo'
            ]

            const cuerpo = {
                ...datos.Profesional.info_usuario,
                ...datos.Profesional.user,
                ...datos.Profesional,
            };

            const camposFaltantes = camposObligatorios.filter(campo => {
                const valor = cuerpo[campo];
                return valor === undefined || valor === null || valor === '';
            });

            if (camposFaltantes.length > 0) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Datos incompletos';
                notificaciones.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
                notificaciones.options.tiempo = 6000;
                await notificaciones.simple();
                return false;
            }

            // 📞 Validar número de celular
            const celularRegex = /^\d{10}$/;
            if (!celularRegex.test(datos.Profesional.info_usuario.celular)) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Celular inválido';
                notificaciones.options.texto = 'El número de celular debe tener 10 dígitos';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            // 📧 Validar formato de correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datos.Profesional.user.correo)) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Correo inválido';
                notificaciones.options.texto = 'El correo electrónico no tiene un formato válido';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

        }

    }
});