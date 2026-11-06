import { defineStore } from 'pinia'
import { decryptData } from '~/composables/Formulario/crypto'

const CLAVE = 'santa_exportaciones'
const ESTADOS_ACTIVOS = ['pendiente', 'procesando', 'comprimiendo']

/**
 * Frecuencia de consulta adaptativa según el tiempo transcurrido.
 * Los primeros minutos consulta cada 15 s; si el cron del servidor está
 * ampliado (exportaciones de 10-20 min) baja a 60 s para no saturar el sistema.
 */
function frecuenciaConsulta(msTranscurrido) {
    if (msTranscurrido < 120000) return 15000
    if (msTranscurrido < 300000) return 20000
    return 60000
}

function token() {
    return decryptData(localStorage.getItem('token'))
}

function avisar(color, texto, tiempo) {
    const notificaciones = useNotificacionesStore()
    notificaciones.options.position = 'top-end'
    notificaciones.options.background = color
    notificaciones.options.color = '#fff'
    notificaciones.options.texto = texto
    notificaciones.options.tiempo = tiempo
    notificaciones.mensaje()
    // Restaura el valor por defecto para que los siguientes avisos
    // que no definan color no hereden el anterior
    notificaciones.options.background = '#d33'
}

export const useExportacion = defineStore('exportacion', {
    state: () => ({
        cola: [],
    }),

    getters: {
        activas: (s) => s.cola.filter(i => ESTADOS_ACTIVOS.includes(i.estado)),
        listas: (s) => s.cola.filter(i => i.estado === 'lista'),
        fallidas: (s) => s.cola.filter(i => i.estado === 'fallida' || i.estado === 'cancelada'),
        contador: (s) => s.cola.length,
        porId: (s) => (id) => s.cola.find(i => i.id === id) || null,
    },

    actions: {
        async iniciar(filtros) {
            const config = useRuntimeConfig()
            const notificaciones = useNotificacionesStore()
            try {
                const res = await fetch(`${config.public.api}/${config.public.exportarAsync}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token()}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        servicio: filtros.servicio,
                        id_paciente: filtros.id_paciente,
                        id_profesional: filtros.id_profesional,
                        fechaInicio: filtros.fechaInicio,
                        fechaFin: filtros.fechaFin,
                    }),
                })

                if (res.status === 429) {
                    let datos = null
                    try { datos = await res.json() } catch (e) { /* respuesta sin cuerpo */ }
                    avisar(
                        '#f59e0b',
                        datos?.message
                        || 'Actualmente el sistema está procesando el máximo de exportaciones permitidas. Por favor espere unos minutos e inténtelo nuevamente.',
                        4500
                    )
                    return null
                }

                if (!res.ok) throw new Error(`Error al iniciar la exportación: ${res.status}`)

                const json = await res.json()
                const item = {
                    id: json.export_id,
                    servicio: filtros.servicio,
                    rango: {
                        fechaInicio: filtros.fechaInicio,
                        fechaFin: filtros.fechaFin,
                    },
                    etiqueta: filtros.etiqueta || '',
                    filtros: {
                        servicio: filtros.servicio,
                        id_paciente: filtros.id_paciente || '',
                        id_profesional: filtros.id_profesional || '',
                        fechaInicio: filtros.fechaInicio,
                        fechaFin: filtros.fechaFin,
                    },
                    estado: 'pendiente',
                    total: 0,
                    completados: 0,
                    creado: Date.now(),
                    proxima: Date.now() + 15000,
                    notificado: false,
                }
                this.cola.push(item)
                this.persistir()

                avisar(
                    '#3b82f6',
                    `Exportación de ${item.servicio} iniciada — puedes seguir trabajando. Te avisaremos cuando esté lista.`,
                    4500
                )
                return item
            } catch (error) {
                console.error('Error al iniciar la exportación:', error)
                avisar(
                    '#d33',
                    'No se pudo iniciar la exportación. Verifica tu conexión e inténtalo de nuevo.',
                    3500
                )
                return null
            }
        },

        async tick() {
            const ahora = Date.now()
            const pendientes = this.cola.filter(
                i => ESTADOS_ACTIVOS.includes(i.estado) && i.proxima <= ahora
            )
            if (!pendientes.length) return

            const config = useRuntimeConfig()
            for (const item of pendientes) {
                try {
                    const res = await fetch(
                        `${config.public.api}/${config.public.estadoExport}/${item.id}/estado`,
                        {
                            headers: {
                                Authorization: `Bearer ${token()}`,
                                'Accept': 'application/json',
                            },
                        }
                    )

                    if (res.status === 404) {
                        // Vigencia de 24 h cumplida: el servidor ya la eliminó
                        this.expirada(item)
                        continue
                    }
                    if (!res.ok) {
                        item.proxima = Date.now() + 60000
                        continue
                    }

                    const info = await res.json()
                    item.estado = info.estado
                    item.total = info.total || 0
                    item.completados = info.completados || 0

                    if (item.estado === 'lista') {
                        item.proxima = 0
                        this.notificarLista(item)
                    } else if (item.estado === 'fallida' || item.estado === 'cancelada') {
                        item.proxima = 0
                        this.notificarFalla(item)
                    } else {
                        item.proxima = Date.now() + frecuenciaConsulta(Date.now() - item.creado)
                    }
                    this.persistir()
                } catch (error) {
                    // Sin respuesta de red: reintenta en 60 s sin perder el estado
                    item.proxima = Date.now() + 60000
                }
            }
        },

        notificarLista(item) {
            if (item.notificado) return
            item.notificado = true
            const notificaciones = useNotificacionesStore()
            notificaciones.options.icono = 'success'
            notificaciones.options.titulo = 'Tus PDFs están listos'
            notificaciones.options.texto = `${item.servicio}: descárgalos desde «Exportaciones» en la barra superior.`
            notificaciones.options.tiempo = 6000
            notificaciones.simple()
            this.persistir()
        },

        notificarFalla(item) {
            const notificaciones = useNotificacionesStore()
            notificaciones.options.icono = 'error'
            notificaciones.options.titulo = 'La exportación falló'
            notificaciones.options.texto = `${item.servicio}: inténtalo de nuevo desde «Exportaciones».`
            notificaciones.options.tiempo = 5000
            notificaciones.simple()
            this.persistir()
        },

        expirada(item) {
            this.quitar(item.id)
            avisar('#f59e0b', 'Una exportación expiró sin descargarse (vigencia de 24 horas).', 3500)
        },

        async descargar(id) {
            const item = this.porId(id)
            if (!item) return false
            const config = useRuntimeConfig()
            try {
                const res = await fetch(
                    `${config.public.api}/${config.public.descargarExport}/${id}/descarga`,
                    { headers: { Authorization: `Bearer ${token()}` } }
                )

                if (res.status === 409) {
                    // El ZIP ya se descargó una vez o fue eliminado por el servidor
                    this.quitar(id)
                    avisar('#f59e0b', 'El archivo ya no está disponible: fue descargado o expiró.', 3500)
                    return false
                }
                if (!res.ok) throw new Error(`Error al descargar: ${res.status}`)

                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)

                let fileName = `${item.servicio}.zip`
                const disposition = res.headers.get('Content-Disposition')
                if (disposition) {
                    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/)
                    if (match && match[1]) fileName = decodeURIComponent(match[1])
                }

                const a = document.createElement('a')
                a.href = url
                a.download = fileName
                document.body.appendChild(a)
                a.click()
                a.remove()
                setTimeout(() => window.URL.revokeObjectURL(url), 10000)

                this.quitar(id)
                avisar('#22c55e', 'Descarga iniciada', 2500)
                return true
            } catch (error) {
                console.error('Error al descargar la exportación:', error)
                avisar('#d33', 'No se pudo descargar el archivo. Inténtalo de nuevo.', 3000)
                return false
            }
        },

        async reintentar(id) {
            const anterior = this.porId(id)
            if (!anterior) return null
            const nuevo = await this.iniciar(anterior.filtros)
            if (nuevo) this.quitar(id)
            return nuevo
        },

        descartar(id) {
            this.quitar(id)
        },

        quitar(id) {
            this.cola = this.cola.filter(i => i.id !== id)
            this.persistir()
        },

        restaurar() {
            try {
                const crudo = localStorage.getItem(CLAVE)
                const datos = crudo ? JSON.parse(crudo) : []
                this.cola = Array.isArray(datos)
                    ? datos.filter(i => i && typeof i.id !== 'undefined' && typeof i.estado === 'string')
                    : []
            } catch (e) {
                this.cola = []
            }

            // Avisa las que quedaron listas mientras la aplicación estaba cerrada
            this.cola
                .filter(i => i.estado === 'lista' && !i.notificado)
                .forEach(i => this.notificarLista(i))
        },

        persistir() {
            try {
                localStorage.setItem(CLAVE, JSON.stringify(this.cola))
            } catch (e) { /* almacenamiento no disponible */ }
        },
    },
})
