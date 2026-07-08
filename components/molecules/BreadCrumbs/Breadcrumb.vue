<script setup>
import { computed } from 'vue'

const route = useRoute()
const varView = useVarView()

const breadCrumbs = computed(() => {
  const path = route.fullPath
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.setItem('seccion', path)
  }
  const segments = path.split('/').filter(Boolean)

  const links = []
  for (let i = 0; i < segments.length; i++) {
    const to = '/' + segments.slice(0, i + 1).join('/')
    links.push({
      name: decodeURIComponent(segments[i]),
      to
    })
  }
  return links
})

const breadcrumbItems = computed(() => {
  return [
    { label: 'Inicio', icon: 'i-lucide-home', to: '/Home' },
    ...breadCrumbs.value.map(crumb => ({
      label: crumb.name,
      to: crumb.to,
      icon: 'i-lucide-dot'
    }))
  ].slice(0, 5) // Limitar a 5 items
})
</script>

<template>
  <!-- Desktop View with Breadcrumb -->
  <div v-if="varView.showBreadCrumb" class="flex items-center gap-1">
    <UBreadcrumb :items="breadcrumbItems" :ui="{ link: 'text-gray-300 text-xs', separatorIcon: 'text-gray-400' }" />
  </div>

  <!-- Mobile View with Dropdown -->
  <div v-else>
    <UDropdownMenu :items="[[...breadcrumbItems.map(item => ({
      label: item.label,
      to: item.to,
      icon: item.icon
    }))]]">
      <UButton
        icon="i-lucide-home"
        color="gray"
        variant="ghost"
        size="sm"
      />
    </UDropdownMenu>
  </div>
</template>

<style scoped>
/* Estilos personalizados para breadcrumb */
/* :deep(.ui-breadcrumb) {
  @apply text-gray-300;
}

:deep(.ui-breadcrumb-item) {
  @apply hover:text-white transition-colors;
}

:deep(.ui-breadcrumb-divider) {
  @apply text-gray-500;
} */
</style>