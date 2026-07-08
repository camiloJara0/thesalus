import { defineStore } from "pinia";
import { decryptData } from "~/composables/Formulario/crypto";

// Store para loader
export const useVarView = defineStore('varView', {
    state: () => ({
        cargando: false,
        actualizando: false,
        loader: {
            cargando: false,
            titulo: 'Generando',
            progreso: 0
        },
        // Formularios Paciente
        showNuevoPaciente: false,
        pacienteKardex: false,
        // formularios Users
        showNuevoUser: false,
        // Formularios Citas
        showNuevaCita: false,
        showActualizarCita: false,
        rangoCita: false,
        tratamientos: [],
        showEnFila: false,
        showCalendario: true,
        showEnTabla: true,
        // formularios Notas
        showNuevaNota: false,
        // formularios Datos Empresa
        showNuevoEPS: false,
        showModificarEPS: false,
        // formulario Datos Excel
        showDatosExcel: false,
        showCrearTabla: false,
        // Formularios Historia
        showNuevaHistoria: false,
        // Modales ver Historia
        showPDFNota: false,
        showPDFEvolucion: false,
        showPDFTerapia: false,
        showPDFMedicina: false,
        showPDFTrabajoSocial: false,
        showPDFMedicamentos: false,
        showPDFInsumo: false,
        showExportarPDFs: false,
        // Modales Login
        showRecuperarContraseña: false,
        showCambiarContraseña: false,
        // Insumos
        importarArchivo: false,
        // validacion de formularios
        soloVer: true,
        formComplete: false,
        respuestaBackend: false,
        camposVacios: false,
        tipoConsulta: '',
        tipoHistoria: '',
        cambioEnApi: false,
        citaRealizada: false,
        datosPaciente: {},
        // Impresion
        propiedadesPDF: {},
        showPDFServicio: false,
        onlyPaciente: false,
        id_pacientePDF: '',
        servicioPDF: '',
        //layout
        expandido: false,
        permisoTemporal: false,
    }),

    getters: {
        isOnline: () => {
            if (typeof navigator === 'undefined' || !navigator.onLine) {
                return false;
            } else if (navigator.onLine) {
                return true;
            }
        },

        getPermisos: () => {
            try {
                const permisos = decryptData(localStorage.getItem('Permisos'));
                return Array.isArray(permisos) ? permisos : [];
            } catch (error) {
                console.error('Error al obtener permisos desde localStorage:', error);
                return [];
            }
        },

        getUser: () => {
            try {
                const usuario = decryptData(localStorage.getItem('user'));
                return usuario || {};
            } catch (error) {
                console.error('Error al obtener usuario desde localStorage:', error);
                return {};
            }
        },

        getRol: () => {
            try {
                const rol = decryptData(localStorage.getItem('Rol'));
                return rol
            } catch (error) {
                console.error('Error al obtener usuario desde localStorage:', error);
            }
        }
    },

    actions: {
        datosActualizados() {
            this.actualizando = true
            setTimeout(() => {
                this.actualizando = false
            }, 1500);
        },

    }
})
