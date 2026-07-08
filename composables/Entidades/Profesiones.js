import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { useProfesionStore } from "~/stores/Entidades/Profesion";

export function useProfesionesActions({
    notificaciones,
}) {

    /* ===============================
       MODALES
    =============================== */
    const profesionStore = useProfesionStore()
    const varView = useVarView()

    const agregarProfesion = () => {
        mapCamposLimpios(profesionStore.Formulario.Profesion);
        profesionStore.showNuevaProfesion = true;
        varView.soloVer = false;
    };

    const cerrar = () => {
        profesionStore.showModificarProfesion = false;
        profesionStore.showNuevaProfesion = false;
        varView.soloVer = false;
    };

    /* ===============================
       VER / MODIFICAR PROFESIONAL
    =============================== */

    const modificarProfesion = async(profesion) => {
        profesionStore.Formulario.Profesion = JSON.parse(JSON.stringify(profesion))
        const permisos = await profesionStore.traerPermisos(profesion.id)
        profesionStore.Formulario.Profesion.ListaPacientes = permisos.includes("ListaPacientes")
        profesionStore.Formulario.Profesion.Diagnosticos_view = permisos.includes("Diagnosticos_view")
        profesionStore.Formulario.Profesion.permisos = permisos
        profesionStore.showModificarProfesion = true;
    };

    /* ===============================
       ELIMINAR PROFESIONAL
    =============================== */

    const eliminarProfesion = async (data) => {
        profesionStore.Formulario.Profesion = JSON.parse(JSON.stringify(data))
        const profesion = profesionStore.Formulario.Profesion;
        const notificaciones = useNotificacionesStore()

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar la profesion?",
            html: `Se eliminará la profesion: <span>${profesion.nombre}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await profesionStore.eliminar(profesion);
        if (!eliminado) return;

        notificaciones.options = {
            position: "top-end",
            texto: "Profesion eliminado con éxito.",
            background: "#6bc517",
            tiempo: 1500
        };

        notificaciones.mensaje();
        notificaciones.options.background = "#d33";

        cerrar();
        await profesionStore.traer(true, true);
    };

    return {
        agregarProfesion,
        modificarProfesion,
        cerrar,
        eliminarProfesion
    };
}
