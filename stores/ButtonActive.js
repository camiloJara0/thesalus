import { defineStore } from "pinia";
import { buttons } from '../data/Buttons'

// Store para botones del Aside
export const useButtonsAside = defineStore('ButtonsAside', {
    state: () => ({
        buttons: buttons,
        botonActivo: ''
    }),

    getters: {
        getbuttons: (state) => (permisosUsuario) => {
            // Normalizamos los permisos: quitamos el "_view"
            const permisosLimpiados = permisosUsuario.map(p => p.replace(/_view$/, ''));

            return state.buttons.map(button => {
                // Verificamos si el botón debe incluirse
                const incluirBoton = permisosLimpiados.includes(button.nombre);

                const seccionesFiltradas = button.secciones?.map(seccion => {
                    // Filtrar subSecciones si existen
                    let subSeccionesFiltradas = seccion.subSecciones?.filter(sub =>
                        permisosLimpiados.includes(sub.titulo)
                    );

                    // Verificar si se incluye la sección
                    const incluirSeccion = subSeccionesFiltradas?.length > 0 ||
                        permisosLimpiados.includes(seccion.titulo);

                    return incluirSeccion ? {
                        ...seccion,
                        ...(subSeccionesFiltradas && { subSecciones: subSeccionesFiltradas })
                    } : null;
                }).filter(Boolean);

                // Incluir el botón si tiene secciones visibles o permiso directo
                return seccionesFiltradas.length > 0 || incluirBoton ? {
                    ...button,
                    secciones: seccionesFiltradas
                } : null;
            }).filter(Boolean);
        }

    },

    actions: {
        activeButton(id) {
            this.buttons.forEach(button => {
                if (button.id == id) {
                    button.active = true;
                    sessionStorage.setItem('activeButton', id);
                } else {
                    button.active = false;
                };
            });
        },

        sessionActive() {
            const botonActivo = sessionStorage.getItem('activeButton');
            if (botonActivo) {
                this.activeButton(parseInt(botonActivo));
            } else {
                this.activeButton(null);
            }
        }
    }
});