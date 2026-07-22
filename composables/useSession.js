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

            SESSION_KEYS.forEach(key => localStorage.removeItem(key))
            sessionStorage.clear()
router.push('/')
        } else {
            SESSION_KEYS.forEach(key => localStorage.removeItem(key))
            sessionStorage.clear()
router.push('/')
        }
    }

    return { clearSession }
}
