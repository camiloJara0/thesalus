import { traerCie10 } from "~/Core/Codigos/GetCie10";

export const useCie10Store = defineStore('Cie10', {
    state: () => ({
        Formulario: {
            Cie10: {
                id: '',
                codigo: '',
                nombre: '',
            }
        },
        Cie10: []
    }),

    getters: {},

    actions: {
        async listCie10(online = true) {
            const apiRest = useApiRest()
            let cie10 = []

            if (online) {
                const cie10Data = await traerCie10()
                if (cie10Data && Array.isArray(cie10Data)) {
                    cie10 = cie10Data
                }
            }

            this.Cie10 = cie10
            return cie10
        },

        async guardarCie10(formData) {
            const { guardarCie10 } = await import('~/Core/Codigos/PostCie10')
            return await guardarCie10(formData.Cie10)
        },

        async eliminarCie10(id) {
            const { eliminarCie10 } = await import('~/Core/Codigos/DeleteCie10')
            return await eliminarCie10(id)
        },
    }
})
