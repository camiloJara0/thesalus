import { traerConvenios } from "~/Core/Convenios/GetConvenios";

export const useConvenioStore = defineStore('Convenio', {
    state: () => ({
        Formulario: {
            Convenio: {
                id: '',
                logo: '',
                nombre: '',
                estado: 1,
                pacientes_ids: []
            }
        },
        Convenios: []
    }),

    getters: {},

    actions: {
        // async listConvenios(online = true) {
        //     const apiRest = useApiRest()
        //     let convenios = []

        //     if (online) {
        //         const conveniosData = await traerConvenios()
        //         if (conveniosData && Array.isArray(conveniosData)) {
        //             convenios = conveniosData
        //         }
        //     }

        //     this.Convenios = convenios
        //     return convenios
        // },

        // async guardarConvenio(formData) {
        //     const { guardarConvenio } = await import('~/Core/Convenios/PostConvenios')
        //     return await guardarConvenio(formData.Convenio)
        // },

        // async eliminarConvenio(id) {
        //     const { eliminarConvenio } = await import('~/Core/Convenios/DeleteConvenios')
        //     return await eliminarConvenio(id)
        // },
    }
})
