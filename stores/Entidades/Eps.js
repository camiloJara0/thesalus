import { traerdatosEPS } from "~/Core/Empresa/Datos/Eps/GETEps";
import { useApiRest } from "~/stores/apiRest";
import { useIndexedDBStore } from "~/stores/indexedDB";
import { enviarEps } from "~/Core/Empresa/Datos/Eps/POSTEps";
import { actualizarEps } from "~/Core/Empresa/Datos/Eps/PUTEps";
import { eliminarEps } from "~/Core/Empresa/Datos/Eps/DELETEEps";

export const useEpsStore = defineStore('Eps', {
    state: () => ({
        Formulario: {
            EPS: {
                nombre: '',
                codigo: '',
                nit: '',
                estado: 1,
            },
        },
        Eps: [], // Lista de EPS
        showNuevaEps: false,
        showModificarEps: false,
        EpsNoEnviados: []
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            const validate = await this.validar(datos.EPS)
            if(validate){
                return await enviarEps(datos)
            }
        },

        async actualizar(datos) {
            const validate = this.validar(datos.EPS)
            if(validate){
                return await actualizarEps(datos)
            }
        },

        async eliminar(datos) {
            return await eliminarEps(datos)
        },

        async traer(online = true, cambio = false) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();
            
            indexedDB.almacen = 'EPS';
            const refrescar = await indexedDB.necesitaRefrescar('EPS');
            let eps;

            if ((online && refrescar) || cambio) {
                // Traer de API
                eps = await traerdatosEPS();
                await apiRest.postOfflineData('EPS', eps);
            } else {
                // Traer de IndexedDB
                eps = await apiRest.getOfflineData('EPS');
            }

            this.Eps = eps || [];
            return this.Eps;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'EPS'
            this.EpsNoEnviados = await store.leerNoEnviados()
            return this.EpsNoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'EPS'
            const online = navigator.onLine;
            if (this.EpsNoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.EpsNoEnviados.length; i++) {
                let res = false
                if (this.EpsNoEnviados[i].editado == 1 && this.EpsNoEnviados[i].estado == 0){
                    res = await eliminarEps({ EPS: this.EpsNoEnviados[i] })
                } else if (this.EpsNoEnviados[i].editado == 1){
                    res = actualizarEps({ EPS: this.EpsNoEnviados[i] })
                } else {
                    res = await enviarEps({ EPS: this.EpsNoEnviados[i] })
                }

                indexedDB.borrardato(this.EpsNoEnviados[i].id)
            }

            await this.traer(true, true)
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'nombre', 'codigo', 'nit'
            ]

            const camposFaltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

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
                notificaciones.options.texto = 'El nombre de la EPS debe tener mínimo 5 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            // 📋 Validar que el código tenga mínimo 2 caracteres
            if (datos.codigo.length < 2) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Código inválido';
                notificaciones.options.texto = 'El código debe tener mínimo 2 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        }

    }
});
