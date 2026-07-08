<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import { decryptData } from '~/composables/Formulario/crypto';

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const {
  options,
  simple,
} = useNotificacionesStore()

const token = route.query.token
const varView = useVarView()
const estado = ref('cargando')

onMounted(async () => {

  if (!token) return

  // ❌ No logueado → login
  if (!varView.getRol || varView.getRol === '') {
    window.location.href = '/'
  }

  try {

    const tokenLogin = decryptData(localStorage.getItem('token'))
    if (varView.getRol !== 'Admin') {
      options.icono = 'error';
      options.titulo = 'Solicitud de Permiso';
      options.texto = 'Rol de usuario sin permiso';
      options.tiempo = 5000;
      await simple();
      window.location.href = '/'
      return
    }

    await $fetch(`${config.public.api}/api/v1/aprobarPermiso`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenLogin}`
      },
      body: {
        token: token
      }
    })

    options.icono = 'success';
    options.titulo = 'Solicitud de Permiso';
    options.texto = 'Permiso aprobado correctamente';
    options.tiempo = 5000;
    await simple();

    estado.value = 'exito'
    // Si está logueado → redirigir según lógica

    router.push('Home')

  } catch (error) {
    options.icono = 'error';
    options.titulo = 'Solicitud de Permiso';
    options.texto = 'No se puedo aprobar el permiso';
    options.tiempo = 5000;
    await simple();

    estado.value = 'error'
  }

})

</script>

<template>
  <FondoDefault>
  <div class="flex flex-col items-center justify-center">
    <div v-if="estado === 'cargando'" class="text-gray-600">
      Procesando tu solicitud de permiso...
    </div>

    <div v-else-if="estado === 'exito'" class="text-green-600 font-semibold">
      ✅ Permiso aprobado correctamente
    </div>

    <div v-else-if="estado === 'error'" class="text-red-600 font-semibold">
      ❌ No se pudo aprobar el permiso
    </div>
  </div>
</FondoDefault>
</template>