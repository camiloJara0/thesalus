import { defineStore } from "pinia";
import { useIndexedDBStore } from "../../indexedDB";

// Pinia Users
export const useUsersStore = defineStore('Users', {
    state: () => ({
        Formulario: {
            InformacionUser: {
                id_usuario: '',
                name: '',
                No_document: '',
                type_doc: '',
                tipo: '',
                celular: '',
                telefono: '',
                nacimiento: '',
                direccion: '',
                municipio: '',
                departamento: '',
                barrio: '',
                zona: '',
            },
            User: {
                correo: '',
                rol: '',
                contraseña: ''
            }
        },
        Users: []
    }),

    getters: {
    },
    
    actions: {
        async listUsers() {
            const apiRest = useApiRest()
    
            const usuarios = await apiRest.getData('InformacionUser', 'informacionUsers')
            this.Users = usuarios
            return usuarios
        },
        
        async indexDBDatos() {
            const apiRest = useApiRest()
            await apiRest.getData('InformacionUser', 'informacionUsers')
        },
        
    }
});


