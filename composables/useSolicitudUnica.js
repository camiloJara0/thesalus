// Deduplicación de peticiones en vuelo + descarte de respuestas obsoletas.
//
// - Mismo namespace + key concurrentes → 1 sola petición HTTP, todos consumen la misma promesa.
// - Si inicia una petición más nueva en el mismo namespace, la anterior se aborta
//   (AbortController) y su consumidor recibe `undefined`: siempre prevalece la última.
//
// Uso:
//   const datos = await solicitudUnica('citasFiltradas', JSON.stringify(filtros), (signal) =>
//       fetchAlgo(signal))
//   if (datos === undefined) return   // descartada u offline

const enVuelo = new Map()        // `${ns}::${key}` -> { promesa, controller }
const ultimoControl = new Map()  // namespace -> controller de la última petición

export function esAbortada(error) {
    return error?.name === 'AbortError' || error?.code === 20
}

export async function solicitudUnica(namespace, key, fn) {
    const id = `${namespace}::${key}`

    const existente = enVuelo.get(id)
    if (existente) return existente.promesa

    const anterior = ultimoControl.get(namespace)
    if (anterior) {
        try { anterior.abort() } catch { /* ya abortado */ }
    }

    const controller = new AbortController()
    ultimoControl.set(namespace, controller)

    const promesa = (async () => {
        try {
            return await fn(controller.signal)
        } catch (error) {
            if (esAbortada(error)) return undefined
            throw error
        } finally {
            const actual = enVuelo.get(id)
            if (actual?.promesa === promesa) enVuelo.delete(id)
            if (ultimoControl.get(namespace) === controller) ultimoControl.delete(namespace)
        }
    })()

    enVuelo.set(id, { promesa, controller })
    return promesa
}

// Solo para pruebas: limpia el estado interno
export function reiniciarSolicitudes() {
    for (const { controller } of enVuelo.values()) {
        try { controller.abort() } catch { /* noop */ }
    }
    enVuelo.clear()
    ultimoControl.clear()
}
