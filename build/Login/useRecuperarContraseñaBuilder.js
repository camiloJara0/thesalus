// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import CrossImg from '~/assets/img/cross.png'

export function useRecuperarContraseñaBuilder({
  storeId,
  storePinia,
  cerrar,
  show,
  enviarCodigo,
  validarCodigo,
  stateCodigo,
}) {
  const builder = new FormularioBuilder()

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
    .setFormularioEstilos('h-[70vh]! z-10')
    .setFormularioFondo(true)
    .setFormularioShow(show)
  if (stateCodigo) {
    builder.setBotones([
      { text: 'Siguiente', color: 'primary', type: 'enviar', },
      { text: 'Cancelar', color: 'neutral', type: 'cerrar', accion: cerrar },
    ])
  } else {
    builder.setBotones([
      { text: 'Enviar Codigo', color: 'secondary', type: 'enviarCodigo', accion: enviarCodigo },
      { text: 'Cancelar', color: 'neutral', type: 'cerrar', accion: cerrar },
    ])
  }
  builder
    .nuevaSeccion('Recuperar Contraseña')
    .addCampo({
      component: 'Imagen',
      src: CrossImg,
      tamaño: 'w-20 h-20 logo mt-8 mb-3 select-none invert dark:invert-0',
      contenedor: 'flex justify-center w-full col-span-2'
    })
    .addCampo({
      component: 'Label',
      text: `
            <div class="flex flex-col justify-center items-center gap-2 pt-4 pb-8 text-center">
                <h3 class="dark:text-white text-black text-3xl font-bold tracking-wide">Thesalus</h3>
                <p class="text-gray-600 dark:text-gray-300 max-w-md">
                  Introduce tu direccion de correo electronico para restablecer la contraseña.
                </p>
            </div>
        `,
      tamaño: 'w-full col-span-2 flex justify-center'
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Correo Electronico',
      icon: 'i-lucide-mail',
      type: 'email',
      id: 'correo-user',
      name: 'correo-user',
      tamaño: 'lg:w-2/3 w-full col-span-2 justify-self-center text-white!',
      vmodel: 'Usuario.correo',
    })
    .nuevaSeccion('Cambiar Contraseña')
    .addCampo({
      component: 'Imagen',
      src: CrossImg,
      tamaño: 'w-20 h-20 logo mt-8 mb-3 select-none invert dark:invert-0',
      contenedor: 'flex justify-center w-full col-span-2'
    })
    .addCampo({
      component: 'Label',
      text: `
            <div class="flex flex-col justify-center items-center gap-2 pt-4 pb-8 text-center">
                <h3 class="dark:text-white text-black text-3xl font-bold tracking-wide">Thesalus</h3>
                <p class="text-gray-600 dark:text-gray-300 max-w-md">
                  Ingresa el código enviado a tu correo y crea una contraseña segura para tu cuenta.
                </p>
            </div>
        `,
      tamaño: 'w-full col-span-2 flex justify-center'
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Codigo de Recuperacion',
      icon: 'i-lucide-key',
      type: 'text',
      id: 'codigo',
      name: 'codigo',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      vmodel: 'Usuario.codigo',
      events: {
        OnChange: validarCodigo
      }
    })
    .addCampo({
      component: 'InputContraseña',
      placeholder: 'Cambiar contraseña',
      icon: 'i-lucide-lock',
      type: 'password',
      id: 'contraseña',
      name: 'contraseña',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      vmodel: 'Usuario.contraseña',
    })

  return builder.build()
}