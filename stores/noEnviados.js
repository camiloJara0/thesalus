

import { defineStore } from 'pinia';
import { usePacientesStore } from '~/stores/Entidades/Paciente';
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useEpsStore } from './Entidades/Eps';
import { useConvenioStore } from './Entidades/Convenio';
import { actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager';
import { useProfesionStore } from './Entidades/Profesion';
import { useInsumoStore } from './Entidades/Insumo';
import { useMovimientoStore } from './Entidades/Movimiento';
import { useServicioStore } from './Entidades/Servicio';
import { useCie10Store } from './Entidades/Cie10';
import { useVadecumStore } from './Entidades/Vadecum';

export const useNoEnviados = defineStore('noEnviados', {
    state: () => ({
        show: false,
        showImportar: false,
        importacion: '',
        documentos: [],
        cargando: false,
    }),

    getters: {
        documentosNoEnviados: (state) => {
            return state.documentos.flatMap((seccion) => {
                return (seccion.data || []).map((documento) => ({
                    ...documento,
                    _seccion: seccion.key,
                    _label: seccion.label,
                }));
            });
        },
        totalDocumentosNoEnviados: (state) => {
            return state.documentos.reduce((total, seccion) => {
                return total + (Array.isArray(seccion.data) ? seccion.data.length : 0);
            }, 0);
        }
    },

    actions: {
        async cargarDocumentosNoEnviados() {
            this.cargando = true;

            try {
                const pacientesStore = usePacientesStore();
                const profesionalStore = useProfesionalStore();
                const historiasStore = useHistoriasStore();
                const epsStore = useEpsStore();
                const conveniosStore = useConvenioStore();
                const profesionStore = useProfesionStore();
                const insumoStore = useInsumoStore();
                const servicioStore = useServicioStore();
                const cie10store = useCie10Store();
                const vadecumStore = useVadecumStore();

                const [pacientes, profesionales, historias, eps, convenios, profesiones, insumos, movimientos, servicios, cie10, vadecums] = await Promise.all([
                    pacientesStore.traerNoEnviados(),
                    profesionalStore.traerNoEnviados(),
                    historiasStore.traerNoEnviados(),
                    epsStore.traerNoEnviados(),
                    conveniosStore.traerNoEnviados(),
                    profesionStore.traerNoEnviados(),
                    insumoStore.traerNoEnviados(),
                    insumoStore.traerNoEnviadosMovimientos(),
                    servicioStore.traerNoEnviados(),
                    cie10store.traerNoEnviados(),
                    vadecumStore.traerNoEnviados(),
                ]);

                this.documentos = [
                    { key: 'Paciente', label: 'Pacientes', data: pacientes || [] },
                    { key: 'EPS', label: 'EPS', data: eps || [] },
                    { key: 'Convenio', label: 'Convenios', data: convenios || [] },
                    { key: 'Profesional', label: 'Profesionales', data: profesionales || [] },
                    { key: 'Profesion', label: 'Profesiones', data: profesiones || [] },
                    { key: 'Analisis', label: 'Historias', data: historias || [] },
                    { key: 'Insumo', label: 'Inventario', data: insumos || [] },
                    { key: 'Movimiento', label: 'Movimientos', data: movimientos || [] },
                    { key: 'Servicio', label: 'Servicios', data: servicios || [] },
                    { key: 'Cie10', label: 'CIE10', data: cie10 || [] },
                    { key: 'Vadecum', label: 'Vadecums', data: vadecums || [] },

                ].filter(item => item.data?.length);

                return this.documentos;
            } catch (error) {
                console.error('Error cargando documentos no enviados:', error);
                this.documentos = [];
                return [];
            } finally {
                this.cargando = false;
            }
        },

        async sincronizarSeccion(key) {
            const store = this.getStoreForSection(key);
            if (!store?.sincronizar) return;

            await store.sincronizar();
            await this.cargarDocumentosNoEnviados();
            await this.cargarDocumentosNoEnviados();
        },

        getStoreForSection(key) {
            switch (key) {
                case 'Paciente':
                    return usePacientesStore();
                case 'EPS':
                    return useEpsStore();
                case 'Convenio':
                    return useConvenioStore();
                case 'Profesional':
                    return useProfesionalStore();
                case 'Profesion':
                    return useProfesionStore();
                case 'Analisis':
                    return useHistoriasStore();
                case 'Insumo':
                    return useInsumoStore();
                case 'Movimiento':
                    return useMovimientoStore();
                case 'Servicio':
                    return useServicioStore();
                case 'Cie10':
                    return useCie10Store();
                case 'Vadecum':
                    return useVadecumStore();
                default:
                    return null;
            }
        },

        async importarNoEnviados() {
            const archivo = this.importacion;
            if (!archivo) return;

            const lector = new FileReader();

            lector.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);

                    await actualizarEnIndexedDB(data);
                } catch (error) {
                    console.error('Error al leer el archivo:', error);
                }
            };

            lector.readAsText(archivo);
            this.importacion = null;
            this.showImportar = false
            await this.cargarDocumentosNoEnviados()
            await this.cargarDocumentosNoEnviados()
        },

        descargarNoEnviados() {
            const contenido = this.documentos.reduce((acc, item) => {
                acc[item.key] = item.data;
                return acc;
            }, {});

            const blob = new Blob(
                [JSON.stringify(contenido, null, 2)],
                { type: 'application/json' }
            );

            const enlace = document.createElement('a');
            enlace.href = URL.createObjectURL(blob);
            enlace.download = 'no-enviados.json';
            enlace.click();

            URL.revokeObjectURL(enlace.href);
        },


    }
});