import { decryptData } from '~/composables/Formulario/crypto';
export async function exportarServicioPDF(servicio, id) {

    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const res = await fetch(
        `${config.public.api}/api/v1/${servicio}/${id}/pdf`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/pdf'
            }
        }
    )

    if (!res.ok)
        throw new Error(res.status)

    const blob = await res.blob()
    return window.URL.createObjectURL(blob)
}

export function usePDFExporter() {
    const varView = useVarView()
    async function exportar(servicio, id) {
        try {
            varView.cargando = true

            const url = await exportarServicioPDF(servicio, id)
            window.open(url, '_blank')

            setTimeout(() =>
                window.URL.revokeObjectURL(url), 10000)

        } finally {
            varView.cargando = false
        }
    }

    return { exportar }
}