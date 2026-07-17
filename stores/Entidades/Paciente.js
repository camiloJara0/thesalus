import { defineStore } from "pinia";
import { actualizarPaciente } from "~/Core/Pacientes/PUTPaciente";
import { eliminarPaciente } from "~/Core/Pacientes/DELETEPaciente";
import { traerPacientes, traerPacientesInactivos } from "~/Core/Pacientes/GETPacientes";
import { enviarPaciente } from "~/Core/Pacientes/POSTPaciente";

// Pinia Pacientes
export const usePacientesStore = defineStore('Pacientes', {
    state: () => ({
        Pacientes: [],
        Formulario: {
            Paciente: {
                info_usuario: {
                    id: '',
                    name: '',
                    No_document: '',
                    type_doc: '',
                    celular: '',
                    telefono: '',
                    nacimiento: '',
                    direccion: '',
                    municipio: '',
                    departamento: '',
                    barrio: '',
                    zona: '',
                },
                id_infoUsuario: '',
                sexo: '',
                genero: '',
                eps: {
                    codigo: '',
                    nombre: '',
                    id: '',
                    nit: '',
                },
                id_eps: '',
                regimen: '',
                vulnerabilidad: '',
                estado: 1,
                convenio_id: '',
                convenios: {
                    id: '',
                    nombre: '',
                },
                plan_manejo_procedimientos: [],
                antecedente: [],
            },
        },
        PacienteSeleccionado: null,
        showNuevoPaciente: false,
        showModificarPaciente: false,
        showItem: false,
        NoEnviados: []
    }),

    getters: {

    },

    actions: {
        async guardar(datos) {
            const res = await this.validar(datos);
            if (res.validacion) {
                return enviarPaciente(res.datos);
            }
        },

        async actualizar(datos) {
            const res = await this.validar(datos);
            if (res.validacion) {
            return await actualizarPaciente(res.datos);
            }
        },

        async eliminar(datos) {
            return await eliminarPaciente(datos);
        },

        async traer(online = true, cambio = false) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();

            indexedDB.almacen = 'Paciente';
            const refrescar = await indexedDB.necesitaRefrescar('Paciente');

            let pacientes;

            if ((online && refrescar) || cambio) {
                // Traer de API
                pacientes = await traerPacientes();
                await apiRest.postOfflineData('Paciente', pacientes);
            } else {
                // Traer de IndexedDB
                pacientes = await apiRest.getOfflineData('Paciente');
            }

            this.Pacientes = pacientes;
            return pacientes;
        },

        filtrarPacientes() {

        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Paciente'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Paciente'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                let res = false
                if (this.NoEnviados[i].editado == 1 && this.NoEnviados[i].estado == 0){
                    res = await eliminarPaciente({ Paciente: this.NoEnviados[i] })
                } else if (this.NoEnviados[i].editado == 1){
                    res = actualizarPaciente({ Paciente: this.NoEnviados[i] })
                } else {
                    res = await enviarPaciente({ Paciente: this.NoEnviados[i] })
                }

                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            await this.traer(true, true)
        },

        async validar(datos) {
            const notificacionesStore = useNotificacionesStore();

            // 🔍 Validar campos obligatorios
            const camposObligatorios = [
                'name', 'No_document', 'type_doc', 'celular',
                'nacimiento', 'direccion', 'municipio', 'departamento',
                'barrio', 'zona', 'sexo', 'genero', 'id_eps', 'regimen', 'vulnerabilidad'
            ];

            const cuerpo = {
                ...datos.Paciente.info_usuario,
                ...datos.Paciente
            };

            const camposFaltantes = camposObligatorios.filter(campo => {
                const valor = cuerpo[campo];
                return valor === undefined || valor === null || valor === '';
            });

            if (camposFaltantes.length > 0) {
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Datos incompletos';
                notificacionesStore.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
                notificacionesStore.options.tiempo = 6000;
                await notificacionesStore.simple();
                return false
            }

            // 📅 Validar formato de fecha
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(datos.Paciente.info_usuario.nacimiento)) {
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Fecha inválida';
                notificacionesStore.options.texto = 'La fecha de nacimiento debe tener el formato YYYY-MM-DD';
                notificacionesStore.options.tiempo = 5000;
                await notificacionesStore.simple();
                return false;
            }

            // 📞 Validar número de celular
            const celularRegex = /^\d{10}$/;
            if (!celularRegex.test(datos.Paciente.info_usuario.celular)) {
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Celular inválido';
                notificacionesStore.options.texto = 'El número de celular debe tener 10 dígitos';
                notificacionesStore.options.tiempo = 5000;
                await notificacionesStore.simple();
                return false;
            }

            const errores = []
            datos.Paciente.plan_manejo_procedimientos = datos.Paciente.plan_manejo_procedimientos?.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            // Validar Procedimientos
            datos.Paciente.plan_manejo_procedimientos?.forEach((p, i) => {
                if (!p.procedimiento || !p.codigo) {
                    errores.push(`Procedimiento ${i + 1} incompleto.`);
                }
            });

            datos.Paciente.antecedente = datos.Paciente.antecedente?.filter(d => {
                return d && Object.values(d).some(v => v !== '' && v != null);
            });
            // Validar Antecedentes
            datos.Paciente.antecedente?.forEach((p, i) => {
                if (!p.descripcion || !p.tipo) {
                    errores.push(`Antecedente ${i + 1} incompleto.`);
                }
            });

            if (errores.length > 0) {
                errores.forEach(msg => {
                    notificacionesStore.options.icono = 'error';
                    notificacionesStore.options.titulo = 'Información inválida';
                    notificacionesStore.options.texto = msg;
                    notificacionesStore.options.tiempo = 5000;
                    notificacionesStore.simple();
                });
                return false;
            }

            return {
                validacion: true,
                datos
            };
        },

        async traerInactivos() {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();

            indexedDB.almacen = 'Paciente';
            let inactivos;
            // Traer de API
            inactivos = await traerPacientesInactivos();
            // await apiRest.postOfflineData('Paciente', inactivos);

            inactivos.map(i => this.Pacientes.push(i))
            return inactivos;
        },

    }
});


