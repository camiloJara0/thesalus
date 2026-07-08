<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Paciente from '~/components/Paciente.vue';

import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { onMounted, ref } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia';
import { useCitasStore } from '~/stores/Formularios/citas/Cita.js';
import { useProfesionalStore } from '~/stores/Entidades/Profesional';;
import { usePacientesStore } from "~/stores/Entidades/Paciente";
import { traerDashboard } from '~/Core/Empresa/Dashboard/GetDashboard';
import { usePermisosProfesionalBuilder } from '~/build/Empresa/usePermisosProfesional';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';

const citasStore = useCitasStore();
const varView = useVarView()
const apiRest = useApiRest()
const storeProfesion = useDatosProfesionStore()
const rol = ref(null)

const Citas = ref([]);
const servicios = ref([])
const ultimosPacientes = ref();

const cardPaciente = ref([])
const actions = ref([])

const pacientesList = ref([])
const medicosList = ref([])
const showCita = ref(false)
const refresh = ref(1)
const profesional = ref([])
const dashboardData = ref([])
const stats = ref([])

const secciones = ref([])
const addPermisos = ref(false)

watch(() => showCita.value,
    async (estado) => {
        if (!estado) {
            varView.cargando = true
            const apiRest = useApiRest()
            await apiRest.getData('Cita', 'citas')
            refresh.value++
            varView.cargando = false
        }
    }
);

onMounted(async () => {
    varView.cargando = true;
    sessionStorage.removeItem('activeButton');
    sessionStorage.removeItem('seccionIdActivo')

    rol.value = varView.getRol
    const usuario = varView.getUser

    let citas = []
    let Historias = []

    servicios.value = await apiRest.getData('Servicio', 'servicios')
    servicios.value = servicios.value.map((s) => { return { text: s.name, value: s.name } })
    if (rol.value === 'Admin') {
        const historiaStore = useHistoriasStore();
        Historias = await historiaStore.ultimasHistorias();
        citas = await citasStore.listCitasHoy();
        // Pacientes list
        const pacientesStore = usePacientesStore()
        pacientesList.value = await pacientesStore.traer()

        // Profesionales list
        const profesionalesStore = useProfesionalStore()
        const profesionales = await profesionalesStore.traer()
        medicosList.value = profesionales

        //Dashboard
        dashboardData.value = await traerDashboard()

    } else if (rol.value === 'Profesional') {
        // Pacientes list
        const pacientesStore = usePacientesStore()
        pacientesList.value = await pacientesStore.traer(true, true)

        // Profesionales list
        const profesionalesStore = useProfesionalStore()
        const profesionales = await profesionalesStore.traer()
        medicosList.value = profesionales
        profesional.value = profesionales.find(p => p.id_infoUsuario === usuario.id)

        const seccionesApp = await storeProfesion.traerSecciones()
        const permisos = await storeProfesion.traerPermisos(profesional.value.id_profesion)

        // Filtrar acciones según permisos
        secciones.value = seccionesApp.filter(s => {
            return !permisos.includes(s.nombre) && !s.text.includes("Visualizar") && !s.text.includes("Ver")
        })

        // Citas list
        const listCitas = await citasStore.listCitas();
        const hoy = new Date();

        hoy.setHours(0, 0, 0, 0);

        citas = listCitas
            .filter((cita) => {
                const fechaCita = new Date(cita.fecha + "T00:00:00");
                fechaCita.setHours(0, 0, 0, 0); // Normalizamos también la fecha de la cita

                return (
                    cita.id_medico === profesional.value.id_profesional &&
                    cita.estado === 'Inactiva'
                );
            })
            .slice(0, 4);
    }

    DashboardRol(rol.value, Historias, citas)
    varView.cargando = false;
});
// Funcion para cargar Dashboard por rol
async function DashboardRol(rol, Historias = [], citas) {
    varView.cargando = true
    if (rol === 'Admin') {
        if (Historias.length > 0) {
            ultimosPacientes.value = Historias.map(card => {
                return {
                    header: {
                        icon: 'fa-solid fa-user',
                        title: card.name,
                        subtitle: card.No_document
                    },
                    body: {
                        html: `<i class="fa-solid fa-clock md:text-lg text-sm"></i> ${card.fecha_historia}`
                    },
                    footer: {
                        buttons: [
                            { icon: 'fa-solid fa-check', class: 'bg-green-600 text-white w-7 h-7 rounded-full' }
                        ],
                    }
                }
            })
        } else {
            ultimosPacientes.value = [{
                header: {
                    icon: 'fa-solid fa-user',
                    title: 'No hay Pacientes Recientes',
                },
            }]
        }

        if (citas.length > 0) {
            Citas.value = citas.map(card => {
                return {
                    header: {
                        html: `<div class="flex flex-col items-center">
                                <h3 class="text-xl font-bold text-blue-600">${
                                    card.hora === '00:00:00' ? card.fechaHasta.substring(5, 11)
                                    : card.hora ? card.hora.substring(0, 5) : ''}</h3>
                                <p class="text-xs font-thin">${card.fecha}</p>
                                <div/>
                            `,
                        title: card.name_paciente,
                        subtitle: card.servicio,
                    },
                    // body: {
                    //     html: ``
                    // },
                    footer: {
                        status: card.motivo,
                        statusClass: 'bg-blue-500 text-white'
                    }
                }
            })
        } else {
            Citas.value = [
                {
                    header: {
                        title: 'No se encontraron Citas.'
                    }
                }
            ]
        }


        actions.value = [
            {
                header: {
                    icon: 'fa-solid fa-plus text-white',
                    iconBg: 'bg-inherit',
                    title: 'Nuevo Paciente',
                    subtitle: 'Registrar un nuevo paciente',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: nuevoPaciente
            },
            {
                header: {
                    icon: 'fa-solid fa-search text-white',
                    iconBg: 'bg-inherit',
                    title: 'Buscar Historia',
                    subtitle: 'Buscar historia clínica',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: buscarHistoria
            },
            {
                header: {
                    icon: 'fa-solid fa-calendar text-white',
                    iconBg: 'bg-inherit',
                    title: 'Agendar',
                    subtitle: 'Nueva consulta medica',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: nuevaCita
            },
            {
                header: {
                    icon: 'fa-solid fa-download text-white',
                    iconBg: 'bg-inherit',
                    title: 'Exportar RIPS',
                    subtitle: 'Generar reporte RIPS',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
            },
        ];

        
        stats.value = [
            {
                header: {
                    html: `<div>
                    <p class="font-semibold">Pacientes totales</p>
                    <p class="text-base font-bold">${dashboardData.value?.pacientes.total}</p>
                    <p class="text-sm py-2">${dashboardData.value?.pacientes.variacion}% vs. mes anterior</p>
                </div>`
                },
                body: {
                    html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-users dark:text-white text-gray-900 text-xl "></i></div>`
                },
            },
            {
                header: {
                    html: `<div>
                    <p class="font-semibold">Consultas Hoy</p>
                    <p class="text-base font-bold">${dashboardData.value?.consultas.total}</p>
                    <p class="text-sm py-2">${dashboardData.value?.consultas.variacion}% vs. mes anterior</p>
                </div>`
                },
                body: {
                    html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file dark:text-white text-gray-900 text-xl"></i></div>`
                },
            },
            {
                header: {
                    html: `<div>
                    <p class="font-semibold">Citas Programadas</p>
                    <p class="text-base font-bold">${dashboardData.value?.citas_programadas.total}</p>
                    <p class="text-sm py-2">${dashboardData.value?.citas_programadas.variacion}% vs. mes anterior</p>
                </div>`
                },
                body: {
                    html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-calendar dark:text-white text-gray-900 text-xl"></i></div>`
                },
            },
            {
                header: {
                    html: `<div>
                    <p class="font-semibold">Rips Pendientes</p>
                    <p class="text-sm text-gray-700">7</p>
                    <p class="text-sm py-2">-6% vs. mes anterior</p>
                </div>`
                },
                body: {
                    html: `<div class="w-full h-full flex justify-center items-center"><i class="fa-solid fa-file-medical dark:text-white text-gray-900 text-xl"></i></div>`
                },
            }
        ];
    } else if (rol === 'Profesional') {
        const usuario = varView.getUser
        const store = useIndexedDBStore()
        store.almacen = 'Profesion'
        const profesiones = await store.leerdatos()

        const mapaProfesion = profesiones.reduce((acc, profesion) => {
            acc[profesion.id] = profesion.nombre;
            return acc;
        }, {});
        cardPaciente.value = [{
            header: {
                html: `<h2 class="text-xl text-white font-bold capitalize">Bienvenid@, ${usuario.name.toLowerCase()}</h2>
                        <p class="text-base font-bold text-gray-100">Aqui encontraras informacion acerca de tu agenda y pacientes</p>

                    `,
                title: ``,
            },
            footer: {
                buttons: [
                    {
                        text: mapaProfesion[profesional.value.id_profesion],
                        class: 'text-xs text-gray-100 font-semibold p-1 px-2 rounded-xl',
                        icon: 'fa-solid fa-user-doctor'
                    }
                ]
            }
        }]

        // Citas
        if (citas.length > 0) {
            Citas.value = citas.map(card => {
                return {
                    header: {
                        html: `<div class="flex flex-col items-center">
                         <h3 class="text-xl font-bold text-blue-600">${
                                    card.hora === '00:00:00' ? card.fechaHasta.substring(5, 11)
                                    :card.hora ? card.hora.substring(0, 5) : ''}</h3>
                         <p class="text-xs font-thin">${card.fecha}</p>
                         <div/>`,
                        title: card.name_paciente,
                        subtitle: card.servicio,
                    },
                    body: {
                        text: `${usuario.name}`,
                        style: 'text-center'
                    },
                    footer: {
                        status: card.motivo,
                        statusClass: 'bg-blue-500 text-white'
                    }
                }
            })

        } else {
            Citas.value = [{
                header: {
                    icon: 'fa-solid fa-user',
                    title: 'No hay Pacientes Recientes',
                },
            }]
        }

        actions.value = [
            {
                header: {
                    icon: 'fa-solid fa-plus text-white',
                    iconBg: 'bg-inherit',
                    title: 'Agendar',
                    subtitle: 'Nueva consulta medica',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: nuevaCita
            },
            {
                header: {
                    icon: 'fa-solid fa-search text-white',
                    iconBg: 'bg-inherit',
                    title: 'Pacientes',
                    subtitle: 'Visualiza informacion de tus pacientes',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!',
                },
                accion: buscarHistoria
            },
            {
                header: {
                    icon: 'fa-solid fa-file text-white',
                    iconBg: 'bg-inherit',
                    title: 'Solicitar Permisos',
                    subtitle: 'solicitar a administradores permisos temporales',
                    titleClass: 'text-white',
                    subtitleClass: 'text-gray-300!'
                },
                accion: actualizarPermisos
            },
        ];
    }
    varView.cargando = false
}

// Acciones rapidas
function nuevoPaciente() {
    varView.showNuevoPaciente = true
}

function nuevaCita() {
    showCita.value = true
    varView.showNuevaCita = true
}

function buscarHistoria() {
    location.href = '/Historial'
}

async function actualizarPermisos() {
    const profesionalUser = profesional.value
    storeProfesion.Formulario.Profesion.id_profesional = profesionalUser.id_profesional
    addPermisos.value = true
}

function cerrarPermisos() {
    addPermisos.value = false
}

// Construccion de pagina
const cardsState = new CardBuilder();
const cardsPacientes = new CardBuilder();
const cardsCitas = new CardBuilder();
const cardsAcciones = new CardBuilder();


const propiedades = computed(() => {
    varView.cargando = true
    if (!rol.value) return null
    const propiedadesPermisos = usePermisosProfesionalBuilder({
        storeId: 'AgregarPermisos',
        storePinia: 'Profesion',
        permisos: secciones.value,
        show: addPermisos,
        cerrar: cerrarPermisos,
    })
    const pagina = new ComponenteBuilder();
    const paginaBase = pagina
        .setFondo('FondoDefault')
        .setContenedor('containerDashboard gap-5')
    if (rol.value === 'Admin') {
        paginaBase
            .setHeaderPage({
                titulo: 'Dashboard',
                descripcion: 'Resumen de actividad del sistema de historias clínicas.',
            })
            .addComponente('Card', cardsState
                .setCards(stats)
                .setNumeroCards(4)
                .setContenedor('area-status')
                .setcontenedorCards('grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5')
                .setTamaño('grid grid-cols-[1fr_0.5fr] place-items-center h-[160px] bg-white dark:bg-gray-700')
                .build()
            )
            .addComponente('Card', cardsPacientes
                .setCards(ultimosPacientes)
                .setNumeroCards(3)
                .setContenedor('area-info')
                .setcontenedorCards('flex flex-col')
                .setTamaño('flex sm:flex-row justify-between items-center rounded-lg')
                .setheaderTitle('Pacientes Recientes')
                .setheaderHtml(`<a href="/Historial" class="text-xs text-blue-500 hover:text-blue-700">Ver Todos</a>`)
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setNumeroCards(3)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-infoCitas')
                .setTamaño('flex sm:flex-row justify-between items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Agenda de Pendientes')
                .setheaderHtml(`<a href="/Usuarios/Citas" class="text-xs text-blue-500 hover:text-blue-700">Ver Agenda</a>`)
                .build()
            )
            .addComponente('Card', cardsAcciones
                .setCards(actions)
                .setNumeroCards(4)
                .setContenedor('area-actions')
                .setcontenedorCards('flex flex-col area-actions')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white!')
                .setheaderTitle('Acciones Rapidas')
                .build()
            )
    }
    else if (rol.value === 'Profesional') {
        paginaBase
            .setHeaderPage({
                titulo: 'Dashboard',
                descripcion: 'Resumen de actividad del sistema de historias clínicas.',
            })
            .addComponente('Card', cardsState
                .setCards(cardPaciente)
                .setNumeroCards(1)
                .setContenedor('area-status')
                .setcontenedorCards('')
                .setTamaño('flex md:flex-row justify-between md:h-[100px] bg-gradient-to-r from-blue-600 to-blue-900 dark:from-blue-900 to-blue-950 rounded-lg')
                .build()
            )
            .addComponente('Card', cardsCitas
                .setCards(Citas)
                .setNumeroCards(4)
                .setcontenedorCards('flex flex-col')
                .setContenedor('area-info bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl')
                .setTamaño('flex md:flex-row justify-between md:items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200 hover:bg-white! dark:hover:bg-gray-900!')
                .setheaderTitle('Agenda de Pendientes')
                .setheaderHtml(`<a href="/Usuarios/Citas" class="text-xs text-blue-500 hover:text-blue-700">Ver Agenda</a>`)
                .build()
            )
            .addComponente('Card', cardsAcciones
                .setCards(actions)
                .setNumeroCards(3)
                .setContenedor('area-actions bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl h-fit')
                .setcontenedorCards('flex flex-col area-actions')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white!')
                .setheaderTitle('Acciones Rapidas')
                .build()
            )
            if (propiedadesPermisos) paginaBase.addComponente('Form', propiedadesPermisos);
    }
    varView.cargando = false
    return paginaBase.build()
})

</script>

<template>
    <Pagina v-if="propiedades" :Propiedades="propiedades" :key="refresh"></Pagina>
    <Paciente v-if="varView.showNuevoPaciente" />
    <Cita v-if="varView.showNuevaCita"></Cita>
</template>