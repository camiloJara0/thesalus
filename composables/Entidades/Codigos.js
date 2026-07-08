import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { useCie10Store } from "~/stores/Entidades/Cie10";
import { useServicioStore } from "~/stores/Entidades/Servicio";

export function useCodigosActions({
    notificaciones,
}) {
    const servicioStore = useServicioStore()
    const cie10Store = useCie10Store()

    // AGREGAR PACIENTE
    const agregarCie10 = () => {
        const varView = useVarView()
        cie10Store.showNuevoCie10 = true;
        varView.soloVer = false;
    };

    // CERRAR MODALES
    const cerrarCie10 = () => {
        const varView = useVarView()
        cie10Store.showNuevoCie10 = false
        cie10Store.showModificarCie10 = false
        mapCamposLimpios(cie10Store.Formulario)
        varView.soloVer = true;
    };

    // EDITAR PACIENTE
    const verCie10 = async (cie10) => {
        cie10Store.Formulario.Cie10 = JSON.parse(JSON.stringify(cie10))
        mapCampos(cie10, cie10Store.Formulario);
        cie10Store.Formulario.Cie10.id = cie10.id;
        cie10Store.showModificarCie10 = true;
    };

    // ELIMINAR PACIENTE
    const eliminarCie10 = async () => {
        const cie10 = cie10Store.Formulario.Convenio;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar este codigo Cie10?",
            html: `Se eliminará: <span>${cie10.nombre}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await store.eliminar(cie10);
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
            texto: "Cie10 eliminado con éxito.",
            background: "#6bc517",
            tiempo: 1500
        };

        notificaciones.mensaje();
    };


    function nuevoServicio() {
        servicioStore.showNuevoServicio = true
    }

    function actualizarServicio(servicio) {
        mapCampos(servicio, servicioStore.Formulario)
        servicioStore.Formulario.Servicio.id = servicio.id
        servicioStore.Formulario.Servicio.id_temporal = servicio.id_temporal
        servicioStore.showModificarServicio = true
    }

    function cerrarServicio() {
        servicioStore.showNuevoServicio = false
        servicioStore.showModificarServicio = false
        mapCamposLimpios(servicioStore.Formulario)
    }

    const eliminarServicio = async (servicio) => {
        const convenio = store.Formulario.Convenio;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar este servicio?",
            html: `Se eliminará: <span>${servicio.name}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await servicioStore.eliminar(servicio);
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
    };

    return {
        agregarCie10,
        verCie10,
        cerrarCie10,
        eliminarCie10,
        nuevoServicio,
        actualizarServicio,
        cerrarServicio,
        eliminarServicio,
    };
}
