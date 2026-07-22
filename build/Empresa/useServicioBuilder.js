// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useServicioBuilder({
  storeId,
  storePinia,
  actualizar,
  showModificarServicio,
  cerrar,
  eliminar
}) {
  const builder = new FormularioBuilder()
  const varView = useVarView()
  const { hasPermiso } = usePermisos()
  const puedeDelete = hasPermiso('Datos_delete')
  
  if (actualizar) {
    builder
      .setFormularioFondo(true)
      .nuevaSeccion('Formulario Servicio')
      .setFormularioTipo('Wizard')
      .setFormularioTituloFormulario('Servicio')
      .setFormularioShow(showModificarServicio)
  } else {
    builder
      .setFormularioFondo(true)
      .nuevaSeccion('Agregar Nuevo Servicio')
      .setFormularioTipo('normal')
      .setFormularioTituloFormulario('Servicio')
      .setFormularioShow(showModificarServicio)
  }

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
      .setBotones([
        {type: 'enviar', text: 'Enviar', color: 'primary',},
        {type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrar},
      ])
    .setCamposRequeridos(['Servicio.name', 'Servicio.plantilla',])
    .setEditarFormulario(actualizar)
    .setEliminarFormulario(puedeDelete ? eliminar : false)
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-user-doctor text-purple-500 mr-1"></i>Servicio',
      tamaño: 'w-full md:col-span-2',
      forLabel: 'Servicio'
    })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Nombre Servicio',
      id: 'Servicio',
      name: 'Servicio',
      minlength: 5,
      tamaño: 'md:col-span-2',
      vmodel: 'Servicio.name',
      // upperCase: true
    })
    .addCampo({
      component: 'Select',
      placeholder: 'Seleccione la plantilla',
      id: 'plantilla',
      name: 'plantilla',
      tamaño: 'w-full md:col-span-2',
      vmodel: 'Servicio.plantilla',
      options: [
        {label: 'Nota', value: 'Nota'},
        {label: 'Terapia', value: 'Terapia'},
        {label: 'Evolucion', value: 'Evolucion'},
        {label: 'Medicina Especializada', value: 'Medicina'},
        {label: 'Trabajo Social', value: 'Trabajo Social'},
      ],
    })

  return builder.build()
}