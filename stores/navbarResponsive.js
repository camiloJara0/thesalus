import {ref} from 'vue';

// Funcion para manejar el menu responsive
const showNavbarBurguer = ref(false);

export const useShowNavbar = () => {
const cambiarEstado = () => {
    showNavbarBurguer.value = !showNavbarBurguer.value;
};

return {
    showNavbarBurguer,
    cambiarEstado,
};
}