// Catálogo central de estados de cita.
// Estados reales del backend: 'Inactiva' (pendiente), 'Realizada' (finalizada), 'cancelada'.
// Estado derivado: 'vencida' = Inactiva con fecha (fechaHasta || fecha) anterior a hoy.

const HOY = () => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export const ESTADOS_CITA = {
    pendiente: {
        label: 'Pendiente',
        badge: 'warning',
        variant: 'soft',
        rail: 'bg-amber-400',
        texto: 'text-amber-600 dark:text-amber-300',
    },
    vencida: {
        label: 'Vencida',
        badge: 'error',
        variant: 'solid',
        rail: 'bg-red-500',
        texto: 'text-red-600 dark:text-red-300',
    },
    finalizada: {
        label: 'Finalizada',
        badge: 'success',
        variant: 'subtle',
        rail: 'bg-green-500',
        texto: 'text-green-600 dark:text-green-300',
    },
    cancelada: {
        label: 'Cancelada',
        badge: 'error',
        variant: 'subtle',
        rail: 'bg-red-400',
        texto: 'text-red-600 dark:text-red-300',
        tachado: true,
    },
    desconocida: {
        label: 'Sin estado',
        badge: 'neutral',
        variant: 'subtle',
        rail: 'bg-gray-400',
        texto: 'text-gray-600 dark:text-gray-300',
    },
}

export function esVencida(cita) {
    if (!cita || cita.estado !== 'Inactiva') return false
    const fin = cita.fechaHasta || cita.fecha
    if (!fin) return false
    return fin < HOY()
}

export function claveEstadoCita(cita) {
    if (!cita) return 'desconocida'
    if (cita.estado === 'cancelada') return 'cancelada'
    if (cita.estado === 'Realizada') return 'finalizada'
    if (cita.estado === 'Inactiva') return esVencida(cita) ? 'vencida' : 'pendiente'
    return 'desconocida'
}

export function estadoDeCita(cita) {
    return ESTADOS_CITA[claveEstadoCita(cita)] || ESTADOS_CITA.desconocida
}

export function labelEstado(cita) {
    return estadoDeCita(cita).label
}

export function badgeEstado(cita) {
    const e = estadoDeCita(cita)
    return { color: e.badge, variant: e.variant, label: e.label }
}

export function railEstado(cita) {
    return estadoDeCita(cita).rail
}
