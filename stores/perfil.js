import { decryptData } from '~/composables/Formulario/crypto';

export const usePerfilStore = defineStore('Perfil', {
    state: () => ({
        perfil: null,
        cargado: false,
    }),

    getters: {
        rol: (state) => state.perfil?.rol || null,
        usuario: (state) => state.perfil?.usuario || null,
        correo: (state) => state.perfil?.correo || null,
        profesional: (state) => state.perfil?.profesional || null,
        esProfesional: (state) => state.perfil?.rol === 'Profesional',
        tieneSello: (state) => Boolean(state.perfil?.profesional?.sello),
    },

    actions: {
        async cargar(force = false) {
            if (this.cargado && !force) return this.perfil

            const api = useApiRest();
            const config = useRuntimeConfig();
            const token = decryptData(localStorage.getItem('token'));

            try {
                const respuesta = await api.functionCall({
                    metodo: 'GET',
                    url: config.public.miPerfil,
                    token: token,
                });

                if (respuesta?.success) {
                    this.perfil = respuesta;
                    this.cargado = true;
                }
            } catch (error) {
                console.error('Error al cargar el perfil:', error);
            }

            return this.perfil;
        },

        limpiar() {
            this.perfil = null;
            this.cargado = false;
        },
    },
});
