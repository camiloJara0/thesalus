import { decryptData } from '~/composables/Formulario/crypto';
export const enviarCeldasPintadas = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {

            const colorCeldas = await api.getData('CeldaColors', 'celdaColors')

            // Procesar celdas pintadas: POST para nuevas, PUT para actualizaciones
            for(let i = 0; i < datos.celdasPintadas.length; i++){
                const celdaActual = datos.celdasPintadas[i];
                
                // Buscar si la celda ya existe en colorCeldas
                const celdaExistente = colorCeldas.find(c => 
                    c.fila === celdaActual.fila && c.columna === celdaActual.columna
                );
                
                let options = {
                    url: config.public.celdaColors,
                    token: token,
                    body: {
                        fila: celdaActual.fila,
                        columna: celdaActual.columna,
                        color: celdaActual.color,
                        tabla: datos.tabla,
                        id_infoUsuario: datos.id_infoUsuario,
                    }
                }
                
                // Si existe: actualizar con PUT solo si el color cambió, si no existe: crear con POST
                if (celdaExistente) {
                    // Solo actualizar si el color ha cambiado
                    if(celdaExistente.color !== celdaActual.color){
                        options.metodo = 'PUT';
                        options.body.id = celdaExistente.id
                        options.url = config.public.celdaColors + '/' + celdaExistente.id
                        await api.functionCall(options);
                    }
                    // Si el color no cambió, continúa sin hacer nada
                } else {
                    options.metodo = 'POST';
                    await api.functionCall(options);
                }
            }
            
            // Procesar celdas que deben ser eliminadas
            for(let j = 0; j < colorCeldas.length; j++){
                const celdaEnSistema = colorCeldas[j];
                
                // Buscar si la celda existe en datos.celdasPintadas
                const celdaExisteEnDatos = datos.celdasPintadas.find(c => 
                    c.fila === celdaEnSistema.fila && c.columna === celdaEnSistema.columna
                );
                
                // Si no existe en datos: eliminar con DELETE
                if (!celdaExisteEnDatos) {
                    let options = {
                        metodo: 'DELETE',
                        url: config.public.celdaColors + '/' + celdaEnSistema.id,
                        token: token,
                        body: {
                            fila: celdaEnSistema.fila,
                            columna: celdaEnSistema.columna,
                            tabla: datos.tabla,
                            id_infoUsuario: datos.id_infoUsuario,
                        }
                    }
                    
                    await api.functionCall(options);
                }
            }

            return true

        } catch (error) {
            console.error('Fallo al enviar.', error);
        }
    } else {
    }
};