import { defineStore } from "pinia";

export const useIndexedcrud = defineStore("indexeddb", { id: 'indexeddb',
    // state
    state: () => {
        return {
            indexpaciente : false,
            indexdiagnostico : false,
            indexantecedente : false,
            indexenfermedadactual : false,
            indexhistoriaclinica : false,
            indexexamenfisico : false,
            indexanalisistratamiento : false,
            indexmedicamentos : false,
            indexprocedimentos : false,
            inicia : false,
            tipo : 'GET',
            datoscrud : []
        };
    },

})