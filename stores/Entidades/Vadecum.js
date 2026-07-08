import { useApiRest } from "~/stores/apiRest";
import { useIndexedDBStore } from "~/stores/indexedDB";
import { decryptData } from '~/composables/Formulario/crypto';
import { guardarVadecum } from "~/Core/Codigos/PostVadecum";
import { eliminarVadecum } from "~/Core/Codigos/DeleteVadecum";

export const useVadecumStore = defineStore('Vadecum', {
    state: () => ({
        Formulario: {
            Vadecum: {
                expediente: '',
                producto: '',
                titular: '',
                unidad: '',
                registrosanitario: '',
                fechaexpedicion: '',
                fechavencimiento: '',
                estado: 1,
            },
        },
        Vadecum: [], // Lista de códigos Vademecum
        NoEnviados: [],
        showNuevoVadecum: false,
        showModificarVadecum: false
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            this.validar(datos.Vadecum)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'POST',
                url: config.public.vademecum,
                token: token,
                body: datos.Vadecum
            }

            return await api.functionCall(options)
        },

        async actualizar(datos) {
            this.validar(datos.Vadecum)
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'PUT',
                url: `${config.public.vademecum}/${datos.Vadecum.id}`,
                token: token,
                body: datos.Vadecum
            }

            return await api.functionCall(options)
        },

        async eliminar(id) {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'DELETE',
                url: `${config.public.vademecum}/${id}`,
                token: token
            }

            return await api.functionCall(options)
        },

        async traer(online = true, cambio = false) {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();
            
            indexedDB.almacen = 'Vadecum';
            const refrescar = await indexedDB.necesitaRefrescar('Vadecum');
            
            let vadecum;

            if ((online && refrescar) || cambio) {
                // Traer de API
                try {
                    let options = {
                        metodo: 'GET',
                        url: config.public.vadecum,
                        token: token
                    }
                    const respuesta = await api.functionCall(options)
                    if (respuesta.success) {
                        vadecum = respuesta.data || [];
                        await apiRest.postOfflineData('Vadecum', vadecum);
                    }
                } catch (error) {
                    console.error('Fallo al traer vademecum', error);
                    vadecum = [];
                }
            } else {
                // Traer de IndexedDB
                vadecum = await apiRest.getOfflineData('Vadecum');
            }

            this.Vadecum = vadecum || [];
            return this.Vadecum;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Vadecum'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Vadecum'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                const data = this.NoEnviados[i]
                
                let res = false
                if (data.editado == 1 && data.estado == 0){
                    res = await eliminarVadecum( data.id )
                } else if (data.editado == 1){
                    res = guardarVadecum(data)
                } else {
                    res = await guardarVadecum(data)
                }

                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            await this.traer(true, true)
        },

        async validar (datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'producto'
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

            return true;
        }

    }
});
