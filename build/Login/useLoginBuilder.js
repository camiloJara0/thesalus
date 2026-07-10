// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { validarYEnviarLogin } from '~/Core/Login/Ingresar';
import CrossImg from '~/assets/img/cross.png'
import { useUsuariosStore } from '~/stores/Formularios/login/Login';

export function useLoginBuilder({
  storeId,
  storePinia,
  recuperarcontraseña,
  cambiarContraseña,
  validaUsuario,
  mostrarContraseña
}) {
  const builder = new FormularioBuilder()
  const usuarioStore = useUsuariosStore()

  const cambiarMostrarContraseña = () => {
      mostrarContraseña.value = !mostrarContraseña.value;
  };

  builder
    .setStoreId(storeId)
    .setStorePinia(storePinia)
    .setFormulariotamaño('SM')
    .setFormularioFondo('FondoTransparent')
    .setFormularioShow(true)
    .setFormularioEstilos('h-[70%]! !bg-white/10 backdrop-blur-md rounded-xl shadow-lg w-full md:px-5 animate-fadeIn z-0')
    .nuevaSeccion()
    .addCampo({
      component: 'Imagen',
      src: CrossImg,
      tamaño: 'w-20 h-20 logo mb-2 select-none',
      contenedor: 'flex justify-center w-full col-span-2'
    })
    .addCampo({
      component: 'Label',
      text: `
            <div class="flex flex-col justify-center items-center gap-1 pb-5">
                <h3 class="text-white md:text-3xl text-xl font-bold">Thesalus</h3>
                <p class="text-gray-200 text-sm">Tu salud, nuestra prioridad</p>
            </div>
        `,
      tamaño: 'w-full col-span-2 flex justify-center'
    })
    .addCampo({
      component: 'Input',
      placeholder: 'Ingresa tu Correo',
      type: 'email',
      id: 'correo-user',
      name: 'correo-user',
      tamaño: 'lg:w-2/3 w-full col-span-2 justify-self-center',
      estilo: 'text-white!',
      vmodel: 'Usuario.correo',
      icon: 'i-lucide-mail',
      events: {
        onKeyUp: validaUsuario
      },
    })
    .addCampo({
      component: 'InputContraseña',
      placeholder: 'Ingresa tu Contraseña',
      id: 'password',
      name: 'contraseña',
      tamaño: 'lg:w-2/3 w-full justify-self-center col-span-2',
      estilo: 'text-white!',
      vmodel: 'Usuario.contraseña',
      icon: 'i-lucide-lock',
      fieldId: 'password',
      events: {
        onKeyUp: () => {validarYEnviarLogin(usuarioStore.Formulario)}
      },
    })
    .addCampo({
      component: 'Button',
      texto: 'Ingresar',
      color: 'primary',
      tamaño: 'col-span-2 lg:w-2/3 w-full mx-auto shadow-md transition-all duration-300 cursor-pointer active:scale-95',
      events: {
        onClick: () => {validarYEnviarLogin(usuarioStore.Formulario)}
      }
    })
    .addCampo({
      component: 'Label',
      text: `
                <p class="text-sm mt-2 text-gray-100 text-center">
                    ¿Olvidaste tu contraseña?
                    <span @click="recuperarContraseña"
                        class="underline font-semibold cursor-pointer hover:text-teal-300">Recuperar</span>
                </p>
        `,
      events: {
        onClick: recuperarcontraseña
      },
      tamaño: 'w-full col-span-2 flex justify-center'
    })
    .addCampo({
      component: 'Label',
      text: `
                <p class="text-xs text-gray-300 text-center mt-1">
                    Primer Ingreso
                    <span @click="cambiarContraseña"
                        class="underline font-semibold cursor-pointer hover:text-teal-300">Crear Contraseña</span>
                </p>
        `,
      events: {
        onClick: cambiarContraseña
      },
      tamaño: 'w-full col-span-2 flex justify-center text-center'
    })
  return builder.build()
}