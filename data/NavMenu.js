// Creacion de botones del Navbar
import { useSession } from '~/composables/useSession';

const { clearSession } = useSession();

export const submenuNotificaciones = [
    { id: 1, nombre: 'Notificaciones', icon: 'fa-bell', link: '#' },
    { id: 2, nombre: 'Alertas', icon: 'fa-bell-concierge', link: '#' }
];

export const submenuSesion = [
    { 
        id: 1, 
        label: 'Iniciar Sesión', 
        icon: 'lucide-user', 
        onSelect: async() => {
            await clearSession();
        }
    },
    { 
        id: 2, 
        label: 'Cerrar Sesión', 
        icon: 'i-lucide-arrow-left-to-line', 
        onSelect: async() => {
            await clearSession();
        }
    },
]