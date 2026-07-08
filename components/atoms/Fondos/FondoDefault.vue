<script setup>
defineProps({
  noPadding: {
    type: Boolean,
    default: false
  },
  gradient: {
    type: Boolean,
    default: false
  }
})

const storeFooter = useSeccionFooter()
</script>

<template>
  <div 
    class="w-full min-h-[calc(100%-40px)] rounded-lg overflow-y-auto scrollForm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    :class="{
      'py-8 md:pl-15 px-4': !noPadding,
      'bg-linear-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800': gradient,
      'rounded-[8px_8px_8px_0]!' : storeFooter.secciones?.length
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
/* Custom scrollbar */
:deep(.scrollForm::-webkit-scrollbar) {
  width: 8px;
}

:deep(.scrollForm::-webkit-scrollbar-track) {
  background: #f1f1f1;
  /* background: #1f2937; */
  border-radius: 4px;
}

:deep(.scrollForm::-webkit-scrollbar-thumb) {
  background: #cbd5e1;
  border-radius: 4px;
}

:deep(.scrollForm::-webkit-scrollbar-thumb:hover) {
  background: #94a3b8;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :deep(.scrollForm::-webkit-scrollbar-track) {
    background: #1f2937;
  }
  :deep(.scrollForm::-webkit-scrollbar-thumb) {
    background: #4b5563;
  }
  :deep(.scrollForm::-webkit-scrollbar-thumb:hover) {
    background: #6b7280;
  }
}

/* Animación suave de entrada */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(> *) {
  animation: slideInUp 0.3s ease-out;
}
</style>