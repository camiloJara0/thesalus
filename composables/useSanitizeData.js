/**
 * Sanitiza datos para evitar el error "String contains an invalid character"
 * en navegadores como Safari y Firefox
 * 
 * El error ocurre cuando caracteres especiales, nulos o de control se usan
 * como atributos HTML o valores en el DOM
 */

/**
 * Elimina caracteres especiales/control que no son válidos en atributos HTML
 * @param {string} value - Valor a sanitizar
 * @returns {string} - Valor sanitizado
 */
export function sanitizeForAttribute(value) {
    if (!value) return '';
    
    return String(value)
        .replace(/[\x00-\x1F\x7F]/g, '')  // Caracteres de control (incluyendo caracteres nulos)
        .replace(/\r\n/g, ' ')            // Saltos de línea Windows
        .replace(/\n/g, ' ')              // Saltos de línea Unix
        .replace(/\r/g, ' ')              // Caracteres de retorno
        .replace(/\t/g, ' ')              // Tabulaciones
        .replace(/\s{2,}/g, ' ')          // Espacios múltiples
        .trim();                          // Espacios al inicio y final
}

/**
 * Sanitiza recursivamente todos los strings en un objeto
 * @param {*} obj - Objeto, array o valor primitivo a sanitizar
 * @returns {*} - Objeto sanitizado
 */
export function sanitizeObject(obj) {
    // Si es string, sanitizar directamente
    if (typeof obj === 'string') {
        return sanitizeForAttribute(obj);
    }
    
    // Si es null o no es objeto, retornar como está
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Si es array, mapear cada elemento
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    // Si es objeto, procesar cada propiedad
    return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        
        if (typeof value === 'string') {
            acc[key] = sanitizeForAttribute(value);
        } else if (typeof value === 'object' && value !== null) {
            acc[key] = sanitizeObject(value);
        } else {
            acc[key] = value;
        }
        
        return acc;
    }, {});
}

/**
 * Sanitiza solo strings en un array de objetos
 * @param {Array} array - Array de objetos a sanitizar
 * @returns {Array} - Array sanitizado
 */
export function sanitizeArray(array) {
    if (!Array.isArray(array)) {
        return array;
    }
    return array.map(item => sanitizeObject(item));
}
