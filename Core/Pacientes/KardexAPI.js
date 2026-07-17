import { decryptData } from '~/composables/Formulario/crypto';

function getToken() {
    return decryptData(localStorage.getItem('token'));
}

export async function fetchPlantillas() {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const respuesta = await api.functionCall({ metodo: 'GET', url: config.public.kardexPlantillas, token });
    return respuesta?.success ? respuesta.data : [];
}

export async function fetchCamposPlantilla(plantillaId) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardexPlantillas}/${plantillaId}`;
    const respuesta = await api.functionCall({ metodo: 'GET', url, token });
    return respuesta?.success ? respuesta.data.campos : [];
}

export async function fetchCamposDisponibles() {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const respuesta = await api.functionCall({ metodo: 'GET', url: config.public.kardexCampos, token });
    return respuesta?.success ? respuesta.data : [];
}

export async function fetchRegistrosPaciente(pacienteId, plantillaId = null) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    let url = `${config.public.kardexRegistros}/${pacienteId}`;
    if (plantillaId) url += `?plantilla=${plantillaId}`;
    const respuesta = await api.functionCall({ metodo: 'GET', url, token });
    return respuesta?.success ? respuesta.data : [];
}

export async function fetchRegistrosPlantilla(plantillaId) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardex}/registrosPlantilla`;
    const respuesta = await api.functionCall({ metodo: 'POST', url, body: { id_plantilla: plantillaId }, token });
    return respuesta?.success ? respuesta.data : [];
}

export async function guardarRegistros(datos) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const respuesta = await api.functionCall({
        metodo: 'POST',
        url: config.public.kardexRegistros,
        token,
        body: datos
    });
    return respuesta?.success ? true : false;
}

export async function storeHistorialCambioSonda(data) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardex}/historialCambioSonda`;
    const respuesta = await api.functionCall({
        metodo: 'POST',
        url,
        token,
        body: data
    });
    return respuesta?.success ? true : false;
}

export async function crearPlantilla(data) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const respuesta = await api.functionCall({
        metodo: 'POST',
        url: config.public.kardexPlantillas,
        token,
        body: data
    });
    return respuesta?.success ? respuesta.data : null;
}

export async function actualizarPlantilla(id, data) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardexPlantillas}/${id}`;
    const respuesta = await api.functionCall({
        metodo: 'PUT',
        url,
        token,
        body: data
    });
    return respuesta?.success ? true : false;
}

export async function eliminarPlantilla(id) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardexPlantillas}/${id}`;
    const respuesta = await api.functionCall({ metodo: 'DELETE', url, token });
    return respuesta?.success ? true : false;
}

export async function crearCampo(data) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();

    const respuesta = await api.functionCall({
        metodo: 'POST',
        url: config.public.kardexCampos,
        token,
        body: data
    });
    return respuesta?.success ? respuesta.data : null;
}

export async function actualizarCampo(id, data) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardexCampos}/${id}`;
    const respuesta = await api.functionCall({
        metodo: 'PUT',
        url,
        token,
        body: data
    });
    return respuesta?.success ? true : false;
}

export async function eliminarCampo(id) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardexCampos}/${id}`;
    const respuesta = await api.functionCall({ metodo: 'DELETE', url, token });
    return respuesta?.success ? true : false;
}

export async function agregarCampoPlantilla(plantillaId, data) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardexPlantillas}/${plantillaId}/campo`;
    const respuesta = await api.functionCall({
        metodo: 'POST',
        url,
        token,
        body: data
    });
    return respuesta?.success ? true : false;
}

export async function eliminarCampoPlantilla(plantillaId, campoId) {
    const api = useApiRest();
    const config = useRuntimeConfig();
    const token = getToken();
    const url = `${config.public.kardexPlantillas}/${plantillaId}/campo/${campoId}`;
    const respuesta = await api.functionCall({ metodo: 'DELETE', url, token });
    return respuesta?.success ? true : false;
}
