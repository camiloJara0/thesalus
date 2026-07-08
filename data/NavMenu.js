// Creacion de botones del Navbar
export const submenuNotificaciones = [
    { id: 1, nombre: 'Notificaciones', icon: 'fa-bell', link: '#' },
    { id: 2, nombre: 'Alertas', icon: 'fa-bell-concierge', link: '#' }
];

export const submenuSesion = [
    { 
        id: 1, 
        label: 'Iniciar Sesión', 
        icon: 'lucide-user', 
        onSelect: () => {
            const router = useRouter();
            router.push('/')
            localStorage.removeItem('rol')
            localStorage.removeItem('seccion')
            localStorage.removeItem('ultimaSincronizacion')
        }
    },
    { 
        id: 2, 
        label: 'Cerrar Sesión', 
        icon: 'i-lucide-arrow-left-to-line', 
        onSelect: () => {
            const router = useRouter();
            router.push('/')
            localStorage.removeItem('rol')
            localStorage.removeItem('seccion')
            localStorage.removeItem('ultimaSincronizacion')
        }
    },
]