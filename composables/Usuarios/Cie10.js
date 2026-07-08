import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { eliminarCie10 } from "~/Core/Codigos/DeleteCie10";

export function useCie10Actions({
    cie10Store,
    varView,
    notificaciones,
    show,
    showVer,
    llamadatos
}) {

    const agregarCie10 = () => {
        mapCamposLimpios(cie10Store.Formulario);
        show.value = true;
        varView.soloVer = false;
    };

    const cerrar = () => {
        show.value = false;
        showVer.value = false;
        varView.soloVer = false;
    };

    const verCie10 = (cie10) => {
        mapCampos(cie10, cie10Store.Formulario);
        cie10Store.Formulario.Cie10.id = cie10.id;
        showVer.value = true;
    };

    const eliminarCie10s = async () => {
        const cie10 = cie10Store.Formulario;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar este código?",
            html: `Se eliminará: <span>${cie10.Cie10.nombre}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await eliminarCie10(cie10.Cie10.id);
        if (!eliminado.success) {
            notificaciones.options = {
                position: "top-end",
                texto: "Error al eliminar",
                background: "#d33",
                tiempo: 1500
            };
            notificaciones.mensaje();
            return;
        }

        notificaciones.options = {
            position: "top-end",
            texto: "Código eliminado con éxito.",
            background: "#6bc517",
            tiempo: 1500
        };

        notificaciones.mensaje();
        cerrar();
        await llamadatos();
    };

    return {
        agregarCie10,
        verCie10,
        cerrar,
        eliminarCie10s
    };
}
