import { defineStore } from "pinia";
import { useIndexedDBStore } from "../indexedDB";
import { enviarVadecums } from "~/Core/Vadecums/PostVadecums";
import { eliminarCategoria } from "~/Core/Vadecums/DeleteCategoria";
import { traerVadecums } from "~/Core/Vadecums/GetVadecums";

// Pinia Pacientes
export const useVadecumsStore = defineStore('Vadecums', {
    state: () => ({
        Vadecums: [],
        Formulario: {
            Codigo : {
                id: '',
                nombre: '',
                descripcion: ''
            }
        },
        Vadecumseleccionada: null,
    }),

    getters: {

    },
    
    actions: {
        // Funcion para CRUD POST
        async guardar(datos) {
            return await enviarVadecums(false, datos);
        },

        // Funcion para CRUD PUT
        async actualizar(datos){
            return await enviarVadecums(true, datos);
        },

        // Funcion para CRUD DELETE
        async eliminar(datos){
            return await eliminarCategoria(datos);
        },

        // Funcion para listar Pacientes GET
        async traer(online = true, filtrar) {
            const Vadecums = await traerVadecums()
            
            this.Vadecums = Vadecums
            return Vadecums
        },

        // Funcion para listar datos de un paciente en especifico
        async listDatos(id, Tabla) {
            // Traer datos de indexedDB
            const store = useIndexedDBStore()
            store.almacen = Tabla
            const datosTabla = await store.leerdatos()

            // Array que devuelve los datos filtrados por paciente
            const datos = datosTabla.filter((dato) => {
                return parseInt(dato.id_paciente) === parseInt(id)
            })

            return datos
        },

        async indexDBDatos() {

        },
    }
});


