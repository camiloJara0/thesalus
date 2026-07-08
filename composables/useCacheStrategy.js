import { ref, reactive, watch, onMounted } from 'vue';
import { useIndexedDBStore } from '~/stores/indexedDB';
import { useApiRest } from '~/stores/apiRest';

/**
 * Composable para gestionar estrategias de caché inteligente
 * Prioriza mantener datos actualizados sin sobrecargar la API
 * 
 * Estrategias disponibles:
 * - CACHE_FIRST: Usa caché local primero, sincroniza en background
 * - NETWORK_FIRST: Intenta API primero, fallback a caché
 * - STALE_WHILE_REVALIDATE: Retorna caché viejo mientras actualiza
 */
export function useCacheStrategy() {
    const idb = useIndexedDBStore();
    const api = useApiRest();
    const notificaciones = useNotificacionesStore();
    
    // Cache en memoria para acceso ultra-rápido
    const memoryCache = reactive(new Map());
    
    // Timestamps para rastrear cuándo fue la última actualización
    const syncTimestamps = reactive(new Map());
    
    // Cola de sincronización automática
    const syncQueue = reactive(new Set());
    
    // Rastrear si estamos online
    const isOnline = ref(navigator.onLine);
    
    /**
     * Estrategia CACHE_FIRST (recomendado para Historias)
     * 1. Mostrar datos locales al instante
     * 2. Sincronizar en background
     * 3. Notificar si hay cambios
     */
    const cacheFirst = async (entidad, fetcher, options = {}) => {
        const { 
            maxAge = 10 * 60 * 1000, // 10 minutos por defecto
            showNotification = false 
        } = options;
        
        try {
            // Fase 1: Verificar caché en memoria (10ms)
            if (memoryCache.has(entidad)) {
                const cached = memoryCache.get(entidad);
                const age = Date.now() - cached.timestamp;
                
                if (age < maxAge) {
                    // Si el caché es fresco, agregarlo a cola de sincronización
                    if (isOnline.value && !syncQueue.has(entidad)) {
                        syncQueue.add(entidad);
                        syncInBackground(entidad, fetcher);
                    }
                    return cached.data;
                }
            }
            
            // Fase 2: Leer de IndexedDB (50-100ms)
            idb.almacen = entidad;
            const idbData = await idb.leerdatos();
            
            if (idbData && idbData.length > 0) {
                // Guardar en memoria para siguiente acceso
                memoryCache.set(entidad, {
                    data: idbData,
                    timestamp: Date.now()
                });
                
                // Sincronizar en background
                if (isOnline.value && !syncQueue.has(entidad)) {
                    syncQueue.add(entidad);
                    syncInBackground(entidad, fetcher, idbData);
                }
                
                return idbData;
            }
            
            // Fase 3: Si no hay datos en caché, traer de API
            const apiData = await fetcher();
            await guardarEnCache(entidad, apiData);
            return apiData;
            
        } catch (error) {
            console.error(`Error en cacheFirst para ${entidad}:`, error);
            
            // Fallback: intentar obtener del caché aunque esté viejo
            const fallback = await idb.leerdatos();
            if (fallback?.length > 0) {
                notificaciones.agregarNotificacion({
                    tipo: 'warning',
                    mensaje: `Mostrando ${entidad} offline - sin conexión`
                });
                return fallback;
            }
            
            throw error;
        }
    };
    
    /**
     * Estrategia STALE_WHILE_REVALIDATE
     * Mejor para datos que no necesitan estar 100% frescos
     * Retorna caché viejo inmediatamente y actualiza en background
     */
    const staleWhileRevalidate = async (entidad, fetcher, options = {}) => {
        const { maxAge = 5 * 60 * 1000 } = options; // 5 minutos por defecto
        
        try {
            // Obtener caché actual
            idb.almacen = entidad;
            const cached = await idb.leerdatos();
            const lastSync = syncTimestamps.get(entidad) || 0;
            const age = Date.now() - lastSync;
            
            // Si existe y es fresco, retornar inmediatamente
            if (cached?.length > 0 && age < maxAge) {
                memoryCache.set(entidad, {
                    data: cached,
                    timestamp: Date.now()
                });
                
                // Actualizar en background sin esperar
                if (isOnline.value) {
                    syncInBackground(entidad, fetcher, cached)
                        .catch(err => console.warn(`Background sync failed for ${entidad}:`, err));
                }
                
                return cached;
            }
            
            // Si no existe o es muy viejo, traer de API
            const fresh = await fetcher();
            await guardarEnCache(entidad, fresh);
            return fresh;
            
        } catch (error) {
            console.error(`Error en staleWhileRevalidate para ${entidad}:`, error);
            
            // Fallback al caché viejo
            idb.almacen = entidad;
            const fallback = await idb.leerdatos();
            if (fallback?.length > 0) {
                return fallback;
            }
            throw error;
        }
    };
    
    /**
     * Sincronizar datos en background sin bloquear la UI
     */
    const syncInBackground = async (entidad, fetcher, cachedData) => {
        try {
            const freshData = await fetcher();
            
            // Comparar datos
            const hasChanges = !tienenMismoContenido(cachedData, freshData);
            
            if (hasChanges) {
                // Actualizar caché
                await guardarEnCache(entidad, freshData);
                
                // Actualizar timestamp de sincronización
                syncTimestamps.set(entidad, Date.now());
                
                // Notificar cambios
                window.dispatchEvent(new CustomEvent('cache-updated', {
                    detail: { entidad, hasChanges: true }
                }));
                
                console.log(`✅ ${entidad} actualizado desde API`);
            } else {
                // Actualizar solo el timestamp aunque no haya cambios
                syncTimestamps.set(entidad, Date.now());
                console.log(`↻ ${entidad} sincronizado (sin cambios)`);
            }
        } catch (error) {
            console.error(`Error sincronizando ${entidad} en background:`, error);
            // No lanzar error en sincronización de background
        } finally {
            syncQueue.delete(entidad);
        }
    };
    
    /**
     * Guardar en caché local e IndexedDB
     */
    const guardarEnCache = async (entidad, datos) => {
        try {
            // Guardar en memoria
            memoryCache.set(entidad, {
                data: datos,
                timestamp: Date.now()
            });
            
            // Guardar en IndexedDB
            idb.almacen = entidad;
            await idb.borrartodo(); // Limpiar datos viejos
            
            // Si es un array, guardar cada elemento
            if (Array.isArray(datos)) {
                for (const item of datos) {
                    await idb.guardardatos(item);
                }
            } else {
                await idb.guardardatos(datos);
            }
            
            // Actualizar timestamp
            syncTimestamps.set(entidad, Date.now());
            
        } catch (error) {
            console.error(`Error guardando en caché ${entidad}:`, error);
            throw error;
        }
    };
    
    /**
     * Comparar si dos objetos tienen el mismo contenido
     */
    const tienenMismoContenido = (obj1, obj2) => {
        try {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        } catch {
            return false;
        }
    };
    
    /**
     * Invalidar caché de una entidad
     */
    const invalidate = async (entidad) => {
        try {
            memoryCache.delete(entidad);
            syncTimestamps.delete(entidad);
            
            idb.almacen = entidad;
            await idb.borrartodo();
            
            console.log(`🗑️ Caché de ${entidad} invalidado`);
        } catch (error) {
            console.error(`Error invalidando caché:`, error);
        }
    };
    
    /**
     * Invalidar todo el caché
     */
    const invalidateAll = async () => {
        try {
            memoryCache.clear();
            syncTimestamps.clear();
            syncQueue.clear();
            
            // Limpiar IndexedDB completamente
            await idb.deleteDatabase('db-thesalus');
            
            console.log(`🗑️ Todo el caché ha sido limpiado`);
        } catch (error) {
            console.error(`Error limpiando todo el caché:`, error);
        }
    };
    
    /**
     * Monitorear cambios de conexión
     */
    onMounted(() => {
        window.addEventListener('online', async () => {
            isOnline.value = true;
            console.log('🟢 Conexión restaurada');
            notificaciones.agregarNotificacion({
                tipo: 'success',
                mensaje: 'Conexión restaurada'
            });
            
            // Sincronizar todas las entidades pendientes
            for (const entidad of syncQueue) {
                console.log(`Sincronizando ${entidad}...`);
            }
        });
        
        window.addEventListener('offline', () => {
            isOnline.value = false;
            console.log('🔴 Sin conexión');
            notificaciones.agregarNotificacion({
                tipo: 'warning',
                mensaje: 'Sin conexión - usando datos locales'
            });
        });
    });
    
    return {
        cacheFirst,
        staleWhileRevalidate,
        invalidate,
        invalidateAll,
        isOnline,
        syncQueue,
        guardarEnCache,
        tienenMismoContenido
    };
}
