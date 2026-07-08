import { traerFacturacion } from "~/Core/Empresa/Facturacion/GETFacturacion";
import { guardarEnDB } from "~/composables/Formulario/useIndexedDBManager";

// Estructura de datos de Facturacion
const estructura = {
    Facturacion: {
        tipoDocumento: '',
        prefijo: '',
        no_resolucion: '',
        fechaResolucion: '',
        fechaInicial: '',
        fechaHasta: '',
        numeroInicial: '',
        numeroHasta: '',
        claveTecnica: '',
        descripcion: '',
    },
}

// Pinia Empresa
export const useFacturacionStore = defineStore('Facturacion', {
    state: () => ({
        Formulario : estructura,
        FacturacionData: []
    }),

    getters: {
        async listResoluciones(state) {
            const store = useIndexedDBStore()
            store.almacen = 'Facturacion'
            const datos = await store.leerdatos()

            state.FacturacionData = datos // Actualiza la lista de pacientes en el estado
            return datos
        },
    },

    actions: {
        async indexDBDatos() {
            const facturaciones = await traerFacturacion()
            const facturacionesLocal = await this.listResoluciones

            // Crear un conjunto de IDs locales para comparación rápida
            const ids = new Set(
                facturacionesLocal.map(data => data.id)
            );

            const facturacionesIndexed = facturaciones.map((data) => ({
                Facturacion: {
                    id: data.id,
                    tipoDocumento: data.tipoDocumento,
                    prefijo: data.prefijo,
                    no_resolucion: data.no_resolucion,
                    fechaResolucion: data.fechaResolucion,
                    fechaInicial: data.fechaInicial,
                    fechaHasta: data.fechaHasta,
                    numeroInicial: data.numeroInicial,
                    numeroHasta: data.numeroHasta,
                    claveTecnica: data.claveTecnica,
                    descripcion: data.descripcion,
                },
            }));

            // Filtrar los que no están en local
            const nuevasFacturaciones = facturacionesIndexed.filter(item => {
                const key = item.Facturacion.id;
                return !ids.has(key);
            });

            // Guardar solo los nuevos
            nuevasFacturaciones.forEach(item => {
                guardarEnDB(item);
            });
        },
    }
});