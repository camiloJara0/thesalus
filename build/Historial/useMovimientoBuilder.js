// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { decryptData } from '~/composables/Formulario/crypto';
import { useInsumoStore } from '~/stores/Entidades/Insumo';

export function useMovimientoBuilder({
    storeId,
    storePinia,
    show,
    cerrarModal,
    insumos,
    medicosList,
    optionsInsumos
}) {
    const insumoStore = useInsumoStore();

  async function changeTipoMovimiento(event) {
    const tipoMovimiento = event
    if (tipoMovimiento === 'Devuelto') {

      const api = useApiRest()
      const config = useRuntimeConfig()
      const token = decryptData(localStorage.getItem('token'))

      let options = {
        metodo: 'POST',
        url: config.public.insumosPrestados,
        token: token,
        body: {
          id_insumo: insumoStore.Formulario.Movimientos.id_insumo
        }
      }

      const respuesta = await api.functionCall(options)

      if (respuesta.success) {
        optionsInsumos.value = respuesta.data.map(r => {return {label: `${r.paciente} - ${r.documento} - ${r.fecha_hasta}`, value: r.id_movimiento}})
      }


    }

  }

    const builder = new FormularioBuilder()
    builder
        .setStoreId(insumoStore.soloVer ? '' : storeId)
        .setStorePinia(storePinia)
        .setFormularioShow(show)
        .setFormulariotamaño('XS')
        .setFormularioTipo('Wizard')
        .setSoloVer(insumoStore.soloVer)
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'primary', },
            { text: 'Atrás', accion: cerrarModal, color: 'neutral', type: 'cerrar' },
        ])
        .setFormularioTituloFormulario('Registrar movimiento de inventario')
        .nuevaSeccion(insumoStore.Formulario.Insumos.activo)
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-id-card text-blue-500 mr-1"></i>Medicamento',
            tamaño: 'w-full col-span-2',
            forLabel: 'nombre'
        })
        if(!insumoStore.Formulario.Insumos.nombre){
            builder
            .addCampo({
                component: 'SelectSearch',
                type: 'text',
                label: 'Nombre del producto',
                placeholder: 'Nombre del producto',
                id: 'nombre',
                name: 'nombre',
                tamaño: 'md:col-span-2 col-span-2',
                minlength: 3,
                vmodel: 'Movimientos.id_insumo',
                options: insumos,
                disabled: false,
            })
        } else {
            builder
            .addCampo({
                component: 'SelectSearch',
                type: 'text',
                label: 'Nombre del producto',
                placeholder: 'Nombre del producto',
                id: 'nombre',
                name: 'nombre',
                tamaño: 'md:col-span-1 col-span-3',
                minlength: 3,
                vmodel: 'Insumos.nombre',
                disabled: true,
            })
            .addCampo({
                component: 'Select',
                options: [
                    { value: 'Medicamento', label: 'Medicamento' },
                    { value: 'Material Quirurgico', label: 'Material Quirurgico' },
                    { value: 'Insumo de Laboratorio', label: 'Insumo de Laboratorio' },
                    { value: 'Insumos médicos', label: 'Insumos médicos' },
                    { value: 'Equipos médicos', label: 'Equipos médicos' },
                    { value: 'Otro', label: 'Otro' },
                ],
                label: 'Categoria',
                placeholder: 'Categoria',
                id: 'categoria',
                name: 'categoria',
                tamaño: 'md:col-span-1 col-span-3',
                vmodel: 'Insumos.categoria',
                disabled: true,
            })
        }
        builder
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-capsules text-blue-500 mr-1"></i>Movimiento de Inventario',
            tamaño: 'w-full col-span-2',
            forLabel: 'activo'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Cantidad del movimiento',
            placeholder: '20',
            id: 'cantidadMovimiento',
            name: 'cantidadMovimiento',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 1,
            vmodel: 'Movimientos.cantidadMovimiento'
        })
        .addCampo({
            component: 'Select',
            options: [
                { label: 'Ingreso', value: 'Ingreso' },
                { label: 'Egreso', value: 'Egreso' },
                { label: 'Devuelto', value: 'Devuelto'}
            ],
            label: 'Tipo',
            placeholder: 'Seleccione tipo de movimiento',
            id: 'tipoMovimiento',
            name: 'tipoMovimiento',
            tamaño: 'md:col-span-1 col-span-3',
            minlength: 3,
            vmodel: 'Movimientos.tipoMovimiento',
            events: {
                onChange: changeTipoMovimiento
            }
        })
        if(insumoStore.Formulario.Movimientos.tipoMovimiento == 'Devuelto'){
           builder
            .addCampo({
                component: 'SelectSearch',
                options: optionsInsumos.value,
                label: 'Insumos Prestados (id)',
                placeholder: 'Seleccione el paciente al que se le presto el insumo',
                id: 'tipoMovimiento',
                name: 'tipoMovimiento',
                tamaño: 'w-full md:col-span-1 col-span-2',
                minlength: 3,
                vmodel: 'Movimientos.id_movimiento'
            }) 
        }
        builder
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Encargado del Movimiento',
            tamaño: 'w-full col-span-2',
            forLabel: 'nombreM'
        })
        .addCampo({
            component: 'SelectSearch',
            placeholder: 'Juan Pérez',
            label: 'Nombre del profesional',
            id: 'nombreM',
            name: 'nombreM',
            tamaño: 'w-full md:col-span-1 col-span-2',
            vmodel: 'Movimientos.id_medico',
            options: medicosList,
            upperCase: true,
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            label: 'Fecha de Movimiento',
            id: 'movimiento',
            name: 'movimiento',
            tamaño: 'md:col-span-1 col-span-2 md:mt-[-15px]',
            vmodel: 'Movimientos.fechaMovimiento',
        })

    return builder.build()
}