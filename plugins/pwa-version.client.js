export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast()
  let avisoMostrado = false

  const mostrarAviso = () => {
    const pwa = nuxtApp.$pwa
    if (avisoMostrado || !pwa?.needRefresh) return
    avisoMostrado = true
    toast.add({
      id: 'pwa-nueva-version',
      icon: 'i-lucide-refresh-cw',
      color: 'info',
      title: 'Nueva versión disponible',
      description: 'Pulsa "Actualizar" para recargar la aplicación con la nueva versión.',
      duration: 0,
      actions: [
        {
          label: 'Actualizar',
          icon: 'i-lucide-check',
          onClick: () => pwa.updateServiceWorker(true)
        }
      ]
    })
  }

  onNuxtReady(() => {
    watch(
      () => nuxtApp.$pwa?.needRefresh,
      (necesita) => {
        if (necesita) mostrarAviso()
      },
      { immediate: true }
    )
  })
})
