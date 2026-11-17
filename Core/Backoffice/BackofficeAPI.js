import { decryptData } from '~/composables/Formulario/crypto'

function obtenerToken() {
    return decryptData(localStorage.getItem('token'))
}

function rutaCompleta(ruta) {
    const config = useRuntimeConfig()
    return `${config.public.backoffice}${ruta}`
}

export async function backofficeGet(ruta) {
    const api = useApiRest()
    return await api.functionCall({
        metodo: 'GET',
        url: rutaCompleta(ruta),
        token: obtenerToken()
    })
}

export async function backofficePost(ruta, body = null) {
    const api = useApiRest()
    const opciones = {
        metodo: 'POST',
        url: rutaCompleta(ruta),
        token: obtenerToken()
    }
    if (body) opciones.body = body
    return await api.functionCall(opciones)
}

export async function backofficeDelete(ruta, body = null) {
    const api = useApiRest()
    const opciones = {
        metodo: 'DELETE',
        url: rutaCompleta(ruta),
        token: obtenerToken()
    }
    if (body) opciones.body = body
    return await api.functionCall(opciones)
}

export async function backofficeDescargar(ruta, nombreArchivo) {
    const config = useRuntimeConfig()
    const respuesta = await fetch(`${config.public.api}${rutaCompleta(ruta)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${obtenerToken()}` }
    })

    if (!respuesta.ok) {
        throw new Error(`No se pudo descargar el archivo (${respuesta.status})`)
    }

    const blob = await respuesta.blob()
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombreArchivo
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(url)
}
