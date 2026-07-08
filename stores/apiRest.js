import { defineStore } from "pinia";
import { decryptData } from "~/composables/Formulario/crypto";

// Store para loader
export const useApiRest = defineStore('apiRest', {
    state: () => ({
        baseUrl: null,
        data: null,
        permisoUsado: false
    }),

    actions: {
        async functionCall(opcion) {
            const notificacionesStore = useNotificacionesStore()
            const config = useRuntimeConfig()
            const varView = useVarView()
            this.baseUrl = config.public.api // URL API

            if (!opcion || !opcion.metodo) {
                throw new Error('Debes definir el método y la tabla antes de llamar a functionCall')
            }

            // Validar permisos antes de llamar
            // const permisosUsuario = varView.getPermisos;
            // const tienePermiso = this.validarPermiso(opcion, permisosUsuario, config);


            // if (!tienePermiso && opcion.metodo !== 'GET') {
            //     notificacionesStore.options.icono = 'warning';
            //     notificacionesStore.options.titulo = 'Acceso denegado';
            //     notificacionesStore.options.texto = 'No tienes permisos para esta acción';
            //     notificacionesStore.options.tiempo = 5000;
            //     await notificacionesStore.simple();
            //     throw new Error('Permiso denegado');
            // }

            const url = new URL(`${this.baseUrl}/${opcion.url}`)

            const headers = {
                'Accept': 'application/json',
                ...opcion.head
            }

            // Agregar token si existe
            if (opcion.token) {
                headers['Authorization'] = `Bearer ${opcion.token}`
            }

            const options = {
                method: opcion.metodo,
                headers
            }

            // Agregar body
            if (opcion.body) {
                if (opcion.formData) {
                    // eliminar Content-Type para que el navegador lo maneje automáticamente
                    options.body = opcion.body;
                    delete options.headers['Content-Type'];
                } else {
                    // Por defecto, JSON
                    options.headers['Content-Type'] = 'application/json';
                    options.body = JSON.stringify(opcion.body);
                }
            }

            // console.log(url, options)
            try {
                const response = await fetch(url.toString(), options)
                if (response.status === 200 || response.status === 201 || response.status === 204) {
                    const data = await response.json();
                    this.data = data

                    // Ejemplo de consumir permiso temporal
                    if (varView.permisoTemporal && this.permisoUsado && opcion.metodo !== 'GET') {

                        notificacionesStore.options.icono = 'warning';
                        notificacionesStore.options.titulo = 'Permiso Usado';
                        notificacionesStore.options.texto = 'Vuelve a ingresar con tu contraseña';
                        notificacionesStore.options.tiempo = 5000;
                        await notificacionesStore.simple();
                        window.location.href = '/';
                        varView.permisoTemporal = null;
                        return
                    }
                    return this.data
                } else {

                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = { message: 'Error en la solicitud' };
                    }

                    // Asegurarte de que sea string
                    const mensajeCompleto = errorData.message || 'Error en la solicitud';

                    // Cortar hasta el primer paréntesis
                    const mensajeCorto = mensajeCompleto.split('(')[0].trim();


                    console.log('Error response:', errorData);

                    // Validar si es Unauthorized (401) o Forbidden (403)
                    if (response.status === 401 || response.status === 403) {
                        notificacionesStore.options.icono = 'warning';
                        notificacionesStore.options.titulo = 'Inicio de sesión caducado';
                        notificacionesStore.options.texto = 'Vuelve a ingresar';
                        notificacionesStore.options.tiempo = 5000;
                        await notificacionesStore.simple();

                        // Redirigir al login
                        window.location.href = '/';
                        return;
                    }

                    if (opcion.metodo === 'GET') {
                        varView.cargando = false
                        return
                    }

                    // Notificación con el mensaje del backend o fallback
                    notificacionesStore.options.icono = 'warning';
                    notificacionesStore.options.titulo = '¡Ha ocurrido un problema!';
                    notificacionesStore.options.texto = mensajeCorto;
                    notificacionesStore.options.tiempo = 5000;
                    notificacionesStore.simple();

                    throw new Error(errorData.message || 'Error en la solicitud');

                }
            } catch (error) {
                console.error('Error en functionCall:', error);
                varView.cargando = false
                throw error;
            }
        },

        validarPermiso(opcion, permisosUsuario, config) {
            const { metodo, url } = opcion;
            const baseUrl = config.public.api;

            const permisosTemporales = JSON.parse(localStorage.getItem('permisosTemporales') ?? "[]");

            if(!permisosUsuario.length && metodo === 'GET'){
                return true
            }
            // Normalizar URL (quita base si viene completa)
            const endpoint = url.replace(baseUrl + '/', '');

            let permisoNecesario = null;

            switch (endpoint) {
                case config.public.login:
                case config.public.cambiarContraseña:
                case config.public.cambiarContraseñaPrimerVez:
                case config.public.recuperarContraseña:
                case config.public.primerIngreso:
                case config.public.dashboard:
                case config.public.informacionUsers:
                case config.public.secciones:
                case config.public.profesionalHasPermisos:
                case config.public.solicitarPermiso:
                    return true

                // Pacientes
                case config.public.traePacientes:
                case config.public.pacientes:
                    if (metodo === 'GET') permisoNecesario = 'Pacientes_get';
                    else if (metodo === 'POST') permisoNecesario = 'Pacientes_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Pacientes_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Pacientes_delete';
                    else permisoNecesario = 'Pacientes_view';
                    break;

                // Profesionales
                case config.public.traeProfesionales:
                case config.public.profesionals:
                    if (metodo === 'GET') permisoNecesario = 'Profesional_get';
                    else if (metodo === 'POST') permisoNecesario = 'Profesional_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Profesional_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Profesional_delete';
                    else permisoNecesario = 'Profesional_view';
                    break;

                // Usuarios
                case config.public.administradores:
                case config.public.users:
                    if (metodo === 'GET') permisoNecesario = 'Usuarios_get';
                    else if (metodo === 'POST') permisoNecesario = 'Usuarios_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Usuarios_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Usuarios_delete';
                    else permisoNecesario = 'Usuarios_view';
                    break;

                // Citas
                case config.public.diasAsignadosRestantes:
                case config.public.citas:
                    if (metodo === 'GET') permisoNecesario = 'Citas_get';
                    else if (metodo === 'POST') permisoNecesario = 'Citas_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Citas_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Citas_delete';
                    else permisoNecesario = 'Citas_view';
                    break;

                // Historias clínicas
                case config.public.analisis:
                case config.public.examenFisicos:
                case config.public.planManejoMedicamentos:
                case config.public.planManejoProcedimientos:
                case config.public.planManejoEquipos:
                case config.public.planManejoInsumos:
                case config.public.antecedentes:
                case config.public.enfermedades:
                case config.public.cie10:
                case config.public.historialCambioSonda:
                case config.public.traeDatosPlanManejo:
                case config.public.traeDatosHistoria:
                case config.public.historiasClinicas:
                    if (metodo === 'GET') permisoNecesario = 'Historias_get';
                    else if (metodo === 'POST') permisoNecesario = 'Historias_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Historias_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Historias_delete';
                    else permisoNecesario = 'Historias_view';
                    break;

                case config.public.historiasNutricion:
                    if (metodo === 'GET') permisoNecesario = 'Evoluciones_get';
                    else if (metodo === 'POST') permisoNecesario = 'Evoluciones_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Evoluciones_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Evoluciones_delete';
                    else permisoNecesario = 'Evoluciones_view';
                    break;

                // Medicina general / Trabajo social
                case config.public.historiasClinicasTrabajoSocial:
                    if (metodo === 'GET') permisoNecesario = 'TrabajoSocial_get';
                    else if (metodo === 'POST') permisoNecesario = 'TrabajoSocial_post';
                    else if (metodo === 'PUT') permisoNecesario = 'TrabajoSocial_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'TrabajoSocial_delete';
                    else permisoNecesario = 'TrabajoSocial_view';
                    break;

                case config.public.historiasClinicas:
                    if (metodo === 'GET') permisoNecesario = 'MedicinaGeneral_get';
                    else if (metodo === 'POST') permisoNecesario = 'MedicinaGeneral_post';
                    else if (metodo === 'PUT') permisoNecesario = 'MedicinaGeneral_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'MedicinaGeneral_delete';
                    else permisoNecesario = 'MedicinaGeneral_view';
                    break;

                // Diagnósticos
                case config.public.diagnosticos:
                case config.public.diagnosticosCIF:
                    permisoNecesario = 'Diagnosticos_view';
                    break;

                // Notas
                case config.public.historiasClinicasNota:
                case config.public.notas:
                case config.public.descripcionNotas:
                    if (metodo === 'GET') permisoNecesario = 'Notas_get';
                    else if (metodo === 'POST') permisoNecesario = 'Notas_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Notas_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Notas_delete';
                    else permisoNecesario = 'Notas_view';
                    break;

                // Terapias
                case config.public.terapias:
                    if (metodo === 'GET') permisoNecesario = 'Terapias_get';
                    else if (metodo === 'POST') permisoNecesario = 'Terapias_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Terapias_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Terapias_delete';
                    else permisoNecesario = 'Terapias_view';
                    break;

                // Kardex
                case config.public.traeKardex:
                case config.public.kardex:
                    if (metodo === 'GET') permisoNecesario = 'Kardex_get';
                    else if (metodo === 'PUT' || metodo === 'POST') permisoNecesario = 'Kardex_put';
                    else permisoNecesario = 'Kardex_view';
                    break;

                // Insumos
                case config.public.movimientos:
                case config.public.insumos:
                    if (metodo === 'GET') permisoNecesario = 'Insumos_get';
                    else if (metodo === 'POST') permisoNecesario = 'Insumos_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Insumos_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Insumos_delete';
                    else permisoNecesario = 'Insumos_view';
                    break;

                // Configuración / Software / Administradores / Empresas / EPS / Profesiones
                case config.public.software:
                case config.public.empresas:
                    if (metodo === 'GET') permisoNecesario = 'Configuracion_get';
                    else if (metodo === 'POST') permisoNecesario = 'Configuracion_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Configuracion_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Configuracion_delete';
                    else permisoNecesario = 'Configuracion_view';
                    break;

                // Medicación / Planes de manejo
                case config.public.planManejoMedicamentos:
                case config.public.planManejoProcedimientos:
                case config.public.planManejoEquipos:
                case config.public.planManejoInsumos:
                    if (metodo === 'GET') permisoNecesario = 'Medicacion_get';
                    else if (metodo === 'POST') permisoNecesario = 'Medicacion_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Medicacion_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Medicacion_delete';
                    else permisoNecesario = 'Medicacion_view';
                    break;

                // Datos (ejemplo: servicios, profesiones, eps)
                case config.public.eps:
                case config.public.professions:
                case config.public.servicios:
                    if (metodo === 'GET') permisoNecesario = 'Datos_get';
                    else if (metodo === 'POST') permisoNecesario = 'Datos_post';
                    else if (metodo === 'PUT') permisoNecesario = 'Datos_put';
                    else if (metodo === 'DELETE') permisoNecesario = 'Datos_delete';
                    else permisoNecesario = 'Datos_view';
                    break;

                default:
                    console.warn(`No se encontró mapeo de permisos para: ${endpoint}`);
                    return false;
            }

            // 🔑 Validar si el permiso temporal coincide
            if (permisosTemporales[0]?.nombre.includes(permisoNecesario)) {
                this.permisoUsado = true; // marcar que se usó
                return true;
            }
            console.log(permisoNecesario)

            // 🔑 Validar si el permiso existe en el array del usuario
            if (permisosUsuario.includes(permisoNecesario)) {
                return true;
            }

            return false;


        },

        async getData(almacen, nombre, time = true) {
            let datos = [];
            const varView = useVarView()
            const token = decryptData(localStorage.getItem('token'));
            const config = useRuntimeConfig()

            if (navigator.onLine) {
                try {
                    const options = {
                        metodo: 'GET',
                        url: config.public[nombre],
                        token: token
                    };

                    let respuesta
                    if (time) {
                        // Promesa de timeout
                        const timeout = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error("Timeout")), 10000) // 10 segundos
                        );

                        // Correr la llamada y el timeout en paralelo
                        respuesta = await Promise.race([
                            this.functionCall(options),
                            timeout
                        ]);
                    } else {
                        respuesta = await this.functionCall(options);
                    }

                    if (respuesta?.success && Array.isArray(respuesta.data)) {
                        datos = await respuesta.data;
                        // guardar en IndexedDB para uso offline
                        if (almacen !== '') {
                            this.postOfflineData(almacen)
                        };
                    }

                } catch (error) {
                    console.error("Error al obtener datos desde la API:", error);
                    console.error("Fallo:", almacen)
                    datos = await this.getOfflineData(almacen);
                }
            } else {
                datos = await this.getOfflineData(almacen);
            }

            varView.cargando = false
            varView.cambioEnApi = false
            return datos;
        },

        async getOfflineData(almacen) {
            const store = useIndexedDBStore();
            store.almacen = almacen;
            const todosLosDatos = await store.leerdatos();
            return todosLosDatos
        },

        async postOfflineData(almacen, datos) {
            const store = useIndexedDBStore();
            store.almacen = almacen;
            await store.bulkPut(datos)

            store.almacen = 'LastUpdate'
            await store.actualiza({ store: almacen, lastUpdate: Date.now() })
        }
    }
})
