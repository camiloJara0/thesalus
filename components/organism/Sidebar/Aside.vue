<script setup>
import { useShowNavbar } from '~/stores/navbarResponsive.js';
import { useButtonsAside } from '~/stores/ButtonActive';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import { storeToRefs } from 'pinia';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';

const storeAside = useButtonsAside();
const historiaStore = useHistoriasStore()
const buttons = ref([]);
const varView = useVarView()
const route = useRoute()
const noEnviados = useNoEnviados()

const { numeroPendientes } = storeToRefs(historiaStore)

onMounted(() => {
    storeAside.sessionActive();
    const permisosStore = varView.getPermisos
    buttons.value = storeAside.getbuttons(permisosStore);
});

// Funcion para Responsive, si aside esta activo se oculta navbar
const { showNavbarBurguer, cambiarEstado } = useShowNavbar();
const cambiarEstadoFalse = async() => {
    await noEnviados.cargarDocumentosNoEnviados()
    if (showNavbarBurguer.value) {
        cambiarEstado(false);
    }
};

const isActive = (path) => route.path === path
</script>

<template>
    <div class="section-asidebar" :class="{ 'expandido': varView.expandido }">
        <div class="asidebar-shadow flex items-center h-full">
            <div class="section-asidebar__content w-full flex flex-col p-1.25 items-center rounded-r-lg dark:bg-(--color-default-claro) bg-(--color-default-700) shadow-lg"
                :class="{ 'h-full': varView.expandido, 'h-[75%] clip': !varView.expandido }">

            <!-- Estado colapsado -->
            <div v-if="!varView.expandido"
                class="menu-colapsado flex md:flex-col flex-row items-center justify-between md:h-screen md:w-16 md:py-4 pb-2">

                <!-- Botón expandir -->
                <ButtonRounded @click="() => {
                    varView.expandido = true;
                    cambiarEstadoFalse()
                }" tooltip="Abrir Menú" tooltip-position="right"
                    color="flex items-center justify-center w-10 h-10 rounded-full md:text-gray-200 text-white font-bold md:dark:text-black transition">
                    <i class="fa-solid fa-angle-right text-lg"></i>
                </ButtonRounded>

                <!-- Navegación por íconos -->
                <nav class="flex md:flex-col flex-row items-center gap-6" @click="cambiarEstadoFalse()">
                    <!-- <ButtonAside v-for="button in buttons" :key="button.nombre" :data="button" /> -->
                    <NuxtLink to="/Empresas">
                        <ButtonRounded tooltip="Datos" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full text-gray-200 md:text-gray-300 md:dark:text-black transition py-5">
                            <i class="fa-solid fa-building text-lg" :class="{ 'text-white! dark:text-blue-700!': isActive('/Empresas') }"></i>
                        </ButtonRounded>
                    </NuxtLink>
                    <NuxtLink to="/Historial" class="relative">
                        <UButton v-if="numeroPendientes > 0"
                            class="rounded-full absolute md:top-0 top-5 -right-1 w-4 h-5 flex justify-center items-center text-xs"
                            color="error">
                            {{ numeroPendientes }}
                        </UButton>
                        <ButtonRounded tooltip="Historias" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full text-gray-200 md:text-gray-300 md:dark:text-black transition py-5">
                            <i class="fa-solid fa-file text-lg" :class="{ 'text-white! dark:text-blue-700!': isActive('/Historial') }"></i>
                        </ButtonRounded>
                    </NuxtLink>
                    <NuxtLink to="/Usuarios">
                        <ButtonRounded tooltip="Pacientes" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full text-gray-200 md:text-gray-300 md:dark:text-black transition py-5">
                            <i class="fa-solid fa-user text-lg" :class="{ 'text-white! dark:text-blue-700!': isActive('/Usuarios') }"></i>
                        </ButtonRounded>
                    </NuxtLink>
                    <NuxtLink to="/Usuarios/Profesional">
                        <ButtonRounded tooltip="Profesionales" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full text-gray-200 md:text-gray-300 md:dark:text-black transition py-5">
                            <i class="fa-solid fa-user-doctor text-lg" :class="{ 'text-white! dark:text-blue-700!': isActive('/Usuarios/Profesional') }"></i>
                        </ButtonRounded>
                    </NuxtLink>
                    <NuxtLink to="/Usuarios/Citas">
                        <ButtonRounded tooltip="Agenda" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full text-gray-200 md:text-gray-300 md:dark:text-black transition py-5">
                            <i class="fa-solid fa-calendar-day text-lg" :class="{ 'text-white! dark:text-blue-700!': isActive('/Usuarios/Citas') }"></i>
                        </ButtonRounded>
                    </NuxtLink>
                </nav>

                <!-- Perfil / Logout -->
                <NuxtLink to="/" class="flex-col items-center gap-3 md:flex flex-none">
                    <i
                        class="fa-solid fa-right-from-bracket text-lg text-white md:text-gray-300 dark:text-black hover:text-red-600 cursor-pointer"></i>
                </NuxtLink>
            </div>

            <!-- Estado expandido -->
            <div v-else
                class="menu-expandido dark:bg-(--color-default-claro) bg-(--color-default-700) flex flex-col justify-between w-full h-full shadow-lg rounded-lg py-4 px-2 scrollAside overflow-y-auto">
                <!-- Header -->
                <div>
                    <div
                        class="flex justify-between items-center md:flex flex-row-reverse border-b border-gray-700 dark:border-gray-200 pb-3 mb-4">
                        <h2 class="text-lg font-bold text-gray-200 dark:text-gray-800 tracking-wide">
                            Menú</h2>
                        <ButtonRounded @click="varView.expandido = false" tooltip="Cerrar Menú" tooltip-position="right"
                            color="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-default-200)] text-white hover:bg-[var(--color-default-200)] transition">
                            <i class="fa-solid fa-angle-left"></i>
                        </ButtonRounded>
                    </div>

                    <!-- Sección Explorar -->
                    <p class="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                        Secciones</p>

                    <!-- Items dinámicos -->
                    <div v-for="button in buttons" :key="button.nombre" class="menu-item">

                        <NuxtLink v-for="seccion in button.secciones" class="flex items-center justify-between gap-2 p-2 hover:bg-gray-700 dark:hover:bg-gray-200 rounded-md transition" :key="seccion.titulo"
                            :to="`${seccion.ruta}`" :class="{'dark:bg-gray-200 bg-gray-700': isActive(seccion.ruta)}" @click="varView.expandido = false">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">
                                {{ seccion.titulo }}
                            </span>
                            <i class="fa-solid text-lg text-gray-400 dark:text-gray-600 transition" :class="seccion.icon"></i>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Perfil -->
                <div class="menu-item py-4 border-t border-gray-700 dark:border-gray-200 mt-4">
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Perfil</span>
                        <i class="fa-solid fa-user text-lg text-gray-400 dark:text-gray-600 transition"></i>
                    </div>
                    <div class="flex flex-col gap-1 pl-2">
                        <p class="text-gray-400 dark:text-gray-600 font-semibold text-sm text-wrap transition">
                            {{ varView.getRol }}
                        </p>
                        <NuxtLink to="/Ayuda" class="mt-1 text-yellow-400 dark:text-yellow-600 font-semibold text-sm hover:text-yellow-500 text-wrap transition">
                            <i class="fa-solid fa-circle-question mr-1"></i>Ayuda
                        </NuxtLink>
                        <a href="/" class="text-red-500 font-semibold text-sm hover:text-red-700 text-wrap transition">
                            Cerrar Sesion
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    </div>
</template>

<style scoped>
.section-asidebar {
    /* ancho colapsado */
    grid-area: aside;
    width: 50px;
    height: 85vh;
    padding: 10px 0;
    transition: width 0.4s ease, transform 0.6s ease, opacity 0.6s ease;

}

.section-asidebar.expandido {
    /* ancho expandido */
    /* width: 100%; */
    width: 180px;
    padding: 10px 5px 10px 0;
}

/* Estado colapsado */
.section-asidebar .menu-colapsado {
    transition: all 0.3s ease;
    transform: translateX(-4px);
    opacity: 0.9;
}

/* Estado expandido */
.section-asidebar .menu-expandido {
    transition: all 0.3s ease;
    transform: translateX(0);
    opacity: 1;
    animation: fadeIn 0.6s ease;
}

/* Animación extra */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.clip {
    clip-path: polygon(50% 0%, 100% 0, 100% 13%, 85% 15%, 85% 100%, 30% 100%, 0 100%, 0% 45%, 0 0);
}

.section-asidebar__content {
    box-shadow: none;
}

.asidebar-shadow {
    filter: drop-shadow(4px 4px 10px rgba(0, 0, 0, 0.45));
}

/* Links */
.submenu-link {
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s ease;
}

.submenu-link:hover {
    color: var(--color-warning);
}

/* Responsive móvil */
@media screen and (max-width: 768px) {
    .section-asidebar {
        position: fixed;
        top: 40px;
        left: 0;
        right: 0;
        width: 100%;
        height: 40px;
        border-radius: 0;
        z-index: 9;
        padding: 0;
        margin: 0;
    }

    .section-asidebar.expandido {
        height: auto;
        width: 100%;
    }

    .section-asidebar__content {
        background: inherit;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        padding: 0;
        margin: 0;
        border-radius: 0;
    }

    .menu-colapsado {
        display: flex;
        width: 100%;
        justify-content: space-around;
    }

    .menu-expandido {
        border-top: 1px solid #e5e7eb;
        padding: 10px;
    }

    .clip {
        clip-path: none;
    }
}

.scrollAside {
    scrollbar-width: thin;
    scrollbar-color: var(--color-default) transparent;
}

.scrollAside::-webkit-scrollbar {
    width: 2px;
}

</style>
