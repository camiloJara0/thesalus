// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useProfesionesBuilder({
  storeId,
  storePinia,
  actualizar,
  permisos,
  showModificarProfesion,
  cerrar,
  eliminar
}) {
  const builder = new FormularioBuilder()
  const varView = useVarView()
  const { hasPermiso } = usePermisos()

  const puedeDelete = hasPermiso('Datos_delete')
  if (eliminar) {
    builder
      .setFormularioFondo(true)
      .nuevaSeccion('Actualizar Profesion')
      .setFormularioShow(showModificarProfesion)
      .setFormularioTipo('Wizard')
      .setFormularioTituloFormulario('Profesion')
      .setBotones([
        { type: 'enviar', text: 'Enviar', color: 'primary', },
        { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrar },
      ])
  } else {
    builder
      .setFormularioFondo(true)
      .nuevaSeccion('Formulario Profesion')
      .setFormularioShow(showModificarProfesion)
      .setFormularioTipo('N/A')
      .setBotones([
        { type: 'enviar', text: 'Enviar', color: 'primary', },
        { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrar },
      ])
  }

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('MD')
    .setCamposRequeridos(['Profesion.nombre', 'Profesion.permisos',])
    .setEditarFormulario(actualizar)
    .setEliminarFormulario(puedeDelete ? eliminar : false)
    .addCampo({
      component: 'Label',
      text: '<i class="fa-solid fa-user-doctor text-purple-500 mr-1"></i>Profesiones',
      tamaño: 'w-full md:col-span-2',
      forLabel: 'Profesion'
    })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Nombre Profesion',
      id: 'Profesion',
      name: 'Profesion',
      minlength: 5,
      tamaño: 'col-span-1',
      vmodel: 'Profesion.nombre',
      upperCase: true
    })
    .addCampo({
      component: 'Input',
      type: 'text',
      placeholder: 'Codigo',
      id: 'ProfesionCodigo',
      name: 'ProfesionCodigo',
      minlength: 2,
      tamaño: 'col-span-1',
      vmodel: 'Profesion.codigo',
      upperCase: true
    })
      .addCampo({
        component: 'Checkbox',
        placeholder: 'Permitir mostrar todos los Pacientes?',
        tamaño: 'w-full',
        vmodel: 'Profesion.ListaPacientes',
      })
      .addCampo({
        component: 'Checkbox',
        placeholder: 'Permitir realizar diagnosticos?',
        tamaño: 'w-full',
        vmodel: 'Profesion.Diagnosticos_view',
      })
    .addCampo({
      component: 'Permisos',
      placeholder: 'Seleccione los permisos en cada Seccion',
      id: 'permisos',
      name: 'permisos',
      tamaño: 'w-full md:col-span-2',
      vmodel: 'Profesion.permisos',
      options: permisos,
      showOptions: true,
    })

  return builder.build()
}