// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useInsumoStore } from '~/stores/Entidades/Insumo';

export function useInsumosBuilder({
    storeId,
    storePinia,
    show,
    cerrarModal,
    actulizarDatos,
    soloVer,
    eliminarDato,
    movimientos,
    tiposEquipos
}) {
    const insumoStore = useInsumoStore();

    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setEditarFormulario(actulizarDatos)
        .setSoloVer(soloVer)
        .setEliminarFormulario(eliminarDato)
        .setFormulariotamaño('LG')
        .setFormularioTipo('Wizard')
        .setBotones([
            { type: 'enviar', text: 'Siguiente', color: 'primary', },
            { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cerrar' },
        ])
    if (actulizarDatos) {
        builder
            .setFormularioTituloFormulario('Insumo Médico')
    } else {
        builder
            .setFormularioTituloFormulario('Nuevo insumo Médico')
    }
    builder
        .nuevaSeccion('Inventario')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-id-card text-blue-500 mr-1"></i>Informacion Basica',
            tamaño: 'w-full col-span-2',
            forLabel: 'nombre'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre del producto/ Modelo/ Marca',
            placeholder: 'Paracetamol en Tableta x500mg Ethics',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Insumos.nombre'
        })
        .addCampo({
            component: 'Select',
            options: [
                { label: 'Insumos médicos', value: 'Insumos médicos' },
                { label: 'Medicamento', value: 'Medicamento' },
                { label: 'Equipos médicos', value: 'Equipos médicos' },
                { label: 'Otro', value: 'Otro' },
            ],
            label: 'Categoria',
            placeholder: 'Categoria',
            id: 'categoria',
            name: 'categoria',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.categoria',
        })
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-boxes-stacked text-blue-500 mr-1"></i>Informacion de Stock',
            tamaño: 'w-full col-span-2',
            forLabel: 'unidad'
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            label: 'Cantidad Actual',
            placeholder: '0',
            id: 'stock',
            name: 'stock',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.stock',
        })
    if (insumoStore.Formulario.Insumos.categoria !== 'Equipos médicos') {
        builder
            .addCampo({
                component: 'Select',
                options: [
                    { label: 'Caja', value: 'Caja' },
                    { label: 'Unidad', value: 'Unidad' },
                    { label: 'Frasco', value: 'Frasco' },
                    { label: 'Otro', value: 'Otro' },
                ],
                label: 'Unidad de medida',
                placeholder: 'Unidad',
                id: 'unidad',
                name: 'unidad',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.unidad'
            })
    }
    if (insumoStore.Formulario.Insumos.categoria === 'Medicamento') {
        builder
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-capsules text-blue-500 mr-1"></i>Informacion Farmacologica',
                tamaño: 'w-full col-span-2',
                forLabel: 'activoL'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Ingrediente Activo',
                placeholder: 'Principio activo',
                id: 'activoL',
                name: 'activoL',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.activo'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Lote de Fabricacion',
                placeholder: 'Lote',
                id: 'lote',
                name: 'lote',
                tamaño: 'md:col-span-1 col-span-3',
                minlength: 3,
                vmodel: 'Insumos.lote'
            })
            .addCampo({
                component: 'Input',
                type: 'date',
                label: 'Fecha de Vencimiento',
                placeholder: 'AAAA-MM-DD',
                id: 'vencimiento',
                name: 'vencimiento',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.vencimiento',
            })
    }
    if (insumoStore.Formulario.Insumos.categoria === 'Insumos médicos') {
        builder
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-capsules text-blue-500 mr-1"></i>Informacion Adicional',
                tamaño: 'w-full col-span-2',
                forLabel: 'especificaciones'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Especificaciones',
                placeholder: 'Especificaciones del insumo',
                id: 'especificaciones',
                name: 'especificaciones',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.especificaciones'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Lote de Fabricacion',
                placeholder: 'Lote',
                id: 'lote',
                name: 'lote',
                tamaño: 'md:col-span-1 col-span-3',
                minlength: 3,
                vmodel: 'Insumos.lote'
            })
            .addCampo({
                component: 'Input',
                type: 'date',
                label: 'Fecha de Vencimiento',
                placeholder: 'AAAA-MM-DD',
                id: 'vencimiento',
                name: 'vencimiento',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.vencimiento',
            })

    }

    if (insumoStore.Formulario.Insumos.categoria === 'Equipos médicos') {
        builder
            .addCampo({
                component: 'Checkbox',
                placeholder: 'Nuevo Tipo Equipos',
                label: 'Nuevo tipo equipo',
                vmodel: 'Insumos.nuevo_tipo',
                tamaño: 'md:col-span-1 col-span-3 pt-5',
            })
        if (insumoStore.Formulario.Insumos.nuevo_tipo) {
            builder
                .addCampo({
                    component: 'Input',
                    type: 'text',
                    label: 'Nombre de tipo',
                    placeholder: 'Monitor',
                    id: 'nombre_tipo',
                    name: 'nombre_tipo',
                    tamaño: 'md:col-span-1 col-span-3',
                    minlength: 3,
                    vmodel: 'Tipo_equipo.nombre'
                })
                .addCampo({
                    component: 'Input',
                    type: 'text',
                    label: 'Descripcion Tipo de equipo',
                    placeholder: 'Equipo medico encargado de',
                    id: 'descripcion_tipo',
                    name: 'descripcion_tipo',
                    tamaño: 'md:col-span-1 col-span-3',
                    minlength: 3,
                    vmodel: 'Tipo_equipo.descripcion'
                })
        } else {

            builder
                .addCampo({
                    component: 'Select',
                    options: tiposEquipos,
                    label: 'Tipo de equipo',
                    placeholder: 'Lote',
                    id: 'lote',
                    name: 'lote',
                    tamaño: 'md:col-span-1 col-span-3',
                    minlength: 3,
                    vmodel: 'Insumos.tipo_equipo_id'
                })
        }
        builder
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Serial',
                placeholder: 'ABC123',
                id: 'vencimiento',
                name: 'vencimiento',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.serial',
            })
    }
    builder


        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Ubicacion',
            placeholder: 'Estante 1',
            id: 'ubicacion',
            name: 'ubicacion',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.ubicacion',
        })
    if (insumoStore.Formulario.Insumos.categoria !== 'Medicamento') {
        builder
            .addCampo({
                component: 'Select',
                type: 'text',
                label: '¿Es prestable?',
                placeholder: 'Seleccione el tipo de insumo',
                id: 'tipo',
                name: 'tipo',
                tamaño: 'md:col-span-1 col-span-3',
                options: [{ label: 'Prestable', value: '1' }, { label: 'No Prestable', value: '0' }],
                vmodel: 'Insumos.es_prestable',
            })
    }

    if (soloVer) {
        // Construimos las cards dinámicamente
        const cardsMovimientos = insumoStore.Formulario.Movimientos.length > 0 ? insumoStore.Formulario.Movimientos.map(mov => {
            // Definir estilos según tipo de movimiento
            let bgClass = ''
            let icon = ''
            let text = ''

            switch (mov.tipoMovimiento) {
                case 'Ingreso':
                    bgClass = 'bg-green-100 dark:bg-green-900'
                    icon = 'fa-solid fa-plus text-green-600'
                    text = `Stock agregado: ${mov.cantidadMovimiento} unidades`
                    break
                case 'usado':
                    bgClass = 'bg-yellow-100 dark:bg-yellow-900'
                    icon = 'fa-solid fa-arrow-up text-yellow-600'
                    text = `Stock usado: ${mov.cantidadMovimiento} unidades`
                    break
                case 'Egreso':
                    bgClass = 'bg-red-100 dark:bg-red-900'
                    icon = 'fa-solid fa-trash text-red-600'
                    text = `Stock eliminado: ${mov.cantidadMovimiento} unidades`
                    break
                default:
                    bgClass = 'bg-gray-100 dark:bg-gray-700'
                    icon = 'fa-solid fa-circle-info text-gray-600'
                    text = `Movimiento: ${mov.cantidadMovimiento} unidades`
            }

            return {
                header: {
                    icon: 'fa-solid fa-pills',
                    title: `${mov.cantidadMovimiento} unidades`,
                    html: `<span class="text-sm text-gray-500">${insumoStore.Formulario.Insumos?.nombre || ''}</span>`
                },
                body: {
                    html: `
                        <div class="flex items-center ${bgClass} p-2 rounded-lg gap-5">
                            <i class="${icon} mx-1"></i>
                            <div class="flex flex-col gap-1 text-sm">
                                <span class="font-semibold">${text}</span>
                                <span class="text-gray-600 dark:text-gray-400">Profesional: ${mov.medico?.info_usuario.name || 'N/A'}</span>
                                <div class="flex gap-3">
                                    <span class="text-xs text-gray-500">
                                        <i class="fa-solid fa-clock mr-1"></i> ${mov.fechaMovimiento}
                                    </span>
                                    <span class="text-xs text-gray-600">
                                        ${mov.analisis?.nombreServicio || ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `
                },
                footer: {
                    // buttons: [
                    //     {
                    //         icon: 'fa-solid fa-file text-gray-300 text-xs',
                    //         text: `Analisis: ${mov.nombreServicio} - ${mov.created_at.split(' ')[0]}`
                    //     }
                    // ]
                }
            }
        }) : [
            {
                header: {
                    icon: 'fa-solid fa-pills',
                    title: `Sin movimientos registrados`,
                    html: `<span class="text-sm text-gray-500">${insumoStore.Formulario.Insumos?.nombre || ''}</span>`
                },
            },
        ]

        builder
            .nuevaSeccion('Movimientos de Inventario')
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-boxes-stacked text-blue-500 mr-1"></i>Informacion de Stock',
                tamaño: 'w-full col-span-2',
                forLabel: 'unidad'
            })
            .addCampo({
                component: 'Card',
                cards: cardsMovimientos,
                contenedorCards: 'grid lg:grid-cols-2 grid-cols-1 gap-4 !space-y-0',
                contenedor: 'col-span-2 bg-gray-100 dark:bg-gray-800 px-3 pb-3 rounded-xl',
                tamaño: 'flex justify-between rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200 hover:bg-white! dark:hover:bg-gray-900!',
                header: {
                    title: 'Historial de Movimientos de Inventario',
                    html: `
                        <div class="flex items-center bg-green-400 dark:bg-green-900 text-white text-xs p-2 rounded-lg">
                            <i class="fa-solid fa-plus mr-2"></i>
                            <span class="font-semibold">Agregar</span>
                        </div>
                    `
                }
            })


    }
    return builder.build()
}