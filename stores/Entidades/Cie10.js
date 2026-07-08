import { eliminarCie10 } from "~/Core/Codigos/DeleteCie10";
import { traerCie10 } from "~/Core/Codigos/GetCie10";
import { guardarCie10 } from "~/Core/Codigos/PostCie10";
import { useApiRest } from "~/stores/apiRest";
import { useIndexedDBStore } from "~/stores/indexedDB";

export const useCie10Store = defineStore('Cie10', {
    state: () => ({
        Formulario: {
            Cie10: {
                codigo: '',
                nombre: '',
                estado: 1,
            },
        },
        Cie10: [], // Lista de códigos CIE-10
        NoEnviados: [],
        showNuevoCie10: false,
        showModificarCie10: false
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            const validar = this.validar(datos.Cie10)
            if(validar) {
                return await guardarCie10(datos)
            }
        },

        async actualizar(datos) {
            const validar = this.validar(datos.Cie10)
            if(validar) {
                return await guardarCie10(datos)
            }
        },

        async eliminar(id) {
            return await eliminarCie10(id)
        },

        async traer(online = true, cambio = false) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();
            
            indexedDB.almacen = 'Cie10';
            const refrescar = await indexedDB.necesitaRefrescar('Cie10');
            
            let cie10;

            if ((online && refrescar) || cambio) {
                // Traer de API
                cie10 = await traerCie10();
                await apiRest.postOfflineData('Cie10', cie10);
            } else {
                // Traer de IndexedDB
                cie10 = await apiRest.getOfflineData('Cie10');
            }

            this.Cie10 = cie10 || [];
            return this.Cie10;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Cie10'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Cie10'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                const data = this.NoEnviados[i]

                let res = false
                if (data.editado == 1 && data.estado == 0){
                    res = await eliminarCie10( data.id )
                } else if (data.editado == 1){
                    res = guardarCie10(data)
                } else {
                    res = await guardarCie10(data)
                }
                
                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            await this.traer(true, true)
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'codigo', 'nombre'
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

            // 📋 Validar que el código tenga entre 3 y 10 caracteres
            if (datos.codigo.length < 3 || datos.codigo.length > 10) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Código inválido';
                notificaciones.options.texto = 'El código debe tener entre 3 y 10 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            // 📋 Validar que el nombre tenga entre 3 y 255 caracteres
            if (datos.nombre.length < 3 || datos.nombre.length > 255) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Nombre inválido';
                notificaciones.options.texto = 'El nombre debe tener entre 3 y 255 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        }

    }
});
