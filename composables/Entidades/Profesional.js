import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { UBadge, UButton, UDropdownMenu } from '#components'
import { h } from 'vue'
import { editarProfesional } from "~/Core/Profesional/PUTMedico";

export function useProfesionalActions({
    profesionalStore,
    varView,
    notificaciones,
    llamadatos
}) {

    /* ===============================
       MODALES
    =============================== */
    const { hasPermiso } = usePermisos()
    const puedeDelete = hasPermiso('Profesional_delete')
    const puedePut = hasPermiso('Profesional_put')
    const agregarMedico = () => {
        mapCamposLimpios(profesionalStore.Formulario);
        profesionalStore.showNuevoProfesional = true;
        varView.soloVer = false;
    };

    const cerrar = () => {
        profesionalStore.showModificarProfesional = false;
        profesionalStore.showNuevoProfesional = false;
        varView.soloVer = false;
    };

    /* ===============================
       VER / MODIFICAR PROFESIONAL
    =============================== */

    const modificarMedico = (profesional) => {
        profesionalStore.Formulario.Profesional = JSON.parse(JSON.stringify(profesional))
        profesionalStore.showModificarProfesional = true;
    };

    /* ===============================
       ELIMINAR PROFESIONAL
    =============================== */

    const eliminarProfesional = async (profesional) => {


            notificaciones.options.icono = "warning",
            notificaciones.options.titulo = "¿Deseas eliminar el profesional?",
            notificaciones.options.html = `Se eliminará el profesional: <span>${profesional.info_usuario.name}</span>`,
            notificaciones.options.confirmtext = "Sí, eliminar",
            notificaciones.options.canceltext = "Atrás"


        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await profesionalStore.eliminar(profesional);
        if (!eliminado) return;


            notificaciones.options.position = "top-end",
            notificaciones.options.texto = "Profesional eliminado con éxito.",
            notificaciones.options.background = "#6bc517",
            notificaciones.options.tiempo = 1500


        notificaciones.mensaje();
        notificaciones.options.background = "#d33";
    };

    const eliminarProfesionalOffline = async () => {
        const profesional = profesionalStore.Formulario;

        notificaciones.options = {
            icono: "warning",
            titulo: "¿Deseas eliminar el profesional no enviado?",
            html: `Se eliminará el registro no enviado de: <span>${profesional.InformacionUser.name}</span>`,
            confirmtext: "Sí, eliminar",
            canceltext: "Atrás"
        };

        const respuesta = await notificaciones.alertRespuesta();
        if (respuesta !== "confirmado") return;

        const eliminado = await profesionalStore.eliminar(profesional);
        if (!eliminado) return;

        notificaciones.options = {
            position: "top-end",
            texto: "Profesional eliminado con éxito.",
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
    { accessorKey: "municipio_laboral", header: "Ciudad", },
    { accessorKey: "zona_laboral", header: "Zona", },
    { accessorKey: "profesion.nombre", header: "Profesion", ordenar: true },
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

const columnsOffline = [
    { accessorKey: 'info_usuario.No_document', header: 'Documento' },
    { accessorKey: 'info_usuario.name', header: 'Nombre' },
    { accessorKey: 'info_usuario.celular', header: 'Celular' },
    { accessorKey: 'municipio_laboral', header: 'Ciudad' },
    { accessorKey: 'zona_laboral', header: 'Zona' },
    { accessorKey: 'profesion.nombre', header: 'Profesión' },
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
                        items: getRowItemsOffline(row)
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
    const profesional = row.original || row

    if(profesional.estado === 1){
        return [
            {
                type: 'label',
                label: 'Acciones'
            },
            {
                label: 'Editar',
                onSelect() {
                    modificarMedico(profesional)
                },
                disabled: !puedePut
            },
            {
                type: 'separator'
            },
            {
                label: 'Eliminar',
                onSelect() {
                    eliminarProfesional(profesional)
                },
                disabled: !puedeDelete
            }
        ]
    } else if(profesional.estado === 0){
        return [
            {
                type: 'label',
                label: 'Acciones'
            },
            {
                label: 'Activar',
                onSelect: async() => {
                    await editarProfesional(profesional)
                    notificaciones.options = {
                        position: "top-end",
                        texto: "Profesional activado con éxito.",
                        background: "#6bc517",
                        tiempo: 1500
                    };

                    await notificaciones.mensaje();
                    await profesionalStore.traer(true, true)
                },
                disabled: !puedePut
            },
        ]
    }
}

function getRowItemsOffline(row) {
    const profesional = row.original

    if(profesional.estado === 1){
        return [
            {
                type: 'label',
                label: 'Acciones'
            },
            {
                label: 'Editar',
                onSelect() {
                    modificarMedico(profesional)
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Eliminar',
                onSelect() {
                    eliminarProfesionalOffline(profesional)
                }
            }
        ]
    } else if(profesional.estado === 0){
        return [
            {
                type: 'label',
                label: 'Acciones'
            },
            {
                label: 'Activar',
                onSelect: async() => {
                    await editarProfesional(profesional)
                    notificaciones.options = {
                        position: "top-end",
                        texto: "Profesional activado con éxito.",
                        background: "#6bc517",
                        tiempo: 1500
                    };

                    await notificaciones.mensaje();
                    await profesionalStore.traer(true, true)
                },
                disabled: !puedePut
            },
        ]
    }
}

    return {
        agregarMedico,
        modificarMedico,
        cerrar,
        eliminarProfesional,
        eliminarProfesionalOffline,
        columns,
        getRowItems,
        columnsOffline
    };
}
