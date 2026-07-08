import { defineStore } from "pinia";

// Pinia Usuario
export const useUsuariosStore = defineStore('Usuario', {
    state: () => ({
        Formulario: {
            Usuario: {
                correo: '',
                contraseña: '',
                codigo: '',
                empresa: ''
            },
        },
        Usuarios: [],
        Permisos: [],
    }),

    getters: {

    },

    actions: {

        getUsuario() {
            if (typeof window === 'undefined') {
                console.log('No estás en el navegador.');
                return 'Usuario';
            }

            const Usuario = JSON.parse(localStorage.getItem('User'));
            console.log(Usuario)

            if (!Usuario) return 'Usuario';

            return Usuario.name.split(' ')[0] + ' ' + Usuario.split(' ')[1];
        },

    }
});


