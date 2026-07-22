<script setup>
import DropdownNavbar from '~/components/molecules/Dropdowns/DropdownNavbar.vue';
import Breadcrumb from '~/components/molecules/BreadCrumbs/Breadcrumb.vue';
import { diasSemana, nombresMeses } from '~/data/Fechas';
import { useShowNavbar } from '~/stores/navbarResponsive.js';
import { submenuSesion } from '~/data/NavMenu';

import { useButtonsAside } from '~/stores/ButtonActive';
import { ref, computed, onMounted } from 'vue';
import ModalNoEnviados from '../NoEnviados/ModalNoEnviados.vue';

const storeAside = useButtonsAside();
const { showNavbarBurguer, cambiarEstado } = useShowNavbar();

const usuario = ref();
const varView = useVarView();
const buttons = ref()

onMounted(() => {
    // Obtener y parsear el usuario
    const user = varView.getUser
    if (user && typeof user.name === 'string') {
        usuario.value = user.name.split(' ')[0]
    } else {
        usuario.value = 'Usuario'
    }
    const permisosStore = varView.getPermisos
    buttons.value = storeAside.getbuttons(permisosStore);
})

function obtenerFechaFormateada() {
    const fecha = new Date();

    const diaSemana = diasSemana[fecha.getDay()];
    const diaMes = fecha.getDate();
    const mesNombre = nombresMeses[fecha.getMonth()];

    return `${diaSemana}, ${diaMes} ${mesNombre}`;
}

const fechaActualFormateada = computed(() => {
    return obtenerFechaFormateada();
});

const removeStorage = () => {
    sessionStorage.removeItem('seccionesGuardadas')
};

</script>

<template>
    <div class="navbar">
        <div class="navbar__content">

            <nuxt-link to="/Home"
                class="seccionLogo text-white md:text-xl font-extrabold py-2 px-3 md:w-[20%] w-[40%] h-fit bg-(--color-default-200) shadow-xl">
                <i class="fa-solid fa-laptop-medical md:text-2xl text-lg"></i>
                Thesalus
            </nuxt-link>
            <p class="text-xs text-white mr-10 mt-2 md:hidden block">{{ usuario }}</p>
            <div class="menuResponsive" @click="cambiarEstado()">
                <div :class="{ 'text-white': !showNavbarBurguer, 'text-gray-300': showNavbarBurguer }">
                    <i class="fa-solid fa-bars transition-all duration-300 cursor-pointer active:scale-95"></i>
                </div>
            </div>

            <ul class="navbar__content__list" @click="removeStorage()"
                :class="{ 'mostrarResponsive': showNavbarBurguer, 'ocultarResponsive': !showNavbarBurguer }">
                <li>
                    <nuxtLink to="/Usuarios/Citas"
                        class="flex gap-1 text-xs text-white md:text-gray-100 hover:text-blue-500 rounded-[5px] p-2.5 shadow-lg">
                        <i class="fa-solid fa-calendar-day"></i>
                        <p class="text-gray-100 hover:text-white">{{ fechaActualFormateada }}</p>
                    </nuxtLink>
                </li>
                <li>
                    <Breadcrumb />
                    <p class="text-gray-100 text-xs ml-1 font-semibold md:block hidden" @click="varView.showBreadCrumb = !varView.showBreadCrumb">
                        <span v-if="!varView.showBreadCrumb">Secciones <i class="fa-solid fa-angle-right ml-1 text-gray-100 hover:text-white"></i></span>
                        <span v-else> <i class="fa-solid fa-angle-left ml-2"></i></span>
                    </p>
                </li>
                <!-- <li>
                    <DropdownNavbar icon="fa-bell" nombre="Notificaciones" :submenu="submenuNotificaciones" />
                </li> -->
                <li>
                    <ModalNoEnviados />
                </li>
                <li>
                    <UButton to="/Ayuda" icon="i-lucide-circle-question-mark" color="white"
                        class="flex gap-1 text-xs text-white md:text-gray-100 hover:text-yellow-400 rounded-[5px] p-2 transition-colors duration-200"
                        tooltip="Ayuda">
                    </UButton>
                </li>
                <li>
                    <DropdownNavbar icon="fa-circle-user" :nombre="usuario" :submenu="submenuSesion" />
                </li>
            </ul>

        </div>
    </div>
</template>

<style scoped>
.navbar {
    grid-area: navbar;
}

.navbar__content {
    display: flex;
    justify-content: space-between;
}

.seccionLogo {
    position: relative;
    clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%);
    overflow: hidden;
    /* importante para que se recorte */
}

/* Sombra interna */
.seccionLogo::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;

    box-shadow:
        inset -10px -10px 40px -8px rgba(0, 0, 0, 0.45);

    clip-path: inherit;
}

.logo {
    color: #fff;
    width: 110px;
    object-fit: contain;
    margin-left: 15px;
}

.navbar__content__list {
    display: flex;
    list-style: none;
    gap: 5px;
}

.navbar__content__list li {
    display: flex;
    align-items: center;
    color: #fff;
    padding: 10px 15px;
}

.menuResponsive {
    display: none;
    font-size: 20px;
    font-weight: bold;
}

.burgerIcon {
    cursor: pointer;
}

.buergerIcon:hover {
    background-color: var(--color-negro-rojizo);
    border-radius: 10px;
}

.mostrarResponsive {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
}

@media screen and (max-width: 768px) {
    .ocultarResponsive {
        display: none;
    }

    .navbar {
        height: 40px;
        padding: 0;
    }

    .navbar .logo {
        height: 30px;
        margin: 5px;
    }

    .menuResponsive {
        display: block;
        position: absolute;
        right: 10px;
        top: 5px;
    }

    .navbar__content__list {
        position: absolute;
        z-index: 999;
        top: 85px;
        right: 0;
        width: 100%;
        background-color: var(--color-default-600);
        color: #fff;
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .menuResponsive .navbar__content__list {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

}
</style>