import { eliminarConvenio } from "~/Core/Convenios/DeleteConvenios";
import { traerConvenios } from "~/Core/Convenios/GetConvenios";
import { guardarConvenio } from "~/Core/Convenios/PostConvenios";
import { useApiRest } from "~/stores/apiRest";
import { useIndexedDBStore } from "~/stores/indexedDB";

export const useConvenioStore = defineStore('Convenio', {
    state: () => ({
        Formulario: {
            Convenio: {
                nombre: '',
                logo: '',
                estado: 1,
            },
        },
        Convenios: [], // Lista de convenios
        ConveniosNoEnviados: [],
        showNuevoConvenio: false,
        showModificarConvenio: false
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            const validar = await this.validar(datos)
            if(validar) {
                return await guardarConvenio(datos)
            }
        },

        async actualizar(datos) {
            const validar = await this.validar(datos)
            if(validar){
                return await guardarConvenio(datos)
            }
        },

        async eliminar(id) {
            return await eliminarConvenio(id)
        },

        async traer(online = true, cambio = false) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();
            
            indexedDB.almacen = 'Convenio';
            const refrescar = await indexedDB.necesitaRefrescar('Convenio');
            
            let convenios;

            if ((online && refrescar) || cambio) {
                // Traer de API
                convenios = await traerConvenios();
                await apiRest.postOfflineData('Convenio', convenios);
            } else {
                // Traer de IndexedDB
                convenios = await apiRest.getOfflineData('Convenio');
            }

            this.Convenios = convenios || [];
            return this.Convenios;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Convenio'
            this.ConveniosNoEnviados = await store.leerNoEnviados()
            return this.ConveniosNoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Convenio'
            const online = navigator.onLine;
            if (this.ConveniosNoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.ConveniosNoEnviados.length; i++) {
                const data = this.ConveniosNoEnviados[i]

                let res = false
                if (data.editado == 1 && data.estado == 0){
                    res = await eliminarConvenio( data.id )
                } else if (data.editado == 1){
                    res = guardarConvenio(data)
                } else {
                    res = await guardarConvenio(data)
                }

                    indexedDB.borrardato(data.id)

            }

            await this.traer(true, true)
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'nombre'
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
                notificaciones.options.texto = 'El nombre del convenio debe tener mínimo 5 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        }

    }
});
