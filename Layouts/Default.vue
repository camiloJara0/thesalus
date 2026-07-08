<template>
    <div class="containerMain transition-[grid-template-columns] duration-300 ease-in-out"
        :class="{ 'grid-cols-[180px_1fr]': varView.expandido, 'grid-cols-[20px_1fr]': !varView.expandido }">
        <Loader v-if="varView.cargando"></Loader>
        <LoaderPorcentaje v-if="varView.loader.cargando"></LoaderPorcentaje>
        <Actualizado v-if="varView.actualizando"></Actualizado>
        <Permiso v-if="varView.permisoTemporal"></Permiso>
        <Navbar></Navbar>
        <Aside></Aside>
        <div class="section-content">
            <div class="container-content">
                <slot></slot>
                <FooterPage></FooterPage>
            </div>
        </div>
        <Footer></Footer>
    </div>
</template>

<script setup>
import { useVarView } from '~/stores/varview';
import Navbar from '~/components/organism/Navbar/Navbar.vue';
import Aside from '~/components/organism/Sidebar/Aside.vue';
import FooterPage from '~/components/organism/FooterPage/FooterPage.vue';
import Footer from '~/components/organism/Footer/Footer.vue';
import Loader from '~/components/molecules/Spinner/Loader.vue';
import Actualizado from '~/components/molecules/Spinner/Actualizado.vue';
import Permiso from '~/components/molecules/Spinner/Permiso.vue';
import LoaderPorcentaje from '~/components/molecules/Spinner/LoaderPorcentaje.vue';

const varView = useVarView();

onMounted(async() => {
    const permisos = JSON.parse(localStorage.getItem('permisosTemporales') ?? "[]");
    varView.permisoTemporal = permisos.length > 0 ? true : false
});

</script>

<style scoped>
.containerMain {
    display: grid;
    grid-template-areas:
        "navbar navbar"
        "aside main"
        "footer footer";
    grid-template-rows: 52px 1fr 30px;
    min-height: 100vh;
    /* fallback */
    min-height: 100dvh;
    max-height: 100dvh;
    background: radial-gradient(at left top, var(--color-default), var(--color-default-oscuro));
    padding-bottom: env(safe-area-inset-bottom);
}

@media screen and (max-width: 768px) {
    .containerMain {
        grid-template-areas: "navbar" "aside" "main" "footer";
        grid-template-rows: 45px 40px 1fr 10px;
        grid-template-columns: 1fr;
    }

    .section-content {
        padding: 5px;
        margin: 0;
    }
}

.section-content {
    grid-area: main;
    overflow-y: hidden;
    margin: 0 10px;
    border-radius: 5px;
}

.container-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
}

/* Scroll */
.container-content::-webkit-scrollbar {
    width: 5px;
    height: 2px;
    display: none;
}

.container-content::-webkit-scrollbar-thumb:hover {
    display: flex;
}

.container-content::-webkit-scrollbar-track {
    backdrop-filter: blur(10px);
    border-radius: 4px;
}
</style>