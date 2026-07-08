import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { eliminarConvenio } from "~/Core/Convenios/DeleteConvenios";

export function useConvenioActions({
    convenioStore,
    varView,
    notificaciones,
    show,
    showVer,
    llamadatos
}) {

    const agregarConvenio = () => {
        mapCamposLimpios(convenioStore.Formulario);
        show.value = true;
        varView.soloVer = false;
    };

    const cerrar = () => {
        show.value = false;
        showVer.value = false;
        varView.soloVer = false;
    };

    const verConvenio = (convenio) => {
        mapCampos(convenio, convenioStore.Formulario);

        convenioStore.Formulario.Convenio.id = convenio.id;
        console.log(convenio.pacientes)
        convenioStore.Formulario.Convenio.pacientes_ids = convenio.pacientes.map(p => p.id);
        showVer.value = true;
    };

    const eliminarConvenios = async () => {
        const convenio = convenioStore.Formulario;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar este convenio?",
            html: `Se eliminará: <span>${convenio.Convenio.nombre}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await eliminarConvenio(convenio.Convenio.id);
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
            texto: "Convenio eliminado con éxito.",
            background: "#6bc517",
            tiempo: 1500
        };

        notificaciones.mensaje();
        cerrar();
        await llamadatos();
    };

    return {
        agregarConvenio,
        verConvenio,
        cerrar,
        eliminarConvenios
    };
}
