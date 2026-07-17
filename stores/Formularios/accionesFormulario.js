// acciones validar y enviar fomularios

// Citas
import { validarYEnviarNuevaCita } from '~/Core/Cita/POSTCita';
import { validarYEnviarActualizarCita } from '~/Core/Cita/PUTCita';
// Pacientes
import { usePacientesStore } from '~/stores/Entidades/Paciente';
// Historia
import { validarYEnviarRegistrarHistoria } from '~/Core/Historial/Historia/PostHistoria';
import { validarYEnviarActualizarHistoria } from '~/Core/Historial/Historia/PUTHistoria';
// Profesionales
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
// Empresa
import { validarYEnviarDatosEmpresa } from '~/Core/Empresa/Configuracion/Empresa/POSTEmpresa';
import { validarYEnviarDatosSoftware } from '~/Core/Empresa/Configuracion/Software/POSTSoftware';
import { validarYEnviarDatosFacturacion } from '~/Core/Empresa/Facturacion/POSTFacturacion';
// Nota
import { validarYEnviarActualizarNota } from '~/Core/Historial/Notas/PUTNota';
// Usuarios
import { validarYEnviarNuevoUsuario } from '~/Core/Empresa/Usuario/NuevoUsuario';
import { validarYEnviarModificarAdministrador } from '~/Core/Empresa/Usuario/ModificarAdministrador';
// EPS
import { useEpsStore } from '~/stores/Entidades/Eps';
// Profesion
import { useProfesionStore } from '../Entidades/Profesion';
// Servicio
import { useServicioStore } from '../Entidades/Servicio';
// Login
import { validarYEnviarLogin } from '~/Core/Login/Ingresar';
import { validarYEnviarCambiarContraseña } from '~/Core/Login/CambiarContraseña';
import { validarYEnviarCambiarContraseñaPrimerVez } from '~/Core/Login/CambiarContraseñaPrimerVez';
// Insumos, Movimientos
import { useInsumoStore } from '../Entidades/Insumo';
// Planes de Manejo
import { validarYEnviarPlan } from '~/Core/Historial/PlanesManejo/PostPlanes';
// Convenios
import { useConvenioStore } from '~/stores/Entidades/Convenio';
// Codigos
import { guardarCie10 } from '~/Core/Codigos/PostCie10';
import { guardarVadecum } from '~/Core/Codigos/PostVadecum';
// Kardex
import { useKardexStore } from '../Entidades/Kardex';



// Importa accion de cada formulario desde el core
export const accionesFormularios = {
    Ingresar: async (data) => {
        const respuesta = await validarYEnviarLogin(data);
        return respuesta;
    },
    RecuperarContraseña: async (data) => {
        const respuesta = await validarYEnviarCambiarContraseña(data);
        return respuesta
    },
    CambiarContraseñaPrimerVez: async (data) => {
        const respuesta = await validarYEnviarCambiarContraseñaPrimerVez(data);
        return respuesta
    },
    NuevaCita: async (data) => {
        const respuesta = await validarYEnviarNuevaCita(data);
        return respuesta;
    },
    ActualizarCita: async (data) => {
        const respuesta = await validarYEnviarActualizarCita(data);
        return respuesta;
    },
    NuevoPaciente: async (data) => {
        const pacienteStore = usePacientesStore()
        const respuesta = await pacienteStore.guardar(data);
        return respuesta;
    },
    ModificarPaciente: async (data) => {
        const pacienteStore = usePacientesStore()
        const respuesta = await pacienteStore.actualizar(data)
        return respuesta;
    },
    // profesional
    NuevoProfesional: async (data) => {
        const store = useProfesionalStore()
        const respuesta = await store.guardar(data)
        return respuesta;
    },
    ModificarProfesional: async (data) => {
        const store = useProfesionalStore()
        const respuesta = await store.actualizar(data)
        return respuesta;
    },
    RegistrarHistoria: async (data) => {
        const respuesta = await validarYEnviarRegistrarHistoria(data)
        return respuesta;
    },
    ActualizarHistorias: async (data) => {
        const respuesta = await validarYEnviarActualizarHistoria(data)
        return respuesta;
    },
    AgregarPlan: async (data) => {
        const respuesta = await validarYEnviarPlan(data)
        return respuesta;
    },
    DatosEmpresa: async (data) => {
        const respuesta = await validarYEnviarDatosEmpresa(data)
        return respuesta
    },
    DatosSoftware: async (data) => {
        const respuesta = await validarYEnviarDatosSoftware(data)
        return respuesta
    },
    DatosNomina: async (data) => {
        const respuesta = await validarYEnviarDatosSoftware(data)
        return respuesta
    },
    DatosEquivalentes: async (data) => {
        const respuesta = await validarYEnviarDatosSoftware(data)
        return respuesta
    },
    DatosFacturacion: async (data) => {
        const respuesta = await validarYEnviarDatosFacturacion(data)
        return respuesta
    },
    ActualizarNota: async (data) => {
        const respuesta = await validarYEnviarActualizarNota(data)
        return respuesta
    },
    NuevoUsuario: async (data) => {
        const respuesta = await validarYEnviarNuevoUsuario(data)
        return respuesta
    },
    ModificarUsuario: async (data) => {
        const respuesta = await validarYEnviarModificarAdministrador(data)
        return respuesta
    },
    EPS: async (data) => {
        const epsStore = useEpsStore()
        const respuesta = await epsStore.guardar(data)
        return respuesta
    },
    ActualizarEPS: async (data) => {
        const epsStore = useEpsStore()
        const respuesta = await epsStore.actualizar(data)
        return respuesta
    },
    Profesion: async (data) => {
        const profesionStore = useProfesionStore()
        const respuesta = await profesionStore.guardar(data)
        return respuesta
    },
    ActualizarProfesion: async (data) => {
        const profesionStore = useProfesionStore()
        const respuesta = await profesionStore.actualizar(data)
        return respuesta
    },
    Servicio: async (data) => {
        const servicioStore = useServicioStore()
        const respuesta = await servicioStore.guardar(data)
        return respuesta
    },
    ActualizarServicio: async (data) => {
        const servicioStore = useServicioStore()
        const respuesta = await servicioStore.actualizar(data)
        return respuesta
    },
    NuevoInsumo: async (data) => {
        const insumoStore = useInsumoStore()
        const respuesta = await insumoStore.guardar(data)
        return respuesta
    },
    ActualizarInsumo: async (data) => {
        const insumoStore = useInsumoStore()
        const respuesta = await insumoStore.actualizar(data)
        return respuesta
    },
    NuevoMovimiento: async (data) => {
        const insumoStore = useInsumoStore()
        const respuesta = await insumoStore.guardarMovimiento(data)
        return respuesta
    },
    ModificarMovimiento: async (data) => {
        const insumoStore = useInsumoStore()
        const respuesta = await insumoStore.actualizarMovimiento(data)
        return respuesta
    },
    AgregarPermisos: async (data) => {
        const respuesta = await validarYEnviarPermisosProfesional(data)
        return respuesta
    },
    ConvenioNuevo : async (data) => {
        const convenioStore = useConvenioStore()
        const respuesta = await convenioStore.guardar(data.Convenio)
        return respuesta
    },
    NuevoCie10 : async (data) => {
        const respuesta = await guardarCie10({Cie10 : [data.Cie10]})
        return respuesta
    },
    ModificarCie10 : async (data) => {
        const respuesta = await guardarCie10(data.Cie10)
        return respuesta
    },
    NuevoVadecum : async (data) => {
        const respuesta = await guardarVadecum({vadecums: [data.Vadecum]})
        return respuesta
    },
    ModificarVadecum : async (data) => {
        const respuesta = await guardarVadecum(data.Vadecum)
        return respuesta
    },
    GuardarKardex: async (data) => {
        const kardexStore = useKardexStore();
        const valores = data.Kardex?.valores || {};
        const campos = kardexStore.camposPlantilla || [];
        const registros = {};
        for (const [slug, valor] of Object.entries(valores)) {
            const campo = campos.find(c => c.slug === slug || c.nombre === slug);
            if (campo) registros[campo.id] = valor;
        }
        const respuesta = await kardexStore.guardarRegistrosPaciente(
            data.Kardex?.paciente_id,
            registros
        );
        return respuesta;
    },
    NuevaPlantilla: async (data) => {
        const kardexStore = useKardexStore();
        const respuesta = await kardexStore.crearPlantilla(data.Plantilla);
        return respuesta ? true : false;
    },
    ModificarPlantilla: async (data) => {
        const kardexStore = useKardexStore();
        const respuesta = await kardexStore.actualizarPlantilla(
            data.Plantilla.id,
            data.Plantilla
        );
        return respuesta;
    },
    NuevoCampo: async (data) => {
        const kardexStore = useKardexStore();
        const respuesta = await kardexStore.crearCampo(data.Campo);
        return respuesta ? true : false;
    },
    ModificarCampo: async (data) => {
        const kardexStore = useKardexStore();
        const respuesta = await kardexStore.actualizarCampo(
            data.Campo.id,
            data.Campo
        );
        return respuesta;
    },
};