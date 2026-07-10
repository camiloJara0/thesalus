<template>
  <div
    class="flex min-h-[calc(100%-40px)] items-center justify-center overflow-y-auto bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-6">

    <!-- Card -->
    <UCard
      class="relative w-full max-w-xl border-0 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 animate-[fadeIn_.6s_ease]">
      <div class="flex flex-col items-center text-center gap-6 py-6">

        <!-- Icon -->
        <div class="relative">

          <div class="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" />

          <div
            class="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary-500/10 ring-8 ring-primary-500/5">
            <UIcon name="i-heroicons-lock-closed" class="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>

        </div>

        <!-- Badge -->

        <UBadge color="warning" variant="soft" size="lg">
          Acceso Restringido
        </UBadge>

        <!-- Title -->

        <div class="space-y-2">

          <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            No tienes permisos para acceder
          </h1>

          <p class="mx-auto text-xs max-w-md text-gray-600 dark:text-gray-400 leading-relaxed">
            Tu cuenta no posee los privilegios necesarios para visualizar este
            módulo. Si consideras que esto es un error, solicita acceso al
            administrador del sistema.
          </p>

        </div>

        <!-- Info -->

        <div
          class="grid w-full grid-cols-1 gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div class="flex items-center gap-3">

            <UIcon name="i-heroicons-shield-check" class="text-primary-500 text-xl" />

            <div class="text-left">
              <p class="font-semibold text-gray-800 dark:text-white">
                Acceso protegido
              </p>

              <p class="text-xs text-gray-500">
                Los permisos garantizan la seguridad de la información.
              </p>

            </div>

          </div>

          <div class="flex items-center gap-3">

            <UIcon name="i-heroicons-user-circle" class="text-primary-500 text-xl" />

            <div class="text-left">

              <p class="font-semibold text-gray-800 dark:text-white">
                ¿Necesitas acceso?
              </p>

              <p class="text-xs text-gray-500">
                Contacta al administrador para habilitar los permisos.
              </p>

            </div>

          </div>

        </div>

        <!-- Buttons -->

        <div class="flex flex-wrap justify-center gap-3 pt-2">

          <UButton color="primary" icon="i-heroicons-arrow-left" @click="$router.back()">
            Volver
          </UButton>

          <UButton color="neutral" variant="soft" icon="i-heroicons-home" to="/Home">
            Ir al inicio
          </UButton>

        </div>

      </div>
    </UCard>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>