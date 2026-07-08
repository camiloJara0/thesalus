<script setup>
const props = defineProps({
  nombre: String,
  icon: String,
  submenu: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <!-- Dropdown Item Principal -->
  <UDropdownMenu class="hidden md:flex" :items="props.submenu">
    <UButton :label="nombre" :icon="'i-lucide-' + (icon.split('-').pop() || 'menu')" color="gray" variant="ghost" size="sm"
      class="text-gray-100 hover:text-white transition-colors flex gap-1 items-center cursor-pointer">

    </UButton>
  </UDropdownMenu>

</template>

<style scoped>
/* Transición suave del dropdown */
:deep(.group:hover .group-hover\:opacity-100) {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>