import { describe, it, expect } from 'vitest'
import {
    ESTADOS_CITA,
    esVencida,
    claveEstadoCita,
    estadoDeCita,
    labelEstado,
    badgeEstado,
    railEstado,
} from '~/data/estadosCita'

const hoy = () => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

describe('estadosCita', () => {
    describe('esVencida', () => {
        it('Inactiva con fecha pasada es vencida', () => {
            expect(esVencida({ estado: 'Inactiva', fecha: '2020-01-01' })).toBe(true)
        })

        it('Inactiva con fecha de hoy o futura no es vencida', () => {
            expect(esVencida({ estado: 'Inactiva', fecha: hoy() })).toBe(false)
            expect(esVencida({ estado: 'Inactiva', fecha: '2999-12-31' })).toBe(false)
        })

        it('usa fechaHasta si existe', () => {
            expect(
                esVencida({ estado: 'Inactiva', fecha: '2999-12-31', fechaHasta: '2020-01-01' })
            ).toBe(true)
        })

        it('solo aplica a Inactiva', () => {
            expect(esVencida({ estado: 'Realizada', fecha: '2020-01-01' })).toBe(false)
            expect(esVencida({ estado: 'cancelada', fecha: '2020-01-01' })).toBe(false)
        })

        it('sin fecha no es vencida', () => {
            expect(esVencida({ estado: 'Inactiva' })).toBe(false)
            expect(esVencida(null)).toBe(false)
        })
    })

    describe('claveEstadoCita', () => {
        it('mapea los estados del backend', () => {
            expect(claveEstadoCita({ estado: 'Inactiva', fecha: '2999-12-31' })).toBe('pendiente')
            expect(claveEstadoCita({ estado: 'Inactiva', fecha: '2020-01-01' })).toBe('vencida')
            expect(claveEstadoCita({ estado: 'Realizada' })).toBe('finalizada')
            expect(claveEstadoCita({ estado: 'cancelada' })).toBe('cancelada')
            expect(claveEstadoCita({ estado: 'otro' })).toBe('desconocida')
            expect(claveEstadoCita(null)).toBe('desconocida')
        })
    })

    describe('estadoDeCita / labelEstado / badgeEstado / railEstado', () => {
        it('pendiente: warning + ámbar', () => {
            const cita = { estado: 'Inactiva', fecha: '2999-12-31' }
            expect(estadoDeCita(cita)).toBe(ESTADOS_CITA.pendiente)
            expect(labelEstado(cita)).toBe('Pendiente')
            expect(badgeEstado(cita)).toEqual({
                color: 'warning',
                variant: 'soft',
                label: 'Pendiente',
            })
            expect(railEstado(cita)).toBe('bg-amber-400')
        })

        it('vencida: error + rojo', () => {
            const cita = { estado: 'Inactiva', fecha: '2020-01-01' }
            expect(labelEstado(cita)).toBe('Vencida')
            expect(badgeEstado(cita).color).toBe('error')
            expect(railEstado(cita)).toBe('bg-red-500')
        })

        it('finalizada: success + verde', () => {
            const cita = { estado: 'Realizada' }
            expect(labelEstado(cita)).toBe('Finalizada')
            expect(badgeEstado(cita).color).toBe('success')
            expect(railEstado(cita)).toBe('bg-green-500')
        })

        it('cancelada: error + rail rojo', () => {
            const cita = { estado: 'cancelada' }
            expect(labelEstado(cita)).toBe('Cancelada')
            expect(railEstado(cita)).toBe('bg-red-400')
        })

        it('estado desconocido cae a "Sin estado"', () => {
            expect(labelEstado({ estado: 'otro' })).toBe('Sin estado')
            expect(badgeEstado({ estado: 'otro' }).color).toBe('neutral')
        })
    })
})
