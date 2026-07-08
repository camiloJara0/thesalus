
// Estructura de datos de Profesion
const estructuraDatosServicio = {
    Servicio: {
        name: '',
        plantilla: '',
    }
}

// Pinia Servicio
export const useDatosServicioStore = defineStore('DatosServicio', {
    state: () => ({
        Formulario: estructuraDatosServicio,
        Datos: JSON.parse(JSON.stringify(estructuraDatosServicio)), // estructura base compartida
        Servicios: []
    }),

    getters: {

    },

    actions: {
        async listServicios() {
            const apiRest = useApiRest()
            const Servicios = await apiRest.getData('Servicio', 'servicios')

            this.Servicios = Servicios
            return Servicios
        },

    }
});