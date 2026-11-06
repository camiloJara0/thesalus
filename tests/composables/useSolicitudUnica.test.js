import { describe, it, expect, beforeEach } from 'vitest'
import {
    solicitudUnica,
    esAbortada,
    reiniciarSolicitudes,
} from '~/composables/useSolicitudUnica'

// fn que queda pendiente hasta que se complete o se aborte su signal
function fnPendiente(registro = []) {
    return (signal) =>
        new Promise((resolver, rechazar) => {
            registro.push({ signal, resolver })
            if (signal.aborted) {
                const err = new Error('abortado')
                err.name = 'AbortError'
                rechazar(err)
                return
            }
            signal.addEventListener('abort', () => {
                const err = new Error('abortado')
                err.name = 'AbortError'
                rechazar(err)
            })
        })
}

beforeEach(() => {
    reiniciarSolicitudes()
})

describe('useSolicitudUnica', () => {
    it('deduplica peticiones concurrentes con el mismo namespace y key', async () => {
        let llamadas = 0
        const fn = async () => {
            llamadas++
            return 'ok'
        }

        const [a, b] = await Promise.all([
            solicitudUnica('dedup', 'k', fn),
            solicitudUnica('dedup', 'k', fn),
        ])

        expect(llamadas).toBe(1)
        expect(a).toBe('ok')
        expect(b).toBe('ok')
    })

    it('aborta la petición anterior del mismo namespace y su consumidor recibe undefined', async () => {
        const registro = []
        const fn = fnPendiente(registro)

        const p1 = solicitudUnica('ns', 'a', fn)
        const p2 = solicitudUnica('ns', 'b', fn)

        // la primera quedó abortada por la segunda
        expect(registro[0].signal.aborted).toBe(true)
        expect(registro[1].signal.aborted).toBe(false)

        expect(await p1).toBeUndefined()

        registro[1].resolver('segundo')
        expect(await p2).toBe('segundo')
    })

    it('no aborta peticiones de namespaces distintos', async () => {
        const registro = []
        const fn = fnPendiente(registro)

        const p1 = solicitudUnica('nsA', 'k', fn)
        const p2 = solicitudUnica('nsB', 'k', fn)

        expect(registro[0].signal.aborted).toBe(false)
        expect(registro[1].signal.aborted).toBe(false)

        registro[0].resolver('primero')
        registro[1].resolver('segundo')

        expect(await p1).toBe('primero')
        expect(await p2).toBe('segundo')
    })

    it('propaga errores que no son de aborto', async () => {
        await expect(
            solicitudUnica('nsErr', 'k', async () => {
                throw new Error('boom')
            })
        ).rejects.toThrow('boom')
    })

    it('libera la key al terminar: una llamada posterior vuelve a ejecutar fn', async () => {
        let n = 0
        const fn = async () => ++n

        expect(await solicitudUnica('nsLibre', 'k', fn)).toBe(1)
        expect(await solicitudUnica('nsLibre', 'k', fn)).toBe(2)
    })

    it('esAbortada reconoce AbortError y el código 20', () => {
        const abortError = new Error('x')
        abortError.name = 'AbortError'
        expect(esAbortada(abortError)).toBe(true)
        expect(esAbortada({ code: 20 })).toBe(true)
        expect(esAbortada(new Error('normal'))).toBe(false)
        expect(esAbortada(undefined)).toBe(false)
    })

    it('reiniciarSolicitudes limpia el estado interno', async () => {
        const registro = []
        const p1 = solicitudUnica('nsReiniciar', 'k', fnPendiente(registro))
        reiniciarSolicitudes()

        expect(await p1).toBeUndefined()

        // tras reiniciar, la misma key vuelve a ejecutar fn
        let llamadas = 0
        const fn = async () => ++llamadas
        expect(await solicitudUnica('nsReiniciar', 'k', fn)).toBe(1)
        expect(llamadas).toBe(1)
    })
})
