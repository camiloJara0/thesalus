import { ref, computed } from 'vue'
import { ayudaSecciones, ayudaBusquedaData } from '~/data/Ayuda/ayudaContenido'

const sinonimos = {
    login: ['iniciar sesion', 'acceder', 'entrar', 'conexion', 'correo'],
    contrasena: ['password', 'clave', 'key', 'acceso'],
    paciente: ['usuarios', 'persona', 'cliente', 'dociente'],
    profesional: ['medico', 'doctor', 'especialista', 'profesion'],
    cita: ['cita', 'agendar', 'turno', 'consulta', 'reserva'],
    historial: ['historia clinica', 'historico', 'registro', 'expediente'],
    insumo: ['inventario', 'material', 'equipo', 'stock', 'producto'],
    empresa: ['configuracion', 'institucion', 'clinica', 'sede'],
    servicio: ['servicios', 'procedimiento', 'atencion'],
    cie10: ['enfermedad', 'diagnostico', 'codigo', 'enfermedades'],
    vademecum: ['medicamento', 'medicina', 'droga', 'fármaco'],
    permiso: ['permisos', 'acceso', ' autorizacion', 'rol'],
    offline: ['sin internet', 'conexion', 'pwa', 'offline'],
    factura: ['rips', 'facturacion', 'cobro', 'bill'],
    admin: ['administrador', 'administradores', 'usuario', 'usuarios'],
    exportar: ['excel', 'pdf', 'descargar', 'exportar'],
    convenio: ['convenios', 'aseguradora', 'eps'],
    dashboard: ['panel', 'inicio', 'home', 'principal'],
    kardex: ['kardex', 'seguimiento'],
    movimiento: ['movimientos', 'entrada', 'salida', 'prestamo'],
    grafico: ['grafico', 'chart', 'imc', 'evolucion']
}

const normalizar = (texto) => {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

const expandirSinonimos = (termino) => {
    const palabras = termino.split(' ')
    const expandido = new Set([termino])

    palabras.forEach(palabra => {
        Object.entries(sinonimos).forEach(([clave, valores]) => {
            if (clave.includes(palabra) || valores.some(v => v.includes(palabra))) {
                expandido.add(clave)
                valores.forEach(v => expandido.add(v))
            }
        })
    })

    return Array.from(expandido)
}

export function useAyudaSearch() {
    const terminoBusqueda = ref('')
    const filtroTipo = ref('todos')
    const resultados = ref([])
    const busquedaActiva = ref(false)

    const tiposFiltro = [
        { label: 'Todos', value: 'todos', icono: 'fa-solid fa-layer-group' },
        { label: 'Modulos', value: 'seccion', icono: 'fa-solid fa-cube' },
        { label: 'Pasos', value: 'paso', icono: 'fa-solid fa-list-ol' },
        { label: 'Consejos', value: 'consejo', icono: 'fa-solid fa-lightbulb' },
        { label: 'Alertas', value: 'alerta', icono: 'fa-solid fa-triangle-exclamation' },
        { label: 'FAQ', value: 'faq', icono: 'fa-solid fa-circle-question' }
    ]

    const buscar = (termino) => {
        terminoBusqueda.value = termino
        busquedaActiva.value = termino.length > 0

        if (!termino || termino.length < 2) {
            resultados.value = []
            return
        }

        const terminoNormalizado = normalizar(termino)
        const terminosExpandidos = expandirSinonimos(terminoNormalizado)
        const terminos = terminoNormalizado.split(' ').filter(t => t.length > 1)

        let coincidencias = []

        ayudaBusquedaData.forEach(item => {
            const textoNormalizado = normalizar(item.texto)
            const seccionNormalizada = normalizar(item.seccion)
            const tituloNormalizado = item.titulo ? normalizar(item.titulo) : ''

            let puntuacion = 0

            terminosExpandidos.forEach(te => {
                if (tituloNormalizado.includes(te)) puntuacion += 10
                if (textoNormalizado.includes(te)) puntuacion += 5
                if (seccionNormalizada.includes(te)) puntuacion += 3
            })

            terminos.forEach(termino => {
                if (tituloNormalizado.includes(termino)) puntuacion += 8
                if (textoNormalizado.includes(termino)) puntuacion += 4
                if (seccionNormalizada.includes(termino)) puntuacion += 2
            })

            if (textoNormalizado.startsWith(terminoNormalizado)) puntuacion += 15
            if (tituloNormalizado === terminoNormalizado) puntuacion += 20

            if (puntuacion > 0) {
                coincidencias.push({ ...item, puntuacion })
            }
        })

        coincidencias.sort((a, b) => b.puntuacion - a.puntuacion)

        const maxResultados = 20
        resultados.value = coincidencias.slice(0, maxResultados)
    }

    const resultadosFiltrados = computed(() => {
        if (filtroTipo.value === 'todos') return resultados.value
        return resultados.value.filter(r => r.tipo === filtroTipo.value)
    })

    const resultadosPorSeccion = computed(() => {
        const agrupados = {}
        resultadosFiltrados.value.forEach(r => {
            if (!agrupados[r.slug]) {
                agrupados[r.slug] = {
                    seccion: r.seccion,
                    slug: r.slug,
                    icono: r.icono,
                    color: r.color,
                    ruta: r.ruta,
                    items: []
                }
            }
            agrupados[r.slug].items.push(r)
        })
        return Object.values(agrupados)
    })

    const totalResultados = computed(() => resultadosFiltrados.value.length)

    const limpiarBusqueda = () => {
        terminoBusqueda.value = ''
        resultados.value = []
        busquedaActiva.value = false
        filtroTipo.value = 'todos'
    }

    return {
        terminoBusqueda,
        filtroTipo,
        tiposFiltro,
        resultados,
        resultadosFiltrados,
        resultadosPorSeccion,
        totalResultados,
        busquedaActiva,
        buscar,
        limpiarBusqueda,
        secciones: ayudaSecciones
    }
}
