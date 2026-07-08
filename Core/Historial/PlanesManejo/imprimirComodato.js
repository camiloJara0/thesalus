
import { decryptData } from '~/composables/Formulario/crypto';

export const imprimirPDFComoDato = async (data) => {
    const varView = useVarView();
    varView.cargando = true;
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    console.log(data)
    try {
        const respuesta = await fetch(`${config.public.api}/${config.public.imprimirComodato}/${data.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf',
                'Content-Type': 'application/json'
            },
        });

        if (!respuesta.ok) {
            throw new Error('Error al obtener el PDF');
        }

        const blob = await respuesta.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error al imprimir PDF:', error);
        throw error;
    } finally {
        varView.cargando = false;
    }
};