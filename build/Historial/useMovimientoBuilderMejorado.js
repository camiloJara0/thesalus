import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useInsumosStore } from '~/stores/Formularios/insumos/Insumos'
import { decryptData } from '~/composables/Formulario/crypto'

export function useMovimientoBuilderMejorado({
    storeId,
    storePinia,
    show,
    cerrarModal,
    medicosList,
    pacientesList,
    optionsInsumosDevueltos,
    optionsEquiposSeriales
}) {
    const insumoStore = useInsumosStore()
    const varView = useVarView()

    async function changeTipoMovimiento(tipoMovimiento) {
        const api = useApiRest()
        const config = useRuntimeConfig()
        const token = decryptData(localStorage.getItem('token'))

        // Si es "Devuelto", traer insumos prestados
        if (tipoMovimiento === 'Devuelto') {
            try {
                let options = {
                    metodo: 'POST',
                    url: config.public.insumosPrestados,
                    token: token,
                    body: {
                        id_insumo: insumoStore.Formulario.Insumos.id
                    }
                }
                const respuesta = await api.functionCall(options)
                if (respuesta.success) {
                    optionsInsumosDevueltos.value = respuesta.data.map(r => ({
                        label: `${r.paciente} - CC: ${r.cedula} - Hasta: ${r.fecha_hasta}`,
                        value: r.id_movimiento
                    }))
                }
            } catch (error) {
                console.error('Error al traer insumos prestados', error)
            }
        }

        // Si es "Reparación", traer equipos con serial
        if (tipoMovimiento === 'Reparacion' && insumoStore.Formulario.Insumos.categoria === 'Equipos médicos') {
            try {
                let options = {
                    metodo: 'GET',
                    url: `${config.public.equiposMedicos}/${insumoStore.Formulario.Insumos.id}/seriales`,
                    token: token
                }
                const respuesta = await api.functionCall(options)
                if (respuesta.success) {
                    optionsEquiposSeriales.value = respuesta.data.map(e => ({
                        label: `Serial: ${e.serial} - ${e.especificaciones || 'Sin especificaciones'}`,
                        value: e.id_serial
                    }))
                }
            } catch (error) {
                console.error('Error al traer equipos', error)
            }
        }
    }

    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setFormulariotamaño('LG')
        .setFormularioTipo('Wizard')
        .setBotones([
            { type: 'enviar', text: 'Registrar Movimiento', color: 'primary', },
            { text: 'Cancelar', accion: cerrarModal, color: 'neutral', type: 'cerrar' },
        ])
        .setFormularioTituloFormulario('📦 Registrar Movimiento de Inventario')

    // 📋 Sección 1: Información del Producto
    builder
        .nuevaSeccion('Información del Producto')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-box text-[var(--color-primary)] mr-2"></i>Detalles del Producto',
            tamaño: 'w-full col-span-2',
            forLabel: 'nombre'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre del Producto',
            placeholder: 'Nombre del producto',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full md:col-span-1 col-span-2',
            minlength: 3,
            vmodel: 'Insumos.nombre',
            disabled: true,
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Categoría',
            placeholder: 'Categoría',
            id: 'categoria',
            name: 'categoria',
            tamaño: 'w-full md:col-span-1 col-span-2',
            vmodel: 'Insumos.categoria',
            disabled: true,
        })

    // Mostrar campos específicos según categoría
    if (insumoStore.Formulario.Insumos.categoria === 'Medicamento') {
        builder
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Ingrediente Activo',
                id: 'activoL',
                name: 'activoL',
                tamaño: 'w-full col-span-2',
                vmodel: 'Insumos.activoL',
                disabled: true,
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Lote',
                id: 'lote',
                name: 'lote',
                tamaño: 'w-full md:col-span-1 col-span-2',
                vmodel: 'Insumos.lote',
                disabled: true,
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Vencimiento',
                id: 'vencimiento',
                name: 'vencimiento',
                tamaño: 'w-full md:col-span-1 col-span-2',
                vmodel: 'Insumos.vencimiento',
                disabled: true,
            })
    }

    if (insumoStore.Formulario.Insumos.categoria === 'Equipos médicos') {
        builder
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Ubicación',
                id: 'ubicacion',
                name: 'ubicacion',
                tamaño: 'w-full col-span-2',
                vmodel: 'Insumos.ubicacion',
                disabled: true,
            })
    }

    // 📦 Sección 2: Tipo de Movimiento
    builder
        .nuevaSeccion('Tipo de Movimiento')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-shuffle text-[var(--color-info)] mr-2"></i>Selecciona el tipo de movimiento',
            tamaño: 'w-full col-span-2',
            forLabel: 'tipoMovimiento'
        })
        .addCampo({
            component: 'RadioGroup',
            options: [
                { 
                    label: '📥 Ingreso', 
                    value: 'Ingreso',
                    description: 'Nuevo stock que entra al inventario'
                },
                { 
                    label: '📤 Egreso', 
                    value: 'Egreso',
                    description: 'Producto que sale del inventario'
                },
                { 
                    label: '🤝 Prestado', 
                    value: 'Prestado',
                    description: 'Producto prestado a un paciente'
                },
                { 
                    label: '↩️ Devuelto', 
                    value: 'Devuelto',
                    description: 'Producto que retorna de un préstamo'
                },
                { 
                    label: '🔧 Reparación', 
                    value: 'Reparacion',
                    description: 'Equipo enviado a reparación'
                }
            ],
            tamaño: 'w-full col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3',
            vmodel: 'Movimiento.tipoMovimiento',
            events: {
                onChange: changeTipoMovimiento
            }
        })

    // 📦 Sección 3: Cantidad y Detalles según Tipo
    builder
        .nuevaSeccion('Detalles del Movimiento')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-info text-[var(--color-warning)] mr-2"></i>Información específica',
            tamaño: 'w-full col-span-2',
            forLabel: 'detalles'
        })

    // Campos para Ingreso, Egreso
    if (['Ingreso', 'Egreso', 'Prestado'].includes(insumoStore.Formulario.Movimiento.tipoMovimiento)) {
        builder
            .addCampo({
                component: 'Input',
                type: 'number',
                label: 'Cantidad',
                placeholder: '0',
                id: 'cantidadMovimiento',
                name: 'cantidadMovimiento',
                tamaño: 'w-full col-span-2',
                minlength: 1,
                vmodel: 'Movimiento.cantidadMovimiento'
            })
    }

    // Campos para Devuelto
    if (insumoStore.Formulario.Movimiento.tipoMovimiento === 'Devuelto') {
        builder
            .addCampo({
                component: 'SelectSearch',
                label: 'Selecciona el Préstamo a Devolver',
                placeholder: 'Buscar por paciente o fecha...',
                id: 'id_movimiento',
                name: 'id_movimiento',
                tamaño: 'w-full col-span-2',
                options: optionsInsumosDevueltos,
                vmodel: 'Movimiento.id_movimiento'
            })
    }

    // Campos para Reparación (solo si es Equipo médico)
    if (insumoStore.Formulario.Movimiento.tipoMovimiento === 'Reparacion' && 
        insumoStore.Formulario.Insumos.categoria === 'Equipos médicos') {
        builder
            .addCampo({
                component: 'SelectSearch',
                label: 'Serial del Equipo',
                placeholder: 'Buscar por serial...',
                id: 'id_serial',
                name: 'id_serial',
                tamaño: 'w-full col-span-2',
                options: optionsEquiposSeriales,
                vmodel: 'Movimiento.id_serial'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Descripción del Problema',
                placeholder: 'Describe el problema o falla del equipo',
                id: 'descripcionReparacion',
                name: 'descripcionReparacion',
                tamaño: 'w-full col-span-2',
                vmodel: 'Movimiento.descripcionReparacion'
            })
    }

    // Campos para Prestado
    if (insumoStore.Formulario.Movimiento.tipoMovimiento === 'Prestado') {
        builder
            .addCampo({
                component: 'SelectSearch',
                label: 'Paciente Receptor',
                placeholder: 'Buscar paciente...',
                id: 'id_paciente',
                name: 'id_paciente',
                tamaño: 'w-full col-span-2',
                options: pacientesList,
                opciones: [
                    { value: 'info_usuario.name' },
                    { text: 'CC', value: 'info_usuario.No_document' }
                ],
                vmodel: 'Movimiento.id_paciente'
            })
            .addCampo({
                component: 'Input',
                type: 'date',
                label: 'Fecha de Devolución Esperada',
                id: 'fecha_devolucion',
                name: 'fecha_devolucion',
                tamaño: 'w-full col-span-2',
                vmodel: 'Movimiento.fecha_devolucion'
            })
    }

    // 👤 Sección 4: Responsable del Movimiento
    builder
        .nuevaSeccion('Responsable del Movimiento')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user-tie text-[var(--color-default)] mr-2"></i>Información del Responsable',
            tamaño: 'w-full col-span-2',
            forLabel: 'responsable'
        })
        .addCampo({
            component: 'SelectSearch',
            label: 'Profesional Responsable',
            placeholder: 'Buscar profesional...',
            id: 'id_medico',
            name: 'id_medico',
            tamaño: 'w-full col-span-2',
            options: medicosList,
            opciones: [
                { value: 'info_usuario.name' },
                { text: 'CC', value: 'info_usuario.No_document' }
            ],
            vmodel: 'Movimiento.id_medico',
            upperCase: true,
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            label: 'Fecha del Movimiento',
            id: 'fechaMovimiento',
            name: 'fechaMovimiento',
            tamaño: 'w-full col-span-2',
            vmodel: 'Movimiento.fechaMovimiento',
        })

    // 📝 Sección 5: Observaciones
    builder
        .nuevaSeccion('Observaciones')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-note-sticky text-[var(--color-green)] mr-2"></i>Notas Adicionales',
            tamaño: 'w-full col-span-2',
            forLabel: 'observaciones'
        })
        .addCampo({
            component: 'Textarea',
            label: 'Observaciones',
            placeholder: 'Agrega notas sobre este movimiento (opcional)',
            id: 'observaciones',
            name: 'observaciones',
            tamaño: 'w-full col-span-2',
            minlength: 0,
            maxlength: 500,
            rows: 4,
            vmodel: 'Movimiento.observaciones'
        })

    return builder.build()
}
