import { ref } from "vue";
// Creacion de botones Aside de ejemplo Icono, titulo, subsecciones

export const buttons = ref([
    {
        id: 1,
        nombre: "Empresas",
        secciones: [
            {
                titulo: 'Datos',
                ruta: '/Empresas',
                icon: 'fa-database'
            },
            {
                titulo: 'Configuracion',
                ruta: '/Empresas/Configuracion',
                icon: 'fa-cog'
            },
            {
                titulo: 'Usuarios',
                ruta: '/Empresas/Usuarios',
                icon: 'fa-users'
            },

        ],
        icon: "fa-building",
        tamaño: 'max-h-[37vh]',
        active: false,
    },
    {
        id: 2,
        nombre: "Historial",
        secciones: [
            {
                titulo: "Historias",
                ruta: '/Historial',
                icon: 'fa-file-medical'
            },
            {
                titulo: "Insumos",
                ruta: '/Historial/Insumos',
                icon: 'fa-pills'
            },
        ],
        icon: "fa-file",
        tamaño: 'max-h-[25vh]',
        active: false,
    },
    {
        id: 3,
        nombre: "Usuarios",
        secciones: [
            {
                titulo: "Pacientes",
                ruta: '/Usuarios',
                icon: 'fa-user-injured'
            },
            {
                titulo: "Profesional",
                ruta: '/Usuarios/Profesional',
                icon: 'fa-user-md'
            },
            {
                titulo: "Citas",
                ruta: '/Usuarios/Citas',
                icon: 'fa-calendar-check'
            }
        ],
        icon: "fa-user",
        tamaño: 'max-h-[25vh] pb-0',
        showUp: true,
        active: false,
    },
]);

export const secciones = ['Configuracion','Resoluciones','Inventarios','Datos','Usuarios','Negocios','Productos','Formas de pago','Impuestos','Cajas','Historias','Consultas','Análisis','Evoluciones','Notas','Tratamientos','Medicacion',
    'Pacientes','Profesional','Citas','Crear','Rips','Reportes'];

export const seccionesConAcciones = secciones.flatMap(seccion => {
  const clave = seccion.replace(/\s+/g, '_'); // reemplaza espacios por guiones bajos
  return [`${clave}_get`, `${clave}_post`, `${clave}_put`, `${clave}_delete`, `${clave}_view`];
});