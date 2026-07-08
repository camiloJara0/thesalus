import { useIndexedDBStore } from '~/stores/indexedDB';
import { traerdatosEPS } from '~/Core/Empresa/Datos/Eps/GETEps';
import { guardarEnDB } from '~/composables/Formulario/useIndexedDBManager';
// Creacion del store para registar eps

// Estructura de datos de eps
const estructuraDatosEPS = {
    EPS: {
        nombre: '',
        codigo: '',
        nit: '',
    }
}

// Pinia EPS
export const useDatosEPSStore = defineStore('DatosEPS', {
    state: () => ({
        Formulario: estructuraDatosEPS,
        Datos: JSON.parse(JSON.stringify(estructuraDatosEPS)), // estructura base compartida
        EPSs: []
    }),

    getters: {
        // async listEPS(state) {
        //     const apiRest = useApiRest()
        //     const EPS = await apiRest.getData('EPS', 'eps')

        //     const EPSActivas = EPS.filter(p => p.estado === 1)
        //     state.EPSs = EPSActivas
        //     return EPSActivas
        // },
    },

    actions: {

        async listEPS(online = true) {
            const apiRest = useApiRest()
            const store = useIndexedDBStore()
            
            let EPS = ''
            if(online){
                EPS = await apiRest.getData('EPS', 'eps')
            } else {
                store.almacen = 'EPS'
                EPS = await store.leerdatos()
            }

            const EPSActivas = EPS.filter(p => p.estado === 1)
            this.EPSs = EPSActivas
            return EPSActivas
        },

        async indexDBDatos() {
            const api = useApiRest()
            await api.getData('EPS', 'eps')        
        },
    }
});