<template>
  <div class="fixed inset-0 z-20">
    <!-- Sombra con blur backdrop -->
  <div 
    class="absolute inset-0 bg-linear-to-br from-(--color-default)/40 via-gray-900/40 to-green-900/40 
           dark:from-gray-900/60 dark:via-black/60 dark:to-gray-800/60 
           backdrop-blur-sm transition-opacity duration-300"
  ></div>

    <!-- Contenedor centrado con animación -->
    <div class="absolute inset-0 flex flex-col justify-center items-center h-dvh animate-fadeIn">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Animación de entrada */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}
</style>