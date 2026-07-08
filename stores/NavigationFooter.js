import { defineStore } from "pinia";

// Store para manejar secciones del footer
export const useSeccionFooter = defineStore('subSecciones', {
    state: () => ({
        secciones: null,
        idActivo: 1
    }),
    getters: {
        // Obtiene el primer valor de secciones
        idActivoDefault: (state) => {
            if(state.idActivo === ''){
                state.idActivo = state.secciones?.[0]
            }
        }
    },

    actions: {
        // Cambia la seccion y la guarda en SessionStorage
        cambiarSecciones (subSecciones) {
            this.secciones = subSecciones ? subSecciones : null;
            sessionStorage.setItem('seccionesGuardadas', JSON.stringify(this.secciones));
        },
        // Obtiene las sacciones guardadas
        seccionesGuardadas () {
            const secciones = JSON.parse(sessionStorage.getItem('seccionesGuardadas'));
                if (secciones) {
                    this.cambiarSecciones(secciones);
                }
        },
        limpiar () {
            sessionStorage.removeItem('seccionesGuardadas')
        },
        cambiarIdActivo (pagina) {
            this.idActivo = parseInt(pagina)
            sessionStorage.setItem('seccionIdActivo', this.idActivo)
        }
    }
})