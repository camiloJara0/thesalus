// builders/useInsumosBuilder.js
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
            text: '<i class="i-lucide-user-round text-blue-500 mr-1"></i>Información Básica',
            tamaño: 'w-full col-span-2',
            forLabel: 'nombre'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre del producto / Modelo / Marca *',
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
            label: 'Categoría *',
            placeholder: 'Seleccione una categoría',
            id: 'categoria',
            name: 'categoria',
            tamaño: 'md:col-span-1 col-span-3',
            vmodel: 'Insumos.categoria',
        })
        .addCampo({
            component: 'Label',
            text: '<i class="i-lucide-boxes-stacked text-blue-500 mr-1"></i>Información de Stock',
            tamaño: 'w-full col-span-2',
            forLabel: 'unidad'
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            label: 'Cantidad actual *',
            placeholder: 'Ejemplo: 150',
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
                label: 'Unidad de medida *',
                placeholder: 'Seleccione una unidad',
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
                forLabel: 'activoL',
                tamaño: 'w-full col-span-2 mt-3',
                text: `
                        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                            <div class="px-5 py-4 bg-linear-to-r from-blue-500/10 to-blue-500/5 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex items-center gap-3">
                                    <div class="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <i class="fa-solid fa-capsules text-blue-600 text-lg"></i>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            Información Farmacológica
                                        </p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            Complete los datos farmacológicos del medicamento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Ingrediente activo *',
                placeholder: 'Ejemplo: Paracetamol 500mg',
                id: 'activoL',
                name: 'activoL',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.activo'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Lote de fabricación *',
                placeholder: 'Ejemplo: LOTE-2024-001',
                id: 'lote',
                name: 'lote',
                tamaño: 'md:col-span-1 col-span-3',
                minlength: 3,
                vmodel: 'Insumos.lote'
            })
            .addCampo({
                component: 'Input',
                type: 'date',
                label: 'Fecha de vencimiento *',
                placeholder: 'Seleccione fecha',
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
                forLabel: 'especificaciones',
                tamaño: 'w-full col-span-2 mt-3',
                text: `
                        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                            <div class="px-5 py-4 bg-linear-to-r from-green-500/10 to-green-500/5 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex items-center gap-3">
                                    <div class="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <i class="fa-solid fa-syringe text-green-600 text-lg"></i>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            Información Adicional
                                        </p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            Complete las especificaciones del insumo médico.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Especificaciones *',
                placeholder: 'Ejemplo: Gasa estéril 10x10cm',
                id: 'especificaciones',
                name: 'especificaciones',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.especificaciones'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Lote de fabricación *',
                placeholder: 'Ejemplo: LOTE-2024-001',
                id: 'lote',
                name: 'lote',
                tamaño: 'md:col-span-1 col-span-3',
                minlength: 3,
                vmodel: 'Insumos.lote'
            })
            .addCampo({
                component: 'Input',
                type: 'date',
                label: 'Fecha de vencimiento *',
                placeholder: 'Seleccione fecha',
                id: 'vencimiento',
                name: 'vencimiento',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.vencimiento',
            })

    }

    if (insumoStore.Formulario.Insumos.categoria === 'Equipos médicos') {
        builder
            .addCampo({
                component: 'Label',
                forLabel: 'nombre_tipo',
                tamaño: 'w-full col-span-2 mt-3',
                text: `
                        <div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                            <div class="px-5 py-4 bg-linear-to-r from-purple-500/10 to-purple-500/5 border-b border-gray-200 dark:border-gray-700">
                                <div class="flex items-center gap-3">
                                    <div class="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <i class="fa-solid fa-microscope text-purple-600 text-lg"></i>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-900 dark:text-white">
                                            Información del Equipo
                                        </p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">
                                            Complete los datos de identificación del equipo médico.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
            })
            .addCampo({
                component: 'Select',
                options: tiposEquipos,
                label: 'Tipo de equipo *',
                placeholder: 'Seleccione tipo de equipo',
                id: 'lote',
                name: 'lote',
                tamaño: 'md:col-span-1 col-span-3',
                minlength: 3,
                vmodel: 'Insumos.tipo_equipo_id'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Serial *',
                placeholder: 'Ejemplo: SN-2024-ABC123',
                id: 'vencimiento',
                name: 'vencimiento',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.serial',
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Marca *',
                placeholder: 'Ejemplo: Olympus',
                id: 'marca',
                name: 'marca',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.marca',
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Modelo *',
                placeholder: 'Ejemplo: EVIS X1',
                id: 'modelo',
                name: 'modelo',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.modelo',
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Registro sanitario (opcional)',
                placeholder: 'Ejemplo: INVIMA 2024-001',
                id: 'vencimiento',
                name: 'vencimiento',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.registro_sanitario',
            })
    }
    builder
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Ubicación',
            placeholder: 'Ejemplo: Estante 1 - Nivel 2',
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
                label: '¿Es prestable? *',
                placeholder: 'Seleccione si es prestable',
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
                text: '<i class="i-lucide-boxes-stacked text-blue-500 mr-1"></i>Información de Stock',
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