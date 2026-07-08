<template>
  <div class="cargando dark:bg-[rgba(255,255,255,0.4)]">
    <div class="w-full h-full flex items-center justify-center flex-col relative">
      <!-- Icono médico -->
      <i class="fa-solid fa-notes-medical text-5xl text-blue-400 dark:text-blue-600 logo"></i>
      <!-- Texto animado -->
      <p class="mt-6 text-white dark:text-gray-200 text-lg font-semibold mensaje">
        Cargando sistema médico...
      </p>
    </div>
  </div>
</template>

<style scoped>
.cargando {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  backdrop-filter: blur(10px);
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animación del logo */
.logo {
  animation: pulso 1.5s infinite ease-in-out, girar 3s infinite linear;
}

/* Animación del texto */
.mensaje {
  animation: aparecerTexto 2s infinite alternate;
}

/* Keyframes */
@keyframes pulso {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes girar {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes aparecerTexto {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
