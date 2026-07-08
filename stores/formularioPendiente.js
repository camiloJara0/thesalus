import { defineStore } from "pinia";

// Store para manejar el estado de formulario pendiente por enviar en IndexedDB
export const useFormPendiente = defineStore('apiRest', {
    state: () => ({
        subirDespues: false,
    }),
})