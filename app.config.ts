export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'green'
    },
    breadcrumb: {

      variants: {
        false: {
          link: 'text-red-400 font-medium'
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