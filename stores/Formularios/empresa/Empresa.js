import { traerdatosEmpresa } from "~/Core/Empresa/Configuracion/Empresa/GETEmpresa";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";

// Estructura de datos de Empresa
const estructura = {
    Empresa: {
        nombre: '',
        logo: '',
        logoLogin: '',
        JPG: '',
        no_identificacion: '',
        DV: '',
        registroMercantil: '',
        direccion: '',
        telefono: '',
        lenguaje: '',
        impuesto: '',
        pais: '',
        tipoDocumento: '',
        tipoOperacion: '',
        tipoEntorno: '',
        tipoMoneda: '',
        tipoOrganizacion: '',
        municipio: '',
        tipoResponsabilidad: '',
        tipoRegimen: '',
    },
}

// Pinia Empresa
export const useEmpresaStore = defineStore('Empresa', {
    state: () => ({
        Formulario: estructura,
        Empresa: JSON.parse(JSON.stringify(estructura)), // estructura base compartida
        Empresas: []
    }),

    getters: {

    },

    actions: {
        async listEmpresas () {
            const store = useIndexedDBStore();
            store.almacen = 'Empresa';
            let empresas = await store.leerdatos();

            this.Empresas = empresas;
            return empresas;
        },


        async indexDBDatos() {
            const api = useApiRest()
            const empresa = await api.getData('Empresa', 'empresas')
            this.Formulario.Empresa = empresa[0]

        },
    }
});