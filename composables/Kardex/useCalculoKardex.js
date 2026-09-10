import { computed } from 'vue'

const OPERACIONES = {
    suma: (a, b) => a + b,
    resta: (a, b) => a - b,
    multiplicacion: (a, b) => a * b,
    division: (a, b) => b !== 0 ? a / b : 0,
}

export function useCalculoKardex(campo, registros) {
    const campoIds = computed(() => {
        if (!campo?.opciones) return []
        return campo.opciones
            .split('\n')
            .map(id => Number(id.trim()))
            .filter(id => !isNaN(id) && id > 0)
    })

    const resultado = computed(() => {
        const ids = campoIds.value
        if (!ids.length || !registros?.value) return ''

        const operation = OPERACIONES[campo.tipo]
        if (!operation) return ''

        const valores = ids.map(id => {
            const val = registros.value.value[id]
            const num = parseFloat(val)
            return isNaN(num) ? 0 : num
        })

        if (valores.length === 0) return ''

        let result = valores[0]
        for (let i = 1; i < valores.length; i++) {
            result = operation(result, valores[i])
        }

        if (campo.tipo === 'division') {
            return Number.isInteger(result) ? result : parseFloat(result.toFixed(2))
        }

        return result
    })

    return { resultado }
}
