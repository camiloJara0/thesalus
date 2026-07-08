import { eliminarInsumo } from "~/Core/Historial/Insumos/DeleteInsumo";
import { eliminarMovimiento } from "~/Core/Historial/Insumos/DeleteMovimiento";
import { traerInsumos } from "~/Core/Historial/Insumos/GetInsumos";
import { traerMovimientos } from "~/Core/Historial/Insumos/GetMovimiento";
import { traerPrestaciones } from "~/Core/Historial/Insumos/GetPrestaciones";
import { guardarInsumo } from "~/Core/Historial/Insumos/PostInsumos";
import { enviarMovimiento } from "~/Core/Historial/Insumos/PostMovimiento";
import { actualizarInsumo } from "~/Core/Historial/Insumos/PutInsumos";
import { actualizarMovimiento } from "~/Core/Historial/Insumos/PutMovimiento";
import { useApiRest } from "~/stores/apiRest";

export const useMovimientoStore = defineStore('Movimiento', {
    state: () => ({
        Formulario: {
            Insumos: {
                nombre: '',
                categoria: '',
                activo: '',
                unidad: '',
                lote: '',
                vencimiento: '',
                ubicacion: '',
                especificaciones: '',
                observaciones: '',
                stock: '',
                es_prestable: '',
                tipo_equipo_id: '',
                estado: 1,
            },
            Movimientos: [],
            Tipo_equipo: {
                nombre: '',
                descripcion: ''
            }
        },
        Insumos: [], // Lista de insumos
        Movimientos: [], // Lista de movimientos
        Prestaciones: [], // Lista de prestaciones
        NoEnviados: [],
        showNuevoInsumo: false,
        showModificarInsumo: false,
        showModificarMovimiento: false,
        showMovimiento: false,
        soloVer: false,
    }),

    getters: {

    },

    actions: {

        async guardar(datos) {
            const validate = this.validar(datos.Insumos)
            if (!validate) {
                return false;
            }
            return await guardarInsumo(datos)
        },

        async actualizar(datos) {
            const validate = this.validar(datos.Insumos)
            if (!validate) {
                return false;
            }

            return await actualizarInsumo(datos)
        },

        async eliminar(datos) {
            return await eliminarInsumo(datos)
        },

        async traer(online = true, cambio) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();

            indexedDB.almacen = 'Insumo';
            const refrescar = await indexedDB.necesitaRefrescar('Insumo');

            let insumos;

            if ((online && refrescar) || cambio) {
                // Traer de API
                insumos = await traerInsumos();
                await apiRest.postOfflineData('Insumo', insumos);
            } else {
                // Traer de IndexedDB
                insumos = await apiRest.getOfflineData('Insumo');
            }

            this.Insumos = insumos;
            return insumos;
        },

        async traerNoEnviados() {
            const store = useIndexedDBStore()

            store.almacen = 'Insumo'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },
        
        async traerInventarioAsignado(id) {
            const movimientos = await this.traerMovimiento(true, false)

            const movimientosAsignados = movimientos.filter(m => {
                return m.paciente?.id === id
            })

            return movimientosAsignados;
        },

        async registrarMovimiento(datos) {
            const api = useApiRest();
            const config = useRuntimeConfig()
            const token = decryptData(localStorage.getItem('token'))

            let options = {
                metodo: 'POST',
                url: `${config.public.insumos}/movimiento`,
                token: token,
                body: datos
            }

            return await api.functionCall(options)
        },

        async validar(datos) {
            const notificaciones = useNotificacionesStore();

            const camposObligatorios = [
                'nombre', 'categoria', 'stock',
            ]

            if (datos.categoria === 'Medicamento') {
                camposObligatorios.push('unidad', 'activo', 'lote', 'vencimiento')
            } else if (datos.categoria === 'Equipos médicos') {
                camposObligatorios.push('serial',)
            } else {
                camposObligatorios.push('unidad', 'especificaciones', 'lote', 'vencimiento', 'ubicacion')
            }

            const camposFaltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

            if (camposFaltantes.length > 0) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Datos incompletos';
                notificaciones.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
                notificaciones.options.tiempo = 6000;
                await notificaciones.simple();
                return false;
            }

            // 📋 Validar que el nombre tenga mínimo 3 caracteres
            if (datos.nombre.length < 3) {
                notificaciones.options.icono = 'error';
                notificaciones.options.titulo = 'Nombre inválido';
                notificaciones.options.texto = 'El nombre del insumo debe tener mínimo 3 caracteres';
                notificaciones.options.tiempo = 5000;
                await notificaciones.simple();
                return false;
            }

            return true;
        },

        async guardarMovimiento(datos) {
            const validate = this.validarMovimiento(datos)
            if (!validate) {
                return false;
            }
            return await enviarMovimiento(datos)
        },

        async actualizarMovimiento(datos) {
            const validate = this.validarMovimiento(datos)
            if (!validate) {
                return false;
            }

            return await actualizarMovimiento(datos)
        },

        async eliminarMovimiento(datos) {
            return await eliminarMovimiento(datos)
        },

        async traerMovimiento(online = true, cambio) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();

            indexedDB.almacen = 'Movimiento';
            const refrescar = await indexedDB.necesitaRefrescar('Movimiento');

            let movimientos;

            if ((online && refrescar) || cambio) {
                // Traer de API
                movimientos = await traerMovimientos();
                await apiRest.postOfflineData('Movimiento', movimientos);
            } else {
                // Traer de IndexedDB
                movimientos = await apiRest.getOfflineData('Movimiento');
            }

            this.Movimientos = movimientos;
            return movimientos;
        },

        async validarMovimiento(datos) {
            const notificacionesStore = useNotificacionesStore()

            const Movimiento = datos?.Movimientos;

            // Validar que todos los campos estén presentes y no vacíos
            if (
                !Movimiento?.cantidadMovimiento ||
                !Movimiento?.fechaMovimiento ||
                !Movimiento?.tipoMovimiento ||
                !Movimiento?.id_medico ||
                !Movimiento?.id_insumo
            ) {
                const msg = 'Todos los campos son obligatorios. Verifica que no haya ninguno vacío.';
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Información inválida.';
                notificacionesStore.options.texto = msg;
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return false;
            }

            if (
                Movimiento.cantidadMovimiento > datos.Insumos.stock && Movimiento.tipoMovimiento === 'Egreso'
            ) {
                const msg = 'Cantidad de movimiento mayor al stock actual.';
                notificacionesStore.options.icono = 'error';
                notificacionesStore.options.titulo = 'Información inválida.';
                notificacionesStore.options.texto = msg;
                notificacionesStore.options.tiempo = 5000;
                notificacionesStore.simple();
                return false;
            }

            return true;
        },

        async traerNoEnviadosMovimientos() {
            const store = useIndexedDBStore()

            store.almacen = 'Movimiento'
            this.NoEnviados = await store.leerNoEnviados()
            return this.NoEnviados
        },

        async sincronizar() {
            const indexedDB = useIndexedDBStore()
            indexedDB.almacen = 'Movimiento'
            const online = navigator.onLine;
            if (this.NoEnviados.length < 1 || !online) return

            for (let i = 0; i < this.NoEnviados.length; i++) {
                const data = this.NoEnviados[i]

                let res = false
                if (data.editado == 1 && data.estado == 0){
                    res = await eliminarMovimiento( data )
                } else if (data.editado == 1){
                    res = actualizarMovimiento({ Movimientos: data })
                } else {
                    res = await enviarMovimiento({ Movimientos: data })
                }

                    indexedDB.borrardato(this.NoEnviados[i].id)

            }

            await this.Movimientos(true, true)
        },

        async traerPrestaciones(online = true, cambio) {
            const apiRest = useApiRest();
            const indexedDB = useIndexedDBStore();

            indexedDB.almacen = 'Historial_prestaciones';
            const refrescar = await indexedDB.necesitaRefrescar('Historial_prestaciones');

            let prestaciones;

            if ((online && refrescar) || cambio) {
                // Traer de API
                prestaciones = await traerPrestaciones();
                await apiRest.postOfflineData('Historial_prestaciones', prestaciones);
            } else {
                // Traer de IndexedDB
                prestaciones = await apiRest.getOfflineData('Historial_prestaciones');
            }

            this.Prestaciones = prestaciones;
            return prestaciones;
        }

    }
});
