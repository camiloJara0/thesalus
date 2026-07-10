import { decryptData } from "~/composables/Formulario/crypto";

export async function traerPacientes() {
  const varView = useVarView();
  const rol = varView.getRol;
  const apiRest = useApiRest();
  const store = useIndexedDBStore();
  const token = decryptData(localStorage.getItem('token'))
  const config = useRuntimeConfig()

  let filtrar = !varView.getPermisos.includes('ListaPacientes')
  let pacientes = []

  if(rol === 'Profesional' && filtrar ) {
    const pacientesFiltrados = await apiRest.functionCall({
      metodo: 'POST',
      url: config.public.traePacientes,
      token: token,
      body: {id_profesional: varView.getUser.id_profesional}
    })
    pacientes = pacientesFiltrados.data
  } else {
    const dataPacientes = await apiRest.functionCall({
      metodo: 'GET',
      url: config.public.pacientes,
      token: token
    })
    pacientes = dataPacientes.data
  }

  return pacientes;
}
