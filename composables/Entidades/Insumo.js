import { mapCampos, mapCamposLimpios } from "~/components/organism/Forms/useFormulario";
import { useInsumoStore } from "~/stores/Entidades/Insumo";
import { UBadge, UButton, UDropdownMenu } from '#components'
import { h } from 'vue'
import { usePacientesStore } from "~/stores/Entidades/Paciente";
import { imprimirPDFComoDato } from "~/Core/Historial/PlanesManejo/imprimirComodato";

export function useInsumoActions({
  notificaciones
}) {
  const store = useInsumoStore()
  const varView = useVarView()
  const puedePut = varView.getPermisos.includes('Insumos_put')
  const puedeDelete = varView.getPermisos.includes('Insumos_delete')


  const agregarInsumo = () => {
    const varView = useVarView()
    store.showNuevoInsumo = true;
    varView.soloVer = false;
  };

  const agregarMovimiento = (insumo) => {
    mapCampos(insumo, store.Formulario)
    mapCamposLimpios(store.Formulario.Movimientos)
    store.Formulario.Movimientos.id_insumo = insumo.id
    store.showMovimiento = true
  }

  // CERRAR MODALES
  const cerrar = () => {
    const varView = useVarView()
    store.showNuevoInsumo = false
    store.showModificarInsumo = false
    mapCamposLimpios(store.Formulario)
    varView.soloVer = true;
  };

  const verInsumo = async (insumo) => {
    mapCampos(insumo, store.Formulario.Insumos)
    store.Formulario.Insumos = JSON.parse(JSON.stringify(insumo))
    store.Formulario.Movimientos = insumo.movimientos
    if (insumo.categoria === 'Medicamento') {
      store.Formulario.Insumos.unidad = insumo.info_medicamento.unidad
      store.Formulario.Insumos.activo = insumo.info_medicamento.activo
      store.Formulario.Insumos.lote = insumo.info_medicamento.lote
      store.Formulario.Insumos.vencimiento = insumo.info_medicamento.vencimiento
    } else if (insumo.categoria === 'Equipos médicos') {
      store.Formulario.Insumos.serial = insumo.info_equipo.serial
      store.Formulario.Insumos.tipo_equipo_id = insumo.info_equipo.tipo_equipo_id
    } else {
      store.Formulario.Insumos.unidad = insumo.info_insumo.unidad
      store.Formulario.Insumos.especificaciones = insumo.info_insumo.especificaciones
      store.Formulario.Insumos.lote = insumo.info_insumo.lote
      store.Formulario.Insumos.vencimiento = insumo.info_insumo.vencimiento
      store.Formulario.Insumos.ubicacion = insumo.info_insumo.ubicacion
    }
    store.showModificarInsumo = true;
  };


  const eliminarInsumo = async (insumo) => {
    store.Formulario.Insumos = JSON.parse(JSON.stringify(insumo))
    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el producto?",
      html: `Se eliminará el producto: <span>${insumo.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {
      const res = await store.eliminar(insumo)
      if (res) {
        notificaciones.options.position = 'top-end';
        notificaciones.options.texto = "producto eliminado con exito.";
        notificaciones.options.background = '#6bc517'
        notificaciones.options.tiempo = 1500
        notificaciones.mensaje()
        notificaciones.options.background = '#d33'

        cerrar()
      }
    }
  };

  const verMovimiento = async (movimiento) => {
    // mapCampos(movimiento, store.Formulario.Movimientos)
    store.Formulario.Insumos = JSON.parse(JSON.stringify(movimiento.insumo))
    store.Formulario.Movimientos = JSON.parse(JSON.stringify(movimiento))
    store.Formulario.Movimientos.id_movimiento = movimiento.id
    store.showModificarMovimiento = true;
  };

  const eliminarMovimiento = async (movimiento) => {
    store.Formulario.Movimientos = JSON.parse(JSON.stringify(movimiento))
    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el movimiento?",
      html: `Se eliminará el movimiento y se revertiran los cambios: <span>${movimiento.insumo.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {
      const res = await store.eliminarMovimiento(movimiento)
      if (res) {
        notificaciones.options.position = 'top-end';
        notificaciones.options.texto = "Movimiento eliminado con exito.";
        notificaciones.options.background = '#6bc517'
        notificaciones.options.tiempo = 1500
        notificaciones.mensaje()
        notificaciones.options.background = '#d33'

        cerrar()
      }
    }
  };

  const devolverMovimiento = (movimiento) => {
    mapCampos(movimiento, store.Formulario)
    store.Formulario.Movimientos = JSON.parse(JSON.stringify(movimiento.movimiento))
    store.Formulario.Movimientos.tipoMovimiento = 'Devuelto'
    store.Formulario.Movimientos.id_movimiento = movimiento.id_movimiento
    store.showMovimiento = true
  }

  const columnsMovimiento = [
    { accessorKey: "fechaMovimiento", header: "Fecha" },
    {
      accessorKey: "paciente.info_usuario.name",
      header: "Paciente",
      cell: ({ row }) => {
        const data = row.original

        if (!data.id_paciente) {
          return 'Sin Paciente'
        }

        return data.paciente.info_usuario.name
      }
    },
    { accessorKey: "medico.info_usuario.name", header: "Responsable", ordenar: true },
    { accessorKey: "insumo.nombre", header: "Nombre" },
    { accessorKey: "insumo.categoria", header: "Categoria", ordenar: true },
    { 
      accessorKey: "tipoMovimiento", 
      header: "Tipo", 
      ordenar: true,
      cell: ({ row }) => {
        const tipo = row.original.tipoMovimiento || ''
        const color =
          tipo === 'Ingreso' ? 'success' :
          tipo === 'Egreso' ? 'error' : 
          tipo === 'Devuelto' ? 'info' : 'warning'

        return h(
          UBadge,
          { variant: 'subtle', color, class: 'capitalize' },
          () => tipo
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) =>
        h('div', { class: 'text-right' },
          h(UDropdownMenu, {
            content: { align: 'end' },
            items: getRowItemsMovimiento(row)
          }, () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost'
            })
          )
        )
    },
  ]

  // 🎯 ACCIONES PARA MOVIMIENTOS
  function getRowItemsMovimiento(row) {
    const movimiento = row.original || row
    return [
      { type: 'label', label: 'Acciones' },
      {
        label: 'Ver Movimiento',
        onSelect() { verMovimiento(movimiento); varView.soloVer = true},
        disabled: !puedePut,
      },
      {
        label: 'Eliminar',
        onSelect() { eliminarMovimiento(movimiento)},
        disabled: !puedeDelete
      },
      { type: 'separator' },
      {
        label: 'Imprimir',
        disabled: !movimiento.id_paciente || movimiento.tipoMovimiento === 'Devuelto',
        onSelect() { console.log(movimiento); imprimirPDFComoDato(movimiento) }
      }
    ]
  }

  function agregarPrestacion(id = null) {
    const pacientesStore = usePacientesStore()
    pacientesStore.showItem = true
    varView.tipoHistoria = 'Medicamento'
    pacientesStore.PacienteSeleccionado = id
  }

  return {
    agregarInsumo,
    agregarMovimiento,
    verInsumo,
    cerrar,
    eliminarInsumo,
    verMovimiento,
    eliminarMovimiento,
    columnsMovimiento,
    getRowItemsMovimiento,
    agregarPrestacion,
    devolverMovimiento
  };
}
