/**
 * EJEMPLO OPTIMIZADO: useHistoriasStore
 * 
 * Cambios principales:
 * 1. Usa useCacheStrategy() en lugar de sincronización manual
 * 2. Cargar datos locales PRIMERO (modo offline-first)
 * 3. Sincronizar en background sin bloquear UI
 * 4. Notificaciones automáticas de cambios
 */

import { defineStore } from 'pinia';
import { useCacheStrategy } from '~/composables/useCacheStrategy';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { useApiRest } from '~/stores/apiRest';
import { usePacientesStore } from '~/stores/Entidades/Paciente';

export const useHistoriasStoreOptimizado = defineStore('HistoriaClinicaOptimizado', {
    state: () => ({
        Historias: [],
        cargando: false,
        error: null,
        ultimasActualizaciones: {}, // Rastrear cuándo fue el último sync de cada tipo
    }),

    getters: {
        /**
         * Getter optimizado para obtener historias con datos de pacientes
         * Utiliza caché inteligente
         */
        async datosHistoriaOptimizado() {
            const { cacheFirst } = useCacheStrategy();
            const pacienteStore = usePacientesStore();
            
            try {
                // Cargar historias con estrategia CACHE_FIRST
                const historias = await cacheFirst(
                    'HistoriaClinica',
                    async () => {
                        const api = useApiRest();
                        // Tu llamada actual a la API
                        const respuesta = await api.functionCall({
                            metodo: 'GET',
                            url: 'historiasClinicas'
                        });
                        return respuesta.data || respuesta;
                    },
                    {
                        maxAge: 10 * 60 * 1000, // Actualizar cada 10 minutos
                        showNotification: false
                    }
                );
                
                // Cargar pacientes también con caché
                const pacientes = await cacheFirst(
                    'Paciente',
                    () => pacienteStore.traer(),
                    { maxAge: 15 * 60 * 1000 }
                );
                
                // Combinar datos
                const historiasConPacientes = historias.map((historia) => {
                    const paciente = pacientes.find(p => p.id_paciente === historia.id_paciente);
                    return {
                        id: paciente?.id_paciente,
                        paciente: paciente?.name,
                        cedula: paciente?.No_document,
                        estado: historia?.id_historiaClinica ? 'Creada' : 'Nueva',
                        ...historia
                    };
                });
                
                return historiasConPacientes;
                
            } catch (error) {
                console.error('Error en datosHistoriaOptimizado:', error);
                throw error;
            }
        },

        /**
         * Últimas historias ordenadas por fecha (optimizado)
         */
        async ultimasHistoriasOptimizado() {
            const { staleWhileRevalidate } = useCacheStrategy();
            const pacienteStore = usePacientesStore();
            
            try {
                // Usar STALE_WHILE_REVALIDATE para datos menos críticos
                const historias = await staleWhileRevalidate(
                    'HistoriaClinica',
                    async () => {
                        const api = useApiRest();
                        const respuesta = await api.functionCall({
                            metodo: 'GET',
                            url: 'historiasClinicas'
                        });
                        return respuesta.data || respuesta;
                    },
                    { maxAge: 5 * 60 * 1000 } // 5 minutos
                );
                
                const pacientes = await pacienteStore.traer();
                
                // Combinar, ordenar y limitar
                return historias
                    .map(historia => ({
                        ...historia,
                        ...pacientes.find(p => p.id_paciente === historia.id_paciente)
                    }))
                    .sort((a, b) => {
                        const fechaA = new Date(a.fecha_historia?.split('/').reverse().join('-'));
                        const fechaB = new Date(b.fecha_historia?.split('/').reverse().join('-'));
                        return fechaB - fechaA;
                    })
                    .slice(0, 3);
                    
            } catch (error) {
                console.error('Error en ultimasHistoriasOptimizado:', error);
                throw error;
            }
        }
    },

    actions: {
        /**
         * Acción NUEVA y optimizada para cargar historias
         * Reemplaza al antiguo indexDBDatos()
         */
        async cargarHistoriasOptimizado() {
            this.cargando = true;
            this.error = null;
            
            try {
                const { cacheFirst, invalidate } = useCacheStrategy();
                
                // Cargar con estrategia CACHE_FIRST
                // Esto mostrará datos locales al instante
                const historias = await cacheFirst(
                    'HistoriaClinica',
                    async () => {
                        const api = useApiRest();
                        const respuesta = await api.functionCall({
                            metodo: 'GET',
                            url: 'historiasClinicas'
                        });
                        return respuesta.data || respuesta;
                    },
                    {
                        maxAge: 10 * 60 * 1000,
                        showNotification: true
                    }
                );
                
                this.Historias = historias;
                this.ultimasActualizaciones.historias = Date.now();
                
            } catch (error) {
                this.error = error.message || 'Error cargando historias';
                console.error('Error en cargarHistoriasOptimizado:', error);
            } finally {
                this.cargando = false;
            }
        },

        /**
         * Acción para refrescar datos manualmente
         * Invalida el caché y recarga
         */
        async refrescarHistorias() {
            const { invalidate } = useCacheStrategy();
            
            try {
                // Invalidar caché viejo
                await invalidate('HistoriaClinica');
                
                // Recargar
                await this.cargarHistoriasOptimizado();
                
            } catch (error) {
                console.error('Error refrescando historias:', error);
            }
        },

        /**
         * Crear nueva historia (optimizado para offline)
         */
        async crearHistoriaOptimizado(nuevaHistoria) {
            try {
                const { guardarEnCache } = useCacheStrategy();
                const idb = useIndexedDBStore();
                const api = useApiRest();
                
                // 1. Guardar localmente primero (offline-ready)
                const historiaConTempId = {
                    ...nuevaHistoria,
                    id_temporal: Date.now(),
                    sincronizado: 0
                };
                
                idb.almacen = 'HistoriaClinica';
                await idb.guardardatos(historiaConTempId);
                
                // Agregar al estado
                this.Historias.push(historiaConTempId);
                
                // 2. Sincronizar en background si estamos online
                if (navigator.onLine) {
                    try {
                        const respuesta = await api.functionCall({
                            metodo: 'POST',
                            url: 'historiasClinicas',
                            body: nuevaHistoria
                        });
                        
                        // Actualizar con el ID real del servidor
                        const index = this.Historias.findIndex(h => h.id_temporal === historiaConTempId.id_temporal);
                        if (index !== -1) {
                            this.Historias[index] = {
                                ...respuesta,
                                sincronizado: 1
                            };
                            
                            // Actualizar en caché
                            idb.almacen = 'HistoriaClinica';
                            await idb.actualiza(this.Historias[index]);
                        }
                        
                        return respuesta;
                    } catch (error) {
                        console.warn('Error sincronizando historia nueva en background:', error);
                        // El dato está guardado localmente, se sincronizará después
                    }
                }
                
                return historiaConTempId;
                
            } catch (error) {
                this.error = error.message;
                console.error('Error creando historia:', error);
                throw error;
            }
        },

        /**
         * Actualizar historia (optimizado)
         */
        async actualizarHistoriaOptimizado(id, datosActualizados) {
            try {
                const idb = useIndexedDBStore();
                const api = useApiRest();
                
                // 1. Actualizar localmente primero
                const index = this.Historias.findIndex(h => h.id === id);
                if (index !== -1) {
                    this.Historias[index] = { ...this.Historias[index], ...datosActualizados };
                    
                    idb.almacen = 'HistoriaClinica';
                    await idb.actualiza(this.Historias[index]);
                }
                
                // 2. Sincronizar en background
                if (navigator.onLine) {
                    try {
                        await api.functionCall({
                            metodo: 'PUT',
                            url: `historiasClinicas/${id}`,
                            body: datosActualizados
                        });
                    } catch (error) {
                        console.warn('Error sincronizando actualización:', error);
                    }
                }
                
            } catch (error) {
                this.error = error.message;
                console.error('Error actualizando historia:', error);
                throw error;
            }
        }
    }
});

/**
 * COMPARACIÓN ANTES Y DESPUÉS
 * 
 * ❌ ANTES (indexDBDatos actual):
 * - Hace la llamada a API y espera respuesta (bloquea UI)
 * - Sin caché inteligente
 * - Si la API falla, no hay datos
 * - Sincronización manual repetida
 * 
 * ✅ DESPUÉS (cargarHistoriasOptimizado):
 * - Muestra datos locales al instante (offline-ready)
 * - Sincroniza en background sin bloquear
 * - Fallback automático a caché si hay error
 * - Sincronización automática basada en edad del caché
 * - Manejo inteligente de online/offline
 */
