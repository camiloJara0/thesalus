<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted } from 'vue';
import { useVarView } from '~/stores/varview';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { useLoginBuilder } from '~/build/Login/useLoginBuilder';
import { useRecuperarContraseñaBuilder } from '~/build/Login/useRecuperarContraseñaBuilder.js';
import { validarYEnviarRecuperarContraseña } from '~/Core/Login/RecuperarContraseña';
import { useIngresoContraseñaBuilder } from '~/build/Login/useIngresoContraseñaBuilder';
import { useSession } from '~/composables/useSession';

definePageMeta({
    layout: 'authentication'
});

const varView = useVarView();
const api = useApiRest()
const config = useRuntimeConfig()
const indexedDB = useIndexedDBStore();
const storeCodigos = useCodigos();
const mostrarContraseña = ref(false)
const { clearSession } = useSession()

onMounted(async () => {
    try {
        varView.cargando = true

        await indexedDB.initialize();


        const isValid = await indexedDB.validateVersion('db-thesalus');

        if (isValid) {
            await indexedDB.clearDatabase('db-thesalus');
        } else {
            await indexedDB.deleteDatabase('db-thesalus');
        }

        await storeCodigos.initialize();
        await storeCodigos.guardardatos()
        clearSession()
        varView.cargando = false;
    } catch (e) {
        console.error('No se pudo reiniciar IndexedDB:', e);
        varView.cargando = false;
    }

})

const selectEmpresa = ref(false)
const opcionesCompañy = ref([])
const show = ref(false)
const showCambiar = ref(false)
const stateCodigo = ref(false)

// funcion para validar primer ingreso
async function validaUsuario(event) {
    const correo = event.target.value
    varView.cargando = true

    let options = {
        metodo: 'POST',
        url: config.public.primerIngreso,
        body: {
            correo: correo
        }
    }
    const respuesta = await api.functionCall(options)

    if (respuesta.primer_ingreso) {
        show.value = true
        stateCodigo.value = await validarYEnviarRecuperarContraseña({ Usuario: { correo: correo } })
    }

    varView.cargando = false
}

function recuperarContraseña() {
    show.value = true
}

function cambiarContraseña() {
    showCambiar.value = true
}

function cerrar() {
    show.value = false
    showCambiar.value = false
}

async function enviarCodigo(data) {
    varView.cargando = true
    stateCodigo.value = await validarYEnviarRecuperarContraseña(data)
    varView.cargando = false
}

// Builder Pagina
const propiedadesLogin = computed(() => {
    const pagina = new ComponenteBuilder()
    const propiedadesForm = useLoginBuilder({
        storeId: 'Ingresar',
        storePinia: 'Login',
        recuperarcontraseña: recuperarContraseña,
        cambiarContraseña,
        validaUsuario,
        selectEmpresa: selectEmpresa,
        opcionesCompañy: opcionesCompañy,
        mostrarContraseña
    });

    return pagina
        .setFondo('FondoBlur')
        .setContenedor('w-1/3 flex justify-center')
        .addComponente('Form', propiedadesForm)
        .build()
})

const propiedadesRecuperar = computed(() => {
    const pagina = new ComponenteBuilder()

    const propiedadesRecuperarContraseña = useRecuperarContraseñaBuilder({
        storeId: 'RecuperarContraseña',
        storePinia: 'Login',
        cerrar: cerrar,
        show: show,
        enviarCodigo,
        stateCodigo: stateCodigo.value
    });

    const propiedadesCambiarContraseña = useIngresoContraseñaBuilder({
        storeId: 'CambiarContraseñaPrimerVez',
        storePinia: 'Login',
        cerrar: cerrar,
        show: showCambiar,
    })
    return pagina
        .setFondo('FondoBlur')
        .setContenedor('w-1/3 flex justify-center')
        .addComponente('Form', propiedadesRecuperarContraseña)
        .addComponente('Form', propiedadesCambiarContraseña)
        .build()
})
</script>

<template>
    <Pagina v-if="show || showCambiar" :Propiedades="propiedadesRecuperar" />
    <Pagina v-else :Propiedades="propiedadesLogin" />
</template>

<style>
.logo {
    animation: aparecerLogo 1s ease-out;
}

@keyframes aparecerLogo {
    0% {
        transform: translateY(-20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-fadeIn {
    animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>