
// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarCambiarContraseña = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    const datosEnviar = { ...datos.Usuario }

    // Validaciones
    const errores = [];

    // Validar correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datosEnviar.correo || !correoRegex.test(datosEnviar.correo)) {
        errores.push('El correo electrónico no es válido.');
    }

    // Validar código (asumiendo que debe tener 6 caracteres)
    if (!datosEnviar.codigo || datosEnviar.codigo.length !== 6) {
        errores.push('El código de verificación debe tener 6 caracteres.');
    }

    // Validar contraseña (mínimo 8 caracteres, al menos una letra y un número)
    const contraseñaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!datosEnviar.contraseña || !contraseñaRegex.test(datosEnviar.contraseña)) {
        errores.push('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.');
    }

    // Si hay errores, mostrar notificación y detener envío
    if (errores.length > 0) {
        errores.forEach(msg => {
            notificacionesStore.options.icono = 'error';
            notificacionesStore.options.titulo = 'Informacion invalida.';
            notificacionesStore.options.texto = msg;
            notificacionesStore.options.tiempo = 3000;
            notificacionesStore.simple();
        });
        useNotificacionesStore.options.titulo = '';
        return false;
    }

    return await enviarFormulario(datosEnviar);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
        let options = {
                metodo: 'POST',
                url: config.public.cambiarContraseña,
                body: {
                    correo: datos.correo,
                    codigo: datos.codigo,
                    contraseña: datos.contraseña,
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                console.log('Contraseña cambiada')
                return true
            }
        return true
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos invalidos';
            notificacionesStore.options.texto = 'Intenta nuevamente con el codigo enviado a tu correo!'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'Recuperar contraseña cuando halla internet'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};