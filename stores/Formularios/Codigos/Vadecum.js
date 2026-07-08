import { traerVadecum } from "~/Core/Codigos/GetVadecum";

export const useVadecumStore = defineStore('Vadecum', {
    state: () => ({
        Formulario: {
            Vadecum: {
                id: '',
                expediente: '',
                producto: '',
                titular: '',
                registrosanitario: '',
                fechaexpedicion: '',
                fechavencimiento: '',
                estadoregistro: '',
                expedientecum: '',
                consecutivocum: '',
                cantidadcum: '',
                descripcioncomercial: '',
                estadocum: '',
                fechaactivo: '',
                fechainactivo: '',
                muestramedica: '',
                unidad: '',
                atc: '',
                descripcionatc: '',
                viaadministracion: '',
                concentracion: '',
                principioactivo: '',
                unidadmedida: '',
                cantidad: '',
                unidadreferencia: '',
                formafarmaceutica: '',
                nombrerol: '',
                tiporol: '',
                modalidad: '',
                IUM: '',
            }
        },
        Vadecum: []
    }),

    getters: {},

    actions: {
        async listVadecum(online = true) {
            const apiRest = useApiRest()
            let vadecum = []

            if (online) {
                const vadecumData = await traerVadecum()
                if (vadecumData && Array.isArray(vadecumData)) {
                    vadecum = vadecumData
                }
            }

            this.Vadecum = vadecum
            return vadecum
        },

        async guardarVadecum(formData) {
            const { guardarVadecum } = await import('~/Core/Codigos/PostVadecum')
            return await guardarVadecum(formData.Vadecum)
        },

        async eliminarVadecum(id) {
            const { eliminarVadecum } = await import('~/Core/Codigos/DeleteVadecum')
            return await eliminarVadecum(id)
        },
    }
})
