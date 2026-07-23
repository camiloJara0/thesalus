// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function usePermisosProfesionalBuilder({
  storeId,
  storePinia,
  permisos,
  show,
  cerrar,
}) {
  const builder = new FormularioBuilder()

builder
      .setFormularioFondo(true)
      .nuevaSeccion('Solicitar permisos')
      .setFormularioShow(show)
      .setFormularioTipo('normal')
      .setFormularioTituloFormulario('Solicitar permisos')
      .setBotones([
        { type: 'enviar', text: 'Enviar', color: 'primary', },
        { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrar },
      ])
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-user-doctor text-purple-500 mr-1"></i>Secciones',
      tamaño: 'w-full md:col-span-2',
      forLabel: 'permisos'
    })
    .addCampo({
      component: 'Select',
      placeholder: 'Seleccione unicamente un permiso que requiera',
      id: 'permisos',
      id: 'name',
      tamaño: 'w-full md:col-span-2',
      vmodel: 'Profesion.id_seccion',
      options: permisos
    })

  return builder.build()
}