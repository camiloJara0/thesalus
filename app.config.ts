export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'green'
    },
    breadcrumb: {
      slots: {
        link: 'group relative flex items-center gap-1.5 text-sm min-w-0 focus-visible:outline-primary text-red-500'
      },
      variants: {
        false: {
          link: 'text-gray-400 font-medium'
        }
      }
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: 'max-w-5xl'
          }
        }
      }
    },
    tabs: {
      slots: {
        label: 'hidden sm:inline'
      }
    }
  }
})