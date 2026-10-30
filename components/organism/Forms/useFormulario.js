// composables/useFormulario.js
import { ref, computed } from 'vue'

import { accionesFormularios } from '~/stores/Formularios/accionesFormulario'
import { loadComponent } from '~/components/organism/Forms/componentLoader'

export function useFormulario(props, formData = null) {
    const varView = useVarView()
    const notificaciones = useNotificacionesStore()
    const seccionActual = ref(0)

    // Guardado automatico + indicador de estado
    const estadoGuardado = ref('idle')
    const ultimoGuardado = ref(null)
    const autoSaveActivo = Boolean(formData && props.Propiedades.formulario?.autoSave)
    let debounceGuardado = null
    let ocultarIndicador = null

    function persistirAutomatico() {
        if (!autoSaveActivo) return

        estadoGuardado.value = 'guardando'
        clearTimeout(debounceGuardado)
        clearTimeout(ocultarIndicador)

        debounceGuardado = setTimeout(() => {
            const ok = guardarDatos(formData)

            if (ok) {
                estadoGuardado.value = 'guardado'
                ultimoGuardado.value = new Date()
                ocultarIndicador = setTimeout(() => {
                    estadoGuardado.value = 'idle'
                }, 3000)
            } else {
                estadoGuardado.value = 'error'
            }
        }, 800)
    }

    if (autoSaveActivo) {
        watch(() => formData, persistirAutomatico, { deep: true })
        watch(() => seccionActual.value, persistirAutomatico)
    }

    // Inicializa formData
    function transformarFormData(secciones) {
        const resultado = {}
        secciones.forEach(seccion => {
            seccion.campos.forEach(campo => {
                const clave = campo.vmodel
                if (!clave || typeof clave !== 'string') return
                const partes = clave.split('.')
                let form = resultado

                for (let i = 0; i < partes.length; i++) {
                    const parte = partes[i]
                    if (i === partes.length - 1) {
                        form[parte] = campo.value ? campo.value : ''
                    } else {
                        if (!form[parte] || typeof form[parte] !== 'object') {
                            form[parte] = {}
                        }
                        form = form[parte]
                    }
                }
            })
        })
        return resultado
    }

    // Computed: campos de la sección actual
    const camposActuales = computed(() => {
        const secciones = props.Propiedades.formulario?.secciones || []
        return secciones[seccionActual.value]?.campos || []
    })

    // Computed: instancias dinámicas de componentes
    const componentInstances = computed(() => {
        const map = {}
        const secciones = props.Propiedades.formulario?.secciones || []
        const campos = secciones[seccionActual.value]?.campos || []
        campos.forEach(campo => {
            if (campo.component && !map[campo.component]) {
                map[campo.component] = loadComponent(campo.component)
            }
        })
        return map
    })

    // Navegación de secciones
    function siguienteSeccion() {
        if (seccionActual.value < props.Propiedades.formulario.secciones.length - 1) {
            seccionActual.value++
        }
    }

    function anteriorSeccion() {
        if (seccionActual.value > 0) {
            seccionActual.value--
        }
    }

    // ─────────────────────────────────────────────
    // VALIDACIÓN Y PROGRESO POR PASO
    // ─────────────────────────────────────────────

    function secciones() {
        return props.Propiedades.formulario?.secciones || []
    }

    /**
     * Rutas (vmodel) faltantes de una sección.
     * @returns {string[]}
     */
    function faltantesSeccion(index, datos = formData) {
        const seccion = secciones()[index]
        if (!seccion || !Array.isArray(seccion.requeridos) || !seccion.requeridos.length) return []
        if (!datos) return []

        return seccion.requeridos.filter(ruta => !isValid(getValue(datos, ruta)))
    }

    /**
     * Valida una sección. Si no hay formData disponible
     * recurre a los inputs nativos inválidos del paso actual.
     */
    function validarSeccion(index, datos = formData) {
        const faltantes = faltantesSeccion(index, datos)

        if (faltantes.length > 0) return false

        if (index === seccionActual.value) {
            const invalidos = document.querySelectorAll('input:invalid, textarea:invalid')
            if (invalidos.length > 0) return false
        }

        return true
    }

    /**
     * Completitud de una sección (0-100).
     * Prioriza la regla de dominio `completitud(formData)` del builder;
     * si no existe, calcula sobre los campos requeridos.
     */
    function progresoSeccion(index, datos = formData) {
        const seccion = secciones()[index]
        if (!seccion || !datos) return 0

        if (typeof seccion.completitud === 'function') {
            return Math.round(Math.min(100, Math.max(0, seccion.completitud(datos))))
        }

        const requeridos = seccion.requeridos || []
        // Sin requeridos explicitos: mide el diligenciamiento de todos los campos con vmodel
        const rutas = requeridos.length
            ? requeridos
            : (seccion.campos || []).map(c => c.vmodel).filter(Boolean)

        if (!rutas.length) return 0

        const listos = rutas.filter(ruta => isValid(getValue(datos, ruta))).length
        return Math.round((listos / rutas.length) * 100)
    }

    /** Progreso total del formulario (0-100). */
    const progresoFormulario = computed(() => {
        const lista = secciones()
        if (!lista.length || !formData) return 0

        const suma = lista.reduce((total, _seccion, index) => total + progresoSeccion(index), 0)
        return Math.round(suma / lista.length)
    })

    /**
     * Navega a un paso: solo se permite saltar a pasos cuyos
     * pasos anteriores están completos (avance progresivo).
     */
    function irASeccion(index) {
        const lista = secciones()
        if (index < 0 || index >= lista.length) return false
        if (index === seccionActual.value) return true

        if (index > seccionActual.value) {
            for (let i = 0; i < index; i++) {
                if (!validarSeccion(i)) {
                    notificarPasoIncompleto(faltantesSeccion(i))
                    seccionActual.value = i
                    return false
                }
            }
        }

        seccionActual.value = index
        return true
    }

    function notificarPasoIncompleto(faltantes = []) {
        notificaciones.options.position = 'top-end'
        notificaciones.options.background = '#d33'
        notificaciones.options.texto = faltantes.length
            ? `Completa los campos obligatorios (${faltantes.length}) para continuar`
            : 'Completa los campos obligatorios para continuar'
        notificaciones.options.tiempo = 1800
        notificaciones.mensaje()
    }

    // funciones para manejar vmodel
    function getValue(obj, path) {
        if (!path) return undefined
        return path.split('.').reduce((acc, key) => acc[key], obj)
    }

    function setValue(obj, path, value) {
        if (!path) return undefined
        const keys = path.split('.')
        const lastKey = keys.pop()
        const target = keys.reduce((acc, key) => acc[key], obj)
        target[lastKey] = value
    }

    function isValid(value) {
        if (Array.isArray(value)) return value.length > 0
        return value !== '' && value !== null && value !== undefined
    }

    function camposRequeridos(formData) {
        const camposRequeridos = ref(props.Propiedades?.content?.camposRequeridos || []);

        const camposValidos = camposRequeridos.value.every((ruta) => {
            const valor = getValue(formData, ruta)
            return isValid(valor)
        });

        // Detectar inputs inválidos
        const camposInvalidos = document.querySelectorAll('input:invalid');
        varView.formComplete = camposInvalidos.length === 0 && camposValidos;

        if (!varView.formComplete && camposInvalidos.length > 0) {
            const primerCampo = camposInvalidos[0];

            // Generar hipervínculo dinámico
            primerCampo.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primerCampo.focus();

            return false;
        }

        return varView.formComplete
    }

    // Botones
    async function manejarClick(event, item, formData, limpiar) {
        event.preventDefault()
        varView.cargando = true
        if (item.type === 'enviar') {
            if(props.Propiedades.formulario.soloVer && seccionActual.value === props.Propiedades.formulario.secciones.length - 1){
                varView.cargando = false
                return
            }
            if (seccionActual.value < props.Propiedades.formulario.secciones.length - 1) {
                guardarDatos(formData)
                siguienteSeccion()
            } else {
                const validacion = camposRequeridos(formData)
                if (validacion) {
                    const confirmado = await confirmarResumen(formData)
                    if (confirmado) {
                        await mandarFormulario(formData, limpiar)
                    }
                } else {
                    validarform()
                }
            }
        } else if (item.type === 'cerrar') {
            if (seccionActual.value > 0) {
                anteriorSeccion()
            } else {
                limpiar()
                item.accion()
            }
        } else {
            item.accion(formData)
        }
        varView.cargando = false
    }

    // Persistencia en localStorage (borradores)
    // Contexto opcional del borrador (paciente/plantilla) para no mezclar registros
    function contextoBorrador(datos) {
        const fn = props.Propiedades?.content?.draftContext
        if (typeof fn === 'function') {
            try { return String(fn(datos ?? formData) ?? '') } catch (e) { return '' }
        }
        return ''
    }

    function claveBorrador(datos) {
        const ctx = contextoBorrador(datos)
        return ctx ? `${props.Propiedades.content.storeId}::${ctx}` : props.Propiedades.content.storeId
    }

    /**
     * Restaura un borrador previamente guardado en el objeto destino.
     * Solo restaura si el contexto coincide (evita mezclar pacientes)
     * y descarta el formato antiguo (objeto plano sin metadatos).
     */
    function restaurarBorrador(destino) {
        if (!destino) return false

        const clave = claveBorrador(destino)
        const crudo = localStorage.getItem(clave)
        if (!crudo) return false

        let envoltura
        try {
            envoltura = JSON.parse(crudo)
        } catch (e) {
            localStorage.removeItem(clave)
            return false
        }

        if (!envoltura || typeof envoltura !== 'object' || !envoltura.datos || typeof envoltura.datos !== 'object') {
            localStorage.removeItem(clave)
            return false
        }

        if ((envoltura.ctx || '') !== contextoBorrador(destino)) return false

        Object.assign(destino, envoltura.datos)
        return true
    }

    function hayBorrador() {
        try {
            return localStorage.getItem(claveBorrador(formData)) !== null
        } catch (e) {
            return false
        }
    }

    function guardarDatos(newValue) {
        try {
            const clave = claveBorrador(newValue)
            localStorage.setItem(clave, JSON.stringify({
                ts: Date.now(),
                ctx: contextoBorrador(newValue),
                datos: newValue,
            }))
            return true
        } catch (e) {
            console.error('No se pudo guardar el borrador:', e)
            return false
        }
    }

    function limpiarLocal() {
        localStorage.removeItem(claveBorrador(formData))
    }

    // Restauración de borradores: inmediata y reactiva al contexto.
    // El contexto (paciente/plantilla) puede conocerse DESPUÉS del mount
    // (p.ej. el paciente se selecciona al abrir el wizard de historia),
    // por eso se restaura también cuando el contexto pasa a estar disponible.
    let ctxPrevio = contextoBorrador(formData)
    restaurarBorrador(formData)
    watch(() => contextoBorrador(formData), (ctx) => {
        if (ctx !== ctxPrevio) {
            ctxPrevio = ctx
            restaurarBorrador(formData)
        }
    })

    /**
     * Resumen previo al envio (opt-in: formulario.resumen).
     * Muestra un resumen legible de lo diligenciado antes de guardar.
     */
    async function confirmarResumen(datos) {
        if (!props.Propiedades.formulario?.resumen) return true

        const lineas = []
        for (const seccion of secciones()) {
            lineas.push(`<div style="margin:8px 0 2px;font-weight:600;color:#326872">${seccion.nombre}</div>`)
            for (const campo of seccion.campos || []) {
                if (!campo.vmodel || !campo.label || campo.component === 'Label' || campo.component === 'GroupCampos') continue
                const valor = getValue(datos, campo.vmodel)
                if (!isValid(valor)) continue

                let texto = ''
                if (Array.isArray(valor)) {
                    const objetos = valor.filter(v => v && typeof v === 'object')
                    if (objetos.length && objetos[0].medicamento) {
                        texto = objetos.map(o => o.medicamento).join(', ')
                    } else if (objetos.length && objetos[0].procedimiento) {
                        texto = objetos.map(o => o.procedimiento).join(', ')
                    } else if (objetos.length && objetos[0].descripcion) {
                        texto = objetos.map(o => o.descripcion).join(', ')
                    } else {
                        texto = `${valor.length} registro(s)`
                    }
                } else if (valor && typeof valor === 'object') {
                    continue
                } else {
                    texto = String(valor)
                }

                if (texto.length > 200) texto = texto.substring(0, 200) + '…'
                lineas.push(
                    `<div style="padding:1px 0"><span style="color:#6b7280">${campo.label}:</span> ${texto}</div>`
                )
            }
        }

        if (!lineas.length) return true

        notificaciones.options.icono = 'info'
        notificaciones.options.titulo = 'Resumen del registro'
        notificaciones.options.html =
            `<div style="max-height:45vh;overflow:auto;text-align:left;font-size:13px">${lineas.join('')}</div>`
        notificaciones.options.confirmtext = 'Guardar registro'
        notificaciones.options.canceltext = 'Revisar'
        const respuesta = await notificaciones.alertRespuesta()
        return respuesta === 'confirmado'
    }

    function validarform() {
        notificaciones.options.position = 'top-end'
        notificaciones.options.background = '#d33'
        notificaciones.options.texto = "Faltan campos por llenar, por favor ingrese valores"
        notificaciones.options.tiempo = 1500
        notificaciones.mensaje()
    }

    async function mandarFormulario(data, limpiar) {
        const accion = accionesFormularios[props.Propiedades.content.storeId]
        varView.cargando = true
        if (typeof accion === 'function') {
            try {
                const res = await accion(data)
                if (res === true) {
                    notificaciones.options.icono = 'success'
                    notificaciones.options.background = '#22c55e'
                    notificaciones.options.position = 'top-end'
                    notificaciones.options.texto = '¡Se ha enviado correctamente!'
                    notificaciones.options.tiempo = 1500
                    notificaciones.mensaje()
                    limpiarLocal()
                    limpiar()
                    varView.cambioEnApi = true
                }
                return res
            } catch (err) {
                // notificaciones.options.icono = 'warning'
                // notificaciones.options.titulo = '¡Ha ocurrido un problema!'
                // notificaciones.options.texto = 'No se pudo enviar formulario, datos guardados localmente'
                // notificaciones.options.tiempo = 5000
                // notificaciones.simple()
                console.error(`Error enviando formulario '${props.Propiedades.content.storeId}':`, err)
                return false
            } finally {
                varView.cargando = false
                // limpiar()
            }
        } else {
            console.warn(`No se encontró función de envío para '${props.Propiedades.content.storeId}'`)
            varView.cargando = false
            return false
        }
    }

    return {
        transformarFormData,
        guardarDatos,
        restaurarBorrador,
        hayBorrador,
        seccionActual,
        camposActuales,
        componentInstances,
        siguienteSeccion,
        anteriorSeccion,
        getValue,
        setValue,
        isValid,
        manejarClick,

        // Guardado automático e indicador de estado
        autoSaveActivo,
        estadoGuardado,
        ultimoGuardado,
        persistirAutomatico,
        // Validación y progreso por paso
        faltantesSeccion,
        validarSeccion,
        progresoSeccion,
        progresoFormulario,
        irASeccion,
        notificarPasoIncompleto,
        camposRequeridos,
        mandarFormulario,
        limpiarLocal,
        confirmarResumen,
    }
}

// Funcion para completar formulario con datos de Tablas
export function mapCampos(tabla, pinia) {
    for (const key in pinia) {
        if (typeof pinia[key] === 'object' && pinia[key] !== null && !Array.isArray(pinia[key])) {
            mapCampos(tabla, pinia[key]);
        } else if (key in tabla) {
            pinia[key] = tabla[key];
        }
    }
}

export function mapCamposLimpios(pinia) {
    for (const key in pinia) {
        const valor = pinia[key]

        // Manejo de tipos especiales
        if (valor instanceof Blob || valor instanceof File) {
            pinia[key] = null; // o new Blob()
            continue;
        }
        if (valor instanceof Date) {
            pinia[key] = null; // o new Date(0)
            continue;
        }

        if (typeof valor === 'object' && valor !== null && !Array.isArray(valor)) {
            mapCamposLimpios(valor);
        } else {
            // Limpiar según el tipo de dato
            if (typeof valor === 'string') {
                pinia[key] = '';
            } else if (typeof valor === 'number') {
                pinia[key] = '';
            } else if (typeof valor === 'boolean') {
                pinia[key] = false;
            } else if (Array.isArray(valor)) {
                pinia[key] = [];
            } else {
                pinia[key] = null;
            }

        }
    }
}
