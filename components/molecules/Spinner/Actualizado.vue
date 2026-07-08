<template>
  <Transition name="fade-slide">
    <div 
      class="fixed bottom-9 right-8 z-50 flex items-center gap-3 px-4 py-2 
             rounded-lg shadow-lg bg-white dark:bg-gray-800 border 
             border-gray-200 dark:border-gray-700 animate-fadeIn"
    >
      <i class="fa-solid fa-check text-green-500"></i>
      <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
        Datos sincronizados.
      </span>
    </div>
  </Transition>
</template>

<style>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
