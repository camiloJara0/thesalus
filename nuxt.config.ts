// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  nitro: { preset: 'static' },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/ui', 
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-charts',
    '@vite-pwa/nuxt'
  ],
  colorMode: { preference: 'system', classSuffix: '' },
  runtimeConfig: {
    public: {
      SECRET_KEY: 'THESALUS943875PL',
      // api: 'https://api.ctsantaisabel.com',
      api: 'http://127.0.0.1:8000',
      login: 'api/v1/login',
      eps: 'api/v1/eps',
      professions: 'api/v1/professions',
      empresas: 'api/v1/empresas',
      users: 'api/v1/users',
      pacientes: 'api/v1/pacientes',
      profesionals: 'api/v1/profesionals',
      informacionUsers: 'api/v1/informacionUsers',
      citas: 'api/v1/citas',
      citasHoy: 'api/v1/citasHoy',
      citasPorRango: 'api/v1/citasPorRango',
      citasPaginadas: 'api/v1/citasPaginadas',
      citasFiltradas: 'api/v1/citasFiltradas',
      historiasClinicas: 'api/v1/historiasClinicas',
      historiasNutricion: 'api/v1/historiasClinicasNutricion',
      historiasClinicasTrabajoSocial: 'api/v1/historiasClinicasTrabajoSocial',
      historiasClinicasNota: 'api/v1/historiasClinicasNota',
      analisis: 'api/v1/analisis',
      analisisInicial: 'api/v1/analisisInicial',
      analisisPaciente: 'api/v1/analisisPaciente',
      analisisPaginado: 'api/v1/analisisPaginado',
      analisisFiltrado: 'api/v1/analisisFiltrado',
      filtrosAnalisis: 'api/v1/filtrosAnalisis',
      examenFisicos: 'api/v1/examenFisicos',
      planManejoMedicamentos: 'api/v1/planManejoMedicamentos',
      planManejoProcedimientos: 'api/v1/planManejoProcedimientos',
      planManejoEquipos: 'api/v1/planManejoEquipos',
      planManejoInsumos: 'api/v1/planManejoInsumos',
      antecedentes: 'api/v1/antecedentes',
      diagnosticos: 'api/v1/diagnosticos',
      diagnosticosCIF: 'api/v1/diagnosticosCIF',
      notas: 'api/v1/notas',
      descripcionNotas: 'api/v1/descripcionNotas',
      software: 'api/v1/software',
      facturaciones: 'api/v1/facturaciones',
      enfermedades: 'api/v1/enfermedades',
      secciones: 'api/v1/secciones',
      cambiarContraseña: 'api/v1/cambiarContraseña',
      cambiarContraseñaPrimerVez: 'api/v1/cambiarContraseñaPrimerVez',
      recuperarContraseña: 'api/v1/recuperarContraseña',
      primerIngreso: 'api/v1/primerIngreso',
      diasAsignadosRestantes: 'api/v1/diasAsignadosRestantes',
      terapias: 'api/v1/terapias',
      servicios: 'api/v1/servicios',
      administradores: 'api/v1/administradores',
      cie10: 'api/v1/cie10',
      insumos: 'api/v1/insumos',
      movimientos: 'api/v1/movimientos',
      dashboard: 'api/v1/dashboard',
      traeDatosHistoria: 'api/v1/traeDatosHistoria',
      traeDatosPlanManejo: 'api/v1/traeDatosPlanManejo',
      traePacientes: 'api/v1/traePacientes',
      traeKardex: 'api/v1/traeKardex',
      traeProfesionales: 'api/v1/traeProfesionales',
      kardex: 'api/v1/kardex',
      historialCambioSonda: 'api/v1/historialCambioSonda',
      profesionalHasPermisos: 'api/v1/profesionalHasPermisos',
      solicitarPermiso:  'api/v1/solicitarPermiso',
      celdaColors: 'api/v1/celdaColors',
      importarInsumos: 'api/v1/importarInsumos',
      codesVadecum: 'api/v1/vadecum',
      convenios: 'api/v1/convenios',
      insumosPrestados: 'api/v1/insumosPrestados',
      filtrosCitas: 'api/v1/filtrosCitas',
      imprimirComodato: 'api/v1/imprimirComoDato',
      variasCitas: 'api/v1/variasCitas',
      tipoEquipos: 'api/v1/tipo_equipos',
      prestaciones: 'api/v1/prestaciones',
      vadecum: 'api/v1/vadecum',
      exportarPdf: 'api/v1/exportarPdf'
    }
  },

  app: {
    head: {
      link: [ 
          { rel: 'icon', type: 'image/x-icon', href: '/cruz.png' },
          {
            href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
            rel: 'stylesheet'
          }
       ]
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Thesalus',
      short_name: 'Thesalus',
      theme_color: '#326872',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/logo.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/cruz.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      navigateFallback: '/index.html',
      navigateFallbackAllowlist: [/^\/$/, /^\/.+/],
    },
    devOptions: {
      enabled: true
    }
  }
});





