import { eliminarServicio } from "~/Core/Codigos/DeleteServicio";
import { traerServicios } from "~/Core/Codigos/getServicios";
import { enviarServicio } from "~/Core/Codigos/PostServicio";
import { actualizarServicio } from "~/Core/Codigos/PutServicio";
import { useApiRest } from "~/stores/apiRest";

export const useServicioStore = defineStore('Servicio', {
    state: () => ({
        Formulario: {
            Servicio: {
                name: '',
                plantilla: '',
                estado: 1,
            },
        },
        Servicios: [], // Lista de servicios
        NoEnviados: [],
        showNuevoServicio: false,
        showModificarServicio: false,
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            const validar = await this.validar(datos.Servicio)
            if(validar){
                return enviarServicio(datos)
            }
        },

        async actualizar(datos) {
            const validar = await this.validar(datos.Servicio)
            if(validar){
                return actualizarServicio(datos)
            }
        },

        async eliminar(datos) {
            return await eliminarServicio(datos)
        },

        async traer(online = true, cambio) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();
            
            indexedDB.almacen = 'Servicio';
            const refrescar = await indexedDB.necesitaRefrescar('Servicio');
            
            let servicios;

            if ((online && refrescar) || cambio) {
                // Traer de API
                servicios = await traerServicios();
                await apiRest.postOfflineData('Servicio', servicios);
            } else {
                // Traer de IndexedDB
                servicios = await apiRest.getOfflineData('Servicio');
            }

            this.Servicios = servicios || [];
            return this.Servicios;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Servicio'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Servicio'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                const data = this.NoEnviados[i]
                
                let res = false
                if (data.editado == 1 && data.estado == 0){
                    res = await eliminarServicio( data )
                } else if (data.editado == 1){
                    res = actualizarServicio({ Servicio: data })
                } else {
                    res = await enviarServicio({ Servicio: data })
                }

                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            await this.traer(true, true)
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'name', 'plantilla'
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
            if (datos.name.length < 5) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Nombre inválido';
                notificaciones.options.texto = 'El nombre del servicio debe tener mínimo 5 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        }

    }
});
