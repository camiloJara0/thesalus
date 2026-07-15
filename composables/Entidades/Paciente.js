import { mapCampos } from "~/components/organism/Forms/useFormulario";
import { UBadge, UButton, UDropdownMenu } from '#components'
import { h } from 'vue'

export function usePacienteActions({
    pacientesStore,
    varView,
    notificaciones,
    llamadatos,
    refresh,
}) {

    // ACCIONES DE PACIENTE

    // AGREGAR PACIENTE
    const agregarPaciente = () => {
        pacientesStore.showNuevoPaciente = true;
        varView.soloVer = false;
    };

    // CERRAR MODALES
    const cerrar = () => {
        pacientesStore.showNuevoPaciente = false;
        pacientesStore.showModificarPaciente = false;
        varView.soloVer = true;
    };

    // EDITAR PACIENTE
    const verPaciente = async (paciente) => {
        pacientesStore.Formulario.Paciente = JSON.parse(JSON.stringify(paciente))
        mapCampos(paciente, pacientesStore.Formulario);
        pacientesStore.Formulario.Paciente.convenio_id = paciente.convenios?.[0]?.id
        pacientesStore.showModificarPaciente = true;
    };

    // ELIMINAR PACIENTE
    const eliminarPaciente = async (data) => {
        pacientesStore.Formulario.Paciente = JSON.parse(JSON.stringify(data))
        const paciente = pacientesStore.Formulario.Paciente;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar el paciente?",
            html: `Se eliminará el paciente: <span>${paciente.info_usuario.name}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();

        if (respuesta !== "confirmado") return;

        const eliminado = await pacientesStore.eliminar(paciente);

        if (!eliminado) return;

        notificaciones.options = {
            position: "top-end",
            texto: "Paciente eliminado con éxito.",
            background: "#6bc517",
            tiempo: 1500
        };

        notificaciones.mensaje();
        notificaciones.options.background = "#d33";

        cerrar();
        await llamadatos();
        refresh.value++;
    };

    const columns = [
        { accessorKey: "info_usuario.No_document", header: "Documento", ordenar: true },
        { accessorKey: "info_usuario.name", header: "Nombre", ordenar: true },
        { accessorKey: "info_usuario.celular", header: "Celular", },
        { accessorKey: "sexo", header: "Sexo", },
        {
            accessorKey: "info_usuario.municipio", header: "Ciudad",
            cell: ({ row }) => {
                const texto = row.original.info_usuario.municipio || ''
                const limitado = texto.length > 15 ? texto.substring(0, 15) + '...' : texto
                return h('p', limitado)
            }
        },
        { accessorKey: "regimen", header: "Regimen", },
        {
            accessorKey: "eps.nombre", header: "EPS",
            cell: ({ row }) => {
                const texto = row.original.eps.nombre || ''
                const limitado = texto.length > 10 ? texto.substring(0, 10) + '...' : texto
                return h('p', limitado)
            }
        },
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
        const paciente = row.original || row

        return [
            {
                type: 'label',
                label: 'Acciones'
            },
            {
                label: 'Editar',
                onSelect() {
                    verPaciente(paciente)
                }
            },
            {
                label: 'Asignar de Inventario',
                onSelect() {
                    pacientesStore.showItem = true
                    varView.tipoHistoria = 'Medicamento'
                    pacientesStore.PacienteSeleccionado = paciente.id
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Eliminar',
                onSelect() {
                    eliminarPaciente(paciente)
                }
            }
        ]
    }

    return {
        agregarPaciente,
        verPaciente,
        cerrar,
        eliminarPaciente,
        columns,
        getRowItems
    };
}
