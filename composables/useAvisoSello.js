import { navigateTo } from '#app';

export function useAvisoSello() {
    const notificaciones = useNotificacionesStore();
    const perfilStore = usePerfilStore();
    const varView = useVarView();

    async function avisarSiFaltaSello() {
        try {
            const rol = varView.getRol;
            const usuario = varView.getUser;

            if (rol !== 'Profesional' || !usuario?.id_profesional) return;
            if (sessionStorage.getItem('avisoSello')) return;

            sessionStorage.setItem('avisoSello', '1');

            await perfilStore.cargar();

            if (perfilStore.tieneSello) return;

            notificaciones.options.icono = 'warning';
            notificaciones.options.titulo = 'Falta tu sello y firma';
            notificaciones.options.html =
                'Todavía no cargas el <b>sello y firma</b> de tu perfil. ' +
                'Sin él, los PDFs que generes saldrán <b>sin la firma del profesional</b>.';
            notificaciones.options.confirmtext = 'Cargar ahora';
            notificaciones.options.canceltext = 'Después';

            const respuesta = await notificaciones.alertRespuesta();

            if (respuesta === 'confirmado') {
                await navigateTo('/Perfil?editar=1');
            }
        } catch (error) {
            console.error('Error en el aviso de sello:', error);
        }
    }

    return { avisarSiFaltaSello };
}
