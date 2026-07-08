<script setup>
import { useButtonsAside } from '~/stores/ButtonActive';
import { useSeccionFooter } from '~/stores/NavigationFooter';
import { onMounted } from 'vue';

const titulo = defineProps(['data']);
// Stores ButtonAside y Footer
const storeAside = useButtonsAside();
const footer = useSeccionFooter();

// Traer boton activo de sessionStorage
onMounted(() => {
    storeAside.sessionActive();
});
</script>

<template>
    <button :class="{ 'active': data.active }"
        class="z-9 border-none cursor-pointer text-(--color-gris-claro) h-full px-3.75 py-3.75 flex items-center relative hover:text-(--color-blanco) hover:bg-(--color-rojo-claro)">
        <!-- Icono boton -->
        <a class="link w-6 h-6 pointer-events-none md:pointer-events-all md:text-black text-white">
            <i class="fa-solid text-xl" :class="data.icon"></i>
        </a>

        <div class="right absolute top-[50%] left-full flex justify-center items-center pointer-events-none bg-(--color-default-claro) p-2.5 w-37.5"
            :class="{ 'rounded-[0_30px_0_0] ': !data.showUp, 'rounded-[0_0_30px_0]': data.showUp }"
            @click="storeAside.activeButton(data.id)">
            <a @click="footer.cambiarSecciones(null)">
                <h3 class="text-(--color-rojo) p-[5px_10px] cursor-pointer text-base font-bold">{{ data.nombre }}
                </h3>
            </a>

        </div>
    </button>
</template>

<style scoped>
button {
    transition: background-color 0.3s ease, color 0.3s ease;
}

.active {
    background: rgba(255, 255, 255, 0.3);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.right {
    opacity: 0;
    transform: translateX(-10px) translateY(-50%);
    transition: all 0.3s ease;
    overflow: visible;
}

.right h3 {
    transition: all 0.3s ease;
}

.left button:hover .right {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0) translateY(-50%);
}

.ocultar {
    display: none;
}

/* Lista Submenu */

.down {
    opacity: 0.75;
    transform: translateX(10%) translateY(0);
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
    overflow-x: hidden;
}

.down.up {
    bottom: 100%;
    top: auto;
    border-radius: 0 16px 0 0;
    padding-bottom: 10px;
    /* ajusta bordes si quieres */
}

.left:hover .down {
    opacity: 1;
}

.down::-webkit-scrollbar {
    width: 2px;
}

@media screen and (max-width: 768px) {

    button {
        justify-content: center;
        font-size: 16px;
        border-radius: 50%;
    }

    .right {
        position: fixed;
        top: 10%;
        left: 0;              /* que empiece desde el borde izquierdo */
        right: 0;             /* que llegue hasta el borde derecho */
        width: 100%;          /* ocupa todo el ancho */
        border-radius: 10px 10px 0 0;
        padding: 10px;
    }

    .right:hover {
        border-radius: 10px 10px 0 0;
    }

    .left:hover .down {
        opacity: 1;
        transform: translateX(0) translateY(0);
    }

    .left button:hover .right {
        transform: translate(0, 28%);
    }

    .down {
        position: fixed;       /* que se mantenga fijo */
        left: 0;
        right: 0;
        width: 100%;           /* ocupa todo el ancho */
        border-radius: 0 0 10px 10px;
        max-height: 60vh;      /* controlas la altura máxima para scroll */
        overflow-y: auto;      /* habilitas scroll si hay muchas opciones */
    }

    .down:hover {
        pointer-events: all;
    }

    .down h3 {
        width: 100%;
    }

    .down h3 a {
        padding: 5px;
    }

    .down.up {
        top: 100%;
        bottom: auto;
        border-radius: 0 0 16px 16px;
    }

}
</style>