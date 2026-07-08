import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { useEpsStore } from "~/stores/Entidades/Eps";

export function useEpsActions({
  notificaciones
}) {
  const store = useEpsStore()
  // AGREGAR PACIENTE
  const agregarEps = () => {
    const varView = useVarView()
    store.showNuevaEps = true;
    varView.soloVer = false;
  };

  // CERRAR MODALES
  const cerrar = () => {
    const varView = useVarView()
    store.showNuevaEps = false
    store.showModificarEps = false
    mapCamposLimpios(store.Formulario)
    varView.soloVer = true;
  };

  // EDITAR PACIENTE
  const verEps = async (eps) => {
    store.Formulario.EPS = JSON.parse(JSON.stringify(eps))
    console.log(store.Formulario.EPS)
    store.Formulario.EPS.nombre = eps.nombre
    // mapCampos(eps, store.Formulario);
    store.showModificarEps = true;
  };

  // ELIMINAR PACIENTE
  const eliminarEps = async (eps) => {
    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar la EPS?",
      html: `Se eliminará la EPS: <span>${eps.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {
      const res = await store.eliminar(eps)
      if (res) {
        notificaciones.options.position = 'top-end';
        notificaciones.options.texto = "Eps eliminado con exito.";
        notificaciones.options.background = '#6bc517'
        notificaciones.options.tiempo = 1500
        notificaciones.mensaje()
        notificaciones.options.background = '#d33'

        cerrar()
      }
    }
  };


  return {
    agregarEps,
    verEps,
    cerrar,
    eliminarEps
  };
}
