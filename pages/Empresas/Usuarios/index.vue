<script setup>
import { municipios } from '~/data/municipios';
import { useUsersStore } from '~/stores/Formularios/usuarios/Users';
import { mapCampos } from '~/components/organism/Forms/useFormulario';
import { traerAdministradores } from '~/Core/Empresa/Usuario/GetAdministradores';
import { validarYEnviarEliminarUsuario } from '~/Core/Empresa/Usuario/EliminarUsuario';
import TablaNuxt from '~/components/organism/Table/TablaNuxt.vue';
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Form from '~/components/organism/Forms/Form.vue';
import { useAdministradorBuilder } from '~/build/Administradores/useAdministradoresBuilder';

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const UsersStore = useUsersStore();
const Users = ref([]);
const refresh = ref(1)
const show = ref(false)
const showVer = ref(false)
const municipiosOptions = ref([])
const puedeVer = varView.getPermisos.includes('Usuarios_view');
const puedeGet = varView.getPermisos.includes('Usuarios_get');
const puedePut = varView.getPermisos.includes('Usuarios_put');
const puedePostUsuarios = varView.getPermisos.includes('Usuarios_post');

async function llamadatos() {
    Users.value = await traerAdministradores()
    await UsersStore.indexDBDatos()
}
// Actualizar pagina cunso se agrega Nuevo Usuario
watch(() => show.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            refresh.value++;
        }
    }
)

watch(() => showVer.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            refresh.value++;
        }
    }
)

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await llamadatos()
    varView.cargando = false
});

// Visibilidad Formulario
const nuevoUser = () => {
    show.value = true
}

function cerrar() {
    show.value = false
    showVer.value = false
    varView.soloVer = true
}

// Funciones Formulario
const verUser = (usuario) => {
    mapCampos(usuario, UsersStore.Formulario)
    UsersStore.Formulario.InformacionUser.id = usuario.id
    showVer.value = true
}

async function eliminarUsuario() {
    const Usuario = UsersStore.Formulario
    console.log(Usuario)
    notificaciones.options.icono = 'warning';
    notificaciones.options.titulo = 'Deseas Eliminar Usuario?';
    notificaciones.options.html = `Se descativara el administrador ${Usuario.InformacionUser.name}.`;
    notificaciones.options.confirmtext = 'Si, Eliminar'
    notificaciones.options.canceltext = 'Atras'
    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {
        const res = await validarYEnviarEliminarUsuario(Usuario.InformacionUser)
        if (res) {
            notificaciones.options.position = 'top-end';
            notificaciones.options.texto = "Usuario eliminado con exito.";
            notificaciones.options.background = '#6bc517'
            notificaciones.options.tiempo = 1500
            notificaciones.mensaje()
            notificaciones.options.background = '#d33'

            cerrar()
            await llamadatos();
            refresh.value++;
        }
    }
}


const propiedadesUser = puedePostUsuarios ? computed(() => {
    return useAdministradorBuilder({
        storeId: 'NuevoUsuario',
        storePinia: 'Usuarios',
        tipoUsuario: 'Administrador',
        cerrarModal: cerrar,
        show: show,
        tipoFormulario: 'Wizard',
        departamentos: municipios,
        municipiosList: municipiosOptions,
    });
}) : null

const propiedadesVerUser = puedePut ? computed(() => {
    return useAdministradorBuilder({
        storeId: "ModificarUsuario",
        storePinia: "Usuarios",
        cerrarModal: cerrar,
        show: showVer,
        tipoFormulario: "Wizard",
        verUser: true,
        soloVer: varView.soloVer,
        tipoUsuario: "Administrador",
        eliminar: eliminarUsuario,
        departamentos: municipios,
        municipiosList: municipiosOptions,
    });
}) : null

const columns = [
    { accessorKey: "No_document", header: "Documento" },
    { accessorKey: "name", header: "Nombre", ordenar: true },
    { accessorKey: "celular", header: "Celular", ordenar: true },
    { accessorKey: "correo", header: "Correo", ordenar: true },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')

            const color =
                estado === 1
                    ? 'success'
                    : estado === 0
                        ? 'neutral'
                        : 'warning'

            return h(
                UBadge,
                { variant: 'subtle', color, class: 'capitalize' },
                () => estado === 1 ? 'Activo' : estado === 0 ? 'Inactivo' : 'Desconocido'
            )
        }
    },
    {
        id: 'actions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: { align: 'end' },
                        items: getRowItems(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost'
                        })
                )
            )
    },
]

function getRowItems(row) {
    const codigo = row.original

    return [
        {
            type: 'label',
            label: 'Acciones'
        },
        {
            label: 'Editar',
            onSelect() {
                verUser(codigo)
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarUsuario(codigo)
            }
        }
    ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Administradores',
        llamadatos: llamadatos,
        agregar: nuevoUser,
        data: Users,
        columns: columns,
    }
})

</script>
<template>
    <FondoDefault>
        <Form :Propiedades="propiedadesUser"></Form>
        <Form :Propiedades="propiedadesVerUser"></Form>
        <TablaNuxt :Propiedades="propiedadesTabla" />
    </FondoDefault>
</template>