import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { eliminarVadecum } from "~/Core/Codigos/DeleteVadecum";

export function useVadecumActions({
    vadecumStore,
    varView,
    notificaciones,
    show,
    showVer,
    llamadatos
}) {

    const agregarVadecum = () => {
        mapCamposLimpios(vadecumStore.Formulario);
        show.value = true;
        varView.soloVer = false;
    };

    const cerrar = () => {
        show.value = false;
        showVer.value = false;
        varView.soloVer = false;
    };

    const verVadecum = (vadecum) => {
        mapCampos(vadecum, vadecumStore.Formulario);
        vadecumStore.Formulario.Vadecum.id = vadecum.id;
        showVer.value = true;
    };

    const eliminarVadecums = async () => {
        const vadecum = vadecumStore.Formulario;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar este producto?",
            html: `Se eliminará: <span>${vadecum.Vadecum.producto}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await eliminarVadecum(vadecum.Vadecum.id);
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
            texto: "Producto eliminado con éxito.",
            background: "#6bc517",
            tiempo: 1500
        };

        notificaciones.mensaje();
        cerrar();
        await llamadatos();
    };

    return {
        agregarVadecum,
        verVadecum,
        cerrarVadecum: cerrar,
        eliminarVadecums
    };
}
