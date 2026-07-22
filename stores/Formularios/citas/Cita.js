import { traerCitasFiltradas, traerCitasHoy, traerCitasPaginadas, traerCitasPorRango } from "~/Core/Cita/GETCita";
import { enviarFormularioCita } from "~/Core/Cita/POSTCita";
import { useProfesionalStore } from "~/stores/Entidades/Profesional";

// Estructura de datos de Citas
const estructuraCita = {
    Cita: {
        id: '',
        fecha: '',
        servicio: '',
        id_servicio: '',
        motivo: '',
        hora: '',
        id_paciente: '',
        name_paciente: '',
        id_medico: '',
        name_medico: '',
        estado: 'Inactiva',
        intervaloCitas: '',
        cantidadCitas: '',
        fechaHasta: '',
        id_procedimiento: '',
    },
    Plan_manejo_procedimientos: [],
}

// Pinia Citas
export const useCitasStore = defineStore('Citas', {
    state: () => ({
        Formulario: estructuraCita,
        Cita: JSON.parse(JSON.stringify(estructuraCita)), // estructura base compartida
        Citas: [],
        contexto: '',
        ultimo_id: 1,
        mesCitaGuardada: 0,
        fechaHastaCitaGuardada: 0,
        NoEnviados: [],
    }),

    getters: {
    },

    actions: {

        async obtenerCitas(key, fetchFn) {
            const indexedDB = useIndexedDBStore()
            const apiRest = useApiRest()

            // Buscar en IndexedDB primero
            let keyCita = await indexedDB.getData(key)

            if (keyCita) {
                indexedDB.almacen = 'Cita'
                let citas = await indexedDB.leerdatos()
                this.Citas = await this.filtrarPorRol(citas)
                return this.Citas
            }

            // Si no hay datos locales, llamar online
            let citas = await fetchFn()

            citas = await this.filtrarPorRol(citas)

            const mapaCitas = new Map(this.Citas.map(c => [c.id, c]))

            for (const cita of citas) {
                mapaCitas.set(cita.id, cita) // si existe se actualiza si no se agrega
            }
            this.Citas = Array.from(mapaCitas.values())
            await apiRest.postOfflineData('KeyCitas', [{ key: key }])
            await apiRest.postOfflineData('Cita', this.Citas)
            
            return this.Citas
        },

        async listCitas(online = true) {
            const apiRest = useApiRest()

            let citas = []
            if (online) {
                citas = await apiRest.getData('Cita', 'citas')
            } else {
                const store = useIndexedDBStore()
                store.almacen = 'Cita'
                citas = await store.leerdatos()
            }

            citas = await this.filtrarPorRol(citas)

            this.Citas = citas;
            return citas;
        },

        async citasHoy(online, cambio) {
            const key = cambio ? `Cita:cambio:${Date.now()}` : `Cita:hoy`
            
            if(cambio) {
                const hoy = new Date()
                return await this.obtenerCitas.call(this, key, () => traerCitasPorRango(this.mesCitaGuardada || hoy.toLocaleDateString(), this.fechaHastaCitaGuardada || this.mesCitaGuardada))
            }
            if (online || cambio) {
                return await this.obtenerCitas.call(this, key, () => traerCitasHoy())
            }
            return await this.obtenerCitas.call(this, key, async () => {
                const apiRest = useApiRest()
                return await apiRest.getOfflineData('Cita')
            })
        },

        async citasPorRango(inicio, fin) {
            const key = `Cita:rango:${inicio}:${fin}`
            return await this.obtenerCitas.call(this, key, () => traerCitasPorRango(inicio, fin))
        },

        async citasPaginada(datos, por_pagina) {
            this.contexto = 'Tabla'

            const ultimo_id = datos.length > 0
                ? Math.max(...datos.map(c => c.id))
                : 0
            const key = `Cita:cursor:${ultimo_id}`
            return await this.obtenerCitas.call(this, key, () => traerCitasPaginadas(ultimo_id, por_pagina))
        },

        async citasFiltradas(filtros) {
            this.contexto = 'Filtrar'
            const key = `Cita:filtros:${JSON.stringify(filtros)}`
            return await this.obtenerCitas.call(this, key, () => traerCitasFiltradas(filtros))
        },

        async filtrarPorRol(citas) {
            const varView = useVarView()
            // Filtrar por medico si el rol es Profesional
            const rol = varView.getRol;

            let citasFiltradas = citas
            if (rol === 'Profesional') {
                const usuario = varView.getUser;

                citasFiltradas = citas.filter(cita => {
                    return cita.id_medico === usuario.id_profesional
                });
            }

            citasFiltradas = citasFiltradas.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaB - fechaA;
            });
            return citasFiltradas
        },

        async listCitasHoy() {
            const apiRest = useApiRest()
            let citas = await apiRest.getData('Cita', 'citas')

            let citasPendientes = citas.filter(cita => cita.estado === "Inactiva");

            // Ordenar por hora
            citasPendientes = citasPendientes.sort((a, b) => {
                const fechaA = new Date(`${a.fecha}T${a.hora}`);
                const fechaB = new Date(`${b.fecha}T${b.hora}`);
                return fechaA - fechaB;
            }).slice(0, 6);

            this.Citas = citasPendientes;
            return citasPendientes;
        },


        borrarFormulario() {
            this.Formulario = estructuraCita
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Cita'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Cita'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                const res = await enviarFormularioCita({ Cita: this.NoEnviados[i] })


                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            await this.traer(true, true)
        },

        async indexDBDatos() {
            const api = useApiRest()
            await api.getData('Cita', 'citas')
        },

    }
});

