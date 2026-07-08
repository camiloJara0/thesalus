// composables/useFormulario.js
import { ref, computed } from 'vue'

import { accionesFormularios } from '~/stores/Formularios/accionesFormulario'
import { loadComponent } from '~/components/organism/Forms/componentLoader'

export function useFormulario(props) {
    const varView = useVarView()
    const notificaciones = useNotificacionesStore()
    const seccionActual = ref(0)

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
                    await mandarFormulario(formData, limpiar)
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

    // Persistencia en localStorage
    function traerDatos() {
        const datosGuardados = localStorage.getItem(props.Propiedades.content.storeId)
        return datosGuardados ? JSON.parse(datosGuardados) : null
    }

    function guardarDatos(newValue) {
        localStorage.setItem(props.Propiedades.content.storeId, JSON.stringify(newValue))
    }

    function limpiarLocal() {
        localStorage.removeItem(props.Propiedades.content.storeId)
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
        traerDatos,
        guardarDatos,
        seccionActual,
        camposActuales,
        componentInstances,
        siguienteSeccion,
        anteriorSeccion,
        getValue,
        setValue,
        isValid,
        manejarClick,
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
