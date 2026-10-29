import { decryptData } from '~/composables/Formulario/crypto';
const SESSION_KEYS = ['token', 'user', 'Rol', 'Permisos', 'permisosTemporales', 'seccion', 'ultimaSincronizacion']

export function useSession() {
    const notificaciones = useNotificacionesStore()
    const noEnviados = useNoEnviados()
    const router = useRouter()

    async function clearSession() {
        if(noEnviados.totalDocumentosNoEnviados > 0){
            notificaciones.options = {
                icono: "warning",
                titulo: "¿Deseas cerrar sesión?",
                html: `Se eliminarán los datos que no hayas sincronizado.`,
                confirmtext: "Sí, salir",
                canceltext: "Atrás"
            };

            const respuesta = await notificaciones.alertRespuesta();

            if (respuesta !== "confirmado") return;

        }

        await cerrarSesion()
        // SESSION_KEYS.forEach(key => localStorage.removeItem(key))
        // sessionStorage.clear()
        router.push('/')
    }

    return { clearSession }
}

async function cerrarSesion() {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    let options = {
        metodo: 'POST',
        url: config.public.logout,
        token: token,
    }
    await api.functionCall(options)
}