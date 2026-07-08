import { traerSoftware } from "~/Core/Empresa/Configuracion/Software/GETSoftware";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";

// Estructura de datos de Software
const estructura = {
    Software: {
        Dian: {
            id: '',
            pin: '',
            testID: '',
        },
    },
}

// Pinia Empresa
export const useSoftwareStore = defineStore('Software', {
    state: () => ({
        Formulario: estructura,
        Software: JSON.parse(JSON.stringify(estructura)), // estructura base compartida
        SoftwareData: []
    }),

    getters: {

    },

    actions: {

        async listSoftware() {
            const store = useIndexedDBStore();
            store.almacen = 'Software';
            let Software = await store.leerdatos();

            this.SoftwareData = Software;
            return Software;
        },

        async indexDBDatos() {
            const software = await traerSoftware()
            const softwareLocal = await this.listSoftware()

            // Crear un conjunto de IDs locales para comparación rápida
            const ids = new Set(
                softwareLocal.map(data => data.id)
            );

            const softwareIndexed = software.map((data) => ({
                Software: {
                    id: data.id,
                    Tipo: data.Tipo,
                    idSoftware: data.idSoftware,
                    pin: data.pin,
                    testID: data.testID,
                },
            }));

            // Filtrar los que no están en local
            const nuevosSoftware = softwareIndexed.filter(item => {
                const key = item.Software.id;
                return !ids.has(key);
            });

            // Guardar solo los nuevos
            nuevosSoftware.forEach(item => {
                guardarEnDB(item);
            });
        },
    }
});