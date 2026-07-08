import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { useConvenioStore } from "~/stores/Entidades/Convenio";

export function useConvenioActions({
  notificaciones,
}) {
  const store = useConvenioStore()
  // AGREGAR PACIENTE
  const agregarConvenio = () => {
    const varView = useVarView()
    store.showNuevoConvenio = true;
    varView.soloVer = false;
  };

  // CERRAR MODALES
  const cerrar = () => {
    const varView = useVarView()
    store.showNuevoConvenio = false
    store.showModificarConvenio = false
    mapCamposLimpios(store.Formulario)
    varView.soloVer = true;
  };

  // EDITAR PACIENTE
  const verConvenio = async (convenio) => {
    store.Formulario.Convenio = JSON.parse(JSON.stringify(convenio))
    mapCampos(convenio, store.Formulario);
    store.Formulario.Convenio.id = convenio.id;
    store.Formulario.Convenio.pacientes_ids = convenio.pacientes.map(p => p.id);
    store.showModificarConvenio = true;
  };

  // ELIMINAR PACIENTE
  const eliminarConvenio = async (convenio) => {
    const notificaciones = useNotificacionesStore()
    notificaciones.options.icono = "warning",
      notificaciones.options.titulo = "¿Deseas eliminar este convenio?",
      notificaciones.options.html = `Se eliminará: <span>${convenio.nombre}</span>`,
      notificaciones.options.confirmtext = "Sí, eliminar",
      notificaciones.options.canceltext = "Atrás"

    const respuesta = await notificaciones.alertRespuesta();
    if (respuesta !== "confirmado") return;

    const eliminado = await store.eliminar(convenio.id);
    if (!eliminado.success) {

      notificaciones.options.position = "top-end",
        notificaciones.options.texto = "Error al eliminar",
        notificaciones.options.background = "#d33",
        notificaciones.options.tiempo = 1500

      notificaciones.mensaje();
      return;
    }
    notificaciones.options.position = "top-end",
      notificaciones.options.texto = "Convenio eliminado con éxito.",
      notificaciones.options.background = "#6bc517",
      notificaciones.options.tiempo = 1500

    notificaciones.mensaje();
  };


  return {
    agregarConvenio,
    verConvenio,
    cerrar,
    eliminarConvenio
  };
}
