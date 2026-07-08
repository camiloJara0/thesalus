// Estructura de datos de Software nomina
const estructura = {
    Software: {
        Nomina: {
            id: '',
            pin: '',
            testID: '',
        },
    },
}

// Pinia Empresa
export const useNominaStore = defineStore('SoftwareNomina', {
    state: () => ({
        Formulario: estructura,
        Software: JSON.parse(JSON.stringify(estructura)), // estructura base compartida
        SoftwareData: []
    }),

    getters: {

    },

    actions: {
    }
});