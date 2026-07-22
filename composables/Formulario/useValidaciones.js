/**
 * Composable centralizado de validación para formularios.
 * Todas las funciones retornan null si es válido, o un string con el mensaje de error.
 */

export function validarCelular(valor) {
    if (!valor || valor === '') return null
    const str = String(valor).trim()
    if (!/^\d{10}$/.test(str)) {
        return 'El celular debe tener exactamente 10 dígitos'
    }
    return null
}

export function validarTelefono(valor) {
    if (!valor || valor === '') return null
    const str = String(valor).trim()
    if (!/^\d{6,10}$/.test(str)) {
        return 'El teléfono debe tener entre 6 y 10 dígitos'
    }
    return null
}

export function validarEmail(valor) {
    if (!valor || valor === '') return null
    const str = String(valor).trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
        return 'Ingrese un correo electrónico válido'
    }
    return null
}

export function validarDocumento(valor) {
    if (!valor || valor === '') return 'El documento es obligatorio'
    const str = String(valor).trim()
    if (!/^\d{7,10}$/.test(str)) {
        return 'El documento debe tener entre 7 y 10 dígitos'
    }
    return null
}

export function validarNombre(valor) {
    if (!valor || valor === '') return 'El nombre es obligatorio'
    const str = String(valor).trim()
    if (str.length < 3) {
        return 'El nombre debe tener al menos 3 caracteres'
    }
    return null
}

export function validarPassword(valor) {
    if (!valor || valor === '') return 'La contraseña es obligatoria'
    if (valor.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres'
    }
    if (!/[A-Za-z]/.test(valor)) {
        return 'La contraseña debe contener al menos una letra'
    }
    if (!/\d/.test(valor)) {
        return 'La contraseña debe contener al menos un número'
    }
    return null
}

export function validarPasswordFortaleza(valor) {
    if (!valor || valor === '') return { level: 0, text: '' }
    let score = 0
    if (valor.length >= 8) score++
    if (/[A-Z]/.test(valor)) score++
    if (/[a-z]/.test(valor)) score++
    if (/\d/.test(valor)) score++
    if (/[^A-Za-z0-9]/.test(valor)) score++

    if (score <= 2) return { level: 1, text: 'Contraseña débil' }
    if (score <= 3) return { level: 2, text: 'Contraseña media' }
    return { level: 3, text: 'Contraseña fuerte' }
}

export function validarFechaFormato(valor) {
    if (!valor || valor === '') return null
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return 'Formato de fecha inválido (YYYY-MM-DD)'
    }
    const partes = valor.split('-')
    const anio = parseInt(partes[0], 10)
    const mes = parseInt(partes[1], 10)
    const dia = parseInt(partes[2], 10)
    if (mes < 1 || mes > 12) return 'Mes inválido'
    if (dia < 1 || dia > 31) return 'Día inválido'
    const fecha = new Date(anio, mes - 1, dia)
    if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
        return 'Fecha inválida'
    }
    return null
}

export function validarFechaNoPasada(valor) {
    if (!valor || valor === '') return null
    const formatoError = validarFechaFormato(valor)
    if (formatoError) return formatoError

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const partes = valor.split('-')
    const fecha = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10))
    fecha.setHours(0, 0, 0, 0)

    if (fecha < hoy) {
        return 'La fecha no puede ser en el pasado'
    }
    return null
}

export function validarFechaNacimiento(fecha, tipoDoc) {
    if (!fecha || fecha === '') return 'La fecha de nacimiento es obligatoria'
    const formatoError = validarFechaFormato(fecha)
    if (formatoError) return formatoError

    const hoy = new Date()
    const partes = fecha.split('-')
    const nacimiento = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10))
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mesActual = hoy.getMonth()
    const diaActual = hoy.getDate()
    if (mesActual < nacimiento.getMonth() || (mesActual === nacimiento.getMonth() && diaActual < nacimiento.getDate())) {
        edad--
    }

    if (edad < 0 || edad > 100) {
        return 'La edad debe estar entre 0 y 100 años'
    }

    if (tipoDoc === 'CC' && edad < 18) {
        return 'La cédula de ciudadanía requiere ser mayor de 18 años'
    }
    if (tipoDoc === 'TI' && edad > 17) {
        return 'La tarjeta de identidad es para menores de 18 años'
    }

    return null
}

export function validarHora(valor) {
    if (!valor || valor === '') return null
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(valor)) {
        return 'Formato de hora inválido (HH:mm)'
    }
    return null
}

export function validarFormatoPresionArterial(valor) {
    if (!valor || valor === '') return null
    if (!/^\d{2,3}\/\d{2,3}$/.test(valor)) {
        return 'Formato inválido (ej: 120/80)'
    }
    return null
}

export function validarDireccion(valor) {
    if (!valor || valor === '') return 'La dirección es obligatoria'
    const str = String(valor).trim()
    if (str.length < 5) {
        return 'La dirección debe tener al menos 5 caracteres'
    }
    return null
}

export function validarSelectRequerido(valor) {
    if (!valor || valor === '' || valor === null || valor === undefined) {
        return 'Este campo es obligatorio'
    }
    return null
}

export function validarCamposRequeridos(datos, campos) {
    const errores = {}
    for (const campo of campos) {
        const valor = campo.path.split('.').reduce((obj, key) => obj?.[key], datos)
        if (!valor || valor === '' || valor === null || valor === undefined) {
            errores[campo.path] = campo.mensaje || `${campo.label || campo.path} es obligatorio`
        }
    }
    return Object.keys(errores).length > 0 ? errores : null
}
