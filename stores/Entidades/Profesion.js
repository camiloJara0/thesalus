import { eliminarProfesion } from "~/Core/Empresa/Datos/Profesion/DELETEProfesion";
import { traerdatosProfesion } from "~/Core/Empresa/Datos/Profesion/GETProfesion";
import { traerdatosSecciones } from "~/Core/Empresa/Datos/Profesion/GETSecciones";
import { enviarProfesion } from "~/Core/Empresa/Datos/Profesion/POSTProfesion";
import { actualizarProfesion } from "~/Core/Empresa/Datos/Profesion/PUTProfesion";
import { useApiRest } from "~/stores/apiRest";
import { useIndexedDBStore } from "~/stores/indexedDB";

export const useProfesionStore = defineStore('Profesion', {
    state: () => ({
        Formulario: {
            Profesion: {
                nombre: '',
                codigo: '',
                ListaPacientes: false,
                Diagnosticos_view: false,
                permisos: [],
                estado: 1,
            },
        },
        Profesiones: [], // Lista de profesiones
        showNuevaProfesion: false,
        showModificarProfesion: false,
        ProfesionNoEnviados: []
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            const validar = this.validar(datos.Profesion)
            if(validar) {
                return await enviarProfesion(datos)
            }
        },

        async actualizar(datos) {
            const validar = this.validar(datos.Profesion)
            if(validar) {
                return await actualizarProfesion(datos)
            }
        },

        async eliminar(datos) {
            return eliminarProfesion(datos)
        },

        async traer(online = true, cambio = false) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();
            
            indexedDB.almacen = 'Profesion';
            const refrescar = await indexedDB.necesitaRefrescar('Profesion');
            
            let profesiones;

            if ((online && refrescar) || cambio) {
                // Traer de API
                profesiones = await traerdatosProfesion();
                await apiRest.postOfflineData('Profesion', profesiones);
            } else {
                // Traer de IndexedDB
                profesiones = await apiRest.getOfflineData('Profesion');
            }

            this.Profesiones = profesiones || [];
            return this.Profesiones;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Profesion'
            this.ProfesionNoEnviados = await store.leerNoEnviados()
            return this.ProfesionNoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Profesion'
            const online = navigator.onLine;
            if (this.ProfesionNoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.ProfesionNoEnviados.length; i++) {
                const res = await enviarProfesion({ Profesion: this.ProfesionNoEnviados[i] })


                    indexedDB.borrardato(this.ProfesionNoEnviados[i].id)

            }

            await this.traer(true, true)
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'nombre', 'permisos'
            ]

            const camposFaltantes = camposObligatorios.filter(campo => !datos[campo] || (Array.isArray(datos[campo]) && datos[campo].length === 0) || datos[campo].toString().trim() === '');

            if (camposFaltantes.length > 0) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Datos incompletos';
                notificaciones.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
                notificaciones.options.tiempo = 6000;
                await notificaciones.simple();
                return false;
            }

            // 📋 Validar que el nombre tenga mínimo 5 caracteres
            if (datos.nombre.length < 5) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Nombre inválido';
                notificaciones.options.texto = 'El nombre de la profesión debe tener mínimo 5 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        },

        async listSecciones() {
            let permisos = await traerdatosSecciones()
            const mapa = {}

            permisos.forEach(({ id, nombre }) => {
                if (nombre === 'Diagnosticos_view' || nombre === 'ListaPacientes') return
                const [modulo, accion] = nombre.split('_')

                if (!mapa[modulo]) {
                mapa[modulo] = {
                    modulo,
                    acciones: []
                }
                }

                mapa[modulo].acciones.push({
                id,
                key: accion,
                nombre: `${modulo}_${accion}`
                })
            })

            return Object.values(mapa)
        },

        async traerPermisos(id) {
            let permisos = await traerdatosSecciones(id)
            return Object.values(permisos)
        },

    }
});
