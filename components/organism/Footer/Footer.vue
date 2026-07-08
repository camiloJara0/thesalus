<script setup>
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

</script>

<template>
<footer class="section-footer md:h-[30px] text-gray-200 flex items-center justify-end px-6">

  <!-- Derechos reservados -->
  <div class="text-sm pb-2 hidden md:block select-none">
    © 2026 Todos los derechos reservados
  </div>
</footer>

</template>

<style scoped>
.section-footer {
    grid-area: footer;
}
</style>