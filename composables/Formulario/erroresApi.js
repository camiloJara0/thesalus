// Interprete centralizado de errores de la API.
// Formato estandarizado backend: { success: false, message, codigo, accion, errors? }
// codigo: validacion | autenticacion | permiso | no_encontrado | conflicto | solicitud | rate_limit | servidor
// conexion: derivado en el cliente (sin red / timeout / caida del servidor)

const CODIGO_POR_STATUS = {
    401: 'autenticacion',
    403: 'permiso',
    404: 'no_encontrado',
    409: 'conflicto',
    419: 'autenticacion',
    422: 'validacion',
    429: 'rate_limit',
}

const TITULOS = {
    validacion: 'Información inválida',
    autenticacion: 'Sesión expirada',
    permiso: 'Acceso denegado',
    no_encontrado: 'Registro no encontrado',
    conflicto: 'Conflicto de información',
    rate_limit: 'Demasiadas solicitudes',
    servidor: 'Problema del servidor',
    conexion: 'Sin conexión',
    solicitud: '¡Ha ocurrido un problema!',
}

export function codigoPorStatus(status) {
    return CODIGO_POR_STATUS[status] || 'solicitud'
}

/**
 * Convierte una respuesta de error HTTP de la API en un mensaje
 * especifico y comprensible para el usuario final.
 *
 * @returns {{ codigo: string, titulo: string, texto: string }}
 */
export function mensajeErrorApi(status, errorData, fallback = 'Error en la solicitud') {
    const codigo = errorData?.codigo || codigoPorStatus(status)

    let texto = errorData?.message || fallback

    // Validacion: el detalle por campo es lo mas accionable
    if (codigo === 'validacion') {
        const errores = errorData?.errors
        if (errores) {
            const primerCampo = Object.keys(errores)[0]
            texto = errores[primerCampo]?.[0] || texto
        }
        return { codigo, titulo: TITULOS.validacion, texto }
    }

    // Si el backend no aporta un mensaje claro, guia con la accion sugerida
    if (errorData?.accion && (!errorData?.message || texto === fallback)) {
        texto = errorData.accion
    } else if (errorData?.accion) {
        texto = `${texto} ${errorData.accion}`
    }

    return { codigo, titulo: TITULOS[codigo] || TITULOS.solicitud, texto }
}

/**
 * Interpreta una excepcion de fetch (red / timeout / cancelacion).
 *
 * @returns {{ codigo: 'conexion', titulo: string, texto: string } | null}
 *          null cuando la peticion fue abortada a proposito (se descarta).
 */
export function descripcionErrorRed(error, contexto = 'el servidor') {
    if (error?.name === 'AbortError' || error?.code === 20) return null
    if (typeof error?.message === 'string' && error.message === 'Timeout') {
        return {
            codigo: 'conexion',
            titulo: TITULOS.conexion,
            texto: `La respuesta de ${contexto} tardó demasiado. Verifique su conexión e intente de nuevo.`,
        }
    }
    return {
        codigo: 'conexion',
        titulo: TITULOS.conexion,
        texto: `No fue posible conectar con ${contexto}. Verifique su conexión a internet e intente de nuevo.`,
    }
}
