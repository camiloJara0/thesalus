<template>
  <div class="fixed inset-0 z-30 flex flex-col justify-center items-center h-dvh">
    <slot />
  </div>
</template>

<style scoped>
/* Animación de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(> *) {
  animation: fadeInUp 0.3s ease-out;
}
</style>