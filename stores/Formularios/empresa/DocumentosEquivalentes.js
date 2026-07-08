// Estructura de datos de DocumentosEquivalentes
const estructura = {
    Software: {
        Equivalentes: {
            id: '',
            pin: '',
            testID: '',
        },
    },
}

// Pinia Empresa
export const useSoftwareDEStore = defineStore('SoftwareDE', {
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