import { defineStore } from "pinia";
import { useIndexedDBStore } from "~/stores/indexedDB";

// Store para loader
export const useExcelExport = defineStore('exportExcel', {
    state: () => ({
        cargando: false,
    }),
    actions: {

        async obtenerDatos(tabla) {
            const storeIndexDB = useIndexedDBStore();
            storeIndexDB.almacen = tabla;
            const tablaAtraer = await storeIndexDB.leerdatos();

            return tablaAtraer;
        },

        async obtenerTabla(datos, tabla, id_comparar, id_compararTabla) {
            const storeIndexDB = useIndexedDBStore();
            storeIndexDB.almacen = tabla;
            const tablaAtraer = await storeIndexDB.leerdatos();

            // Mapear cada dato y agregarle los datos de la tabla correspondiente
            const datosCombinados = datos.map(dato => {
                const row = tablaAtraer.find(fila => fila[id_compararTabla] === dato[id_comparar]);
                return row ? { ...dato, ...row } : dato; // Añade info de la tabla si se encuentra
            });

            return datosCombinados;
        },

        async obtenerCamposTabla(tabla) {
            const storeIndexDB = useIndexedDBStore();
            storeIndexDB.almacen = tabla;
            const tablaAtraer = await storeIndexDB.leerdatos();

            const datos = Object.keys(tablaAtraer[0])

            const datosOptionsTabla = datos.map((dato) => {
                return {text: dato, value: dato}
            })
            return datosOptionsTabla;
        },
    }
})
