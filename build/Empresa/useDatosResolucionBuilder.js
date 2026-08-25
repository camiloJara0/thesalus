// builders/useDatosResolucionBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useDatosResolucionBuilder({
    storeId,
    storePinia
}) {
    const builder = new FormularioBuilder()

    return builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(false)
        .setCamposRequeridos(['Facturacion.tipoDocumento',
            'Facturacion.prefijo',
            'Facturacion.no_resolucion',
            'Facturacion.fechaResolucion',
            'Facturacion.fechaInicial',
            'Facturacion.fechaHasta',
        ])
        .setBotones([{
            type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
        }])
        .nuevaSeccion('Resolucion de Facturacion')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-file-invoice text-blue-500 mr-1"></i>Resolución de Facturación',
            tamaño: 'w-full col-span-2',
            forLabel: 'tipoDocumento'
        })
        .addCampo({
            component: 'Select',
            placeholder: 'Tipo de Documento *',
            id: 'tipoDocumento',
            name: 'tipoDocumento',
            tamaño: 'md:col-span-1 col-span-2',
            options: [
                { text: 'Factura de Venta Nacional', value: 'Factura de Venta Naciona' },
                { text: 'Nota Crédito', value: 'Nota Crédito' },
                { text: 'Nota Débito', value: 'Nota Débito' },
                { text: 'Zip', value: 'Zip' },
                { text: 'Nomina Individual', value: 'Nomina Individual' },
                { text: 'Nomina Individual de Ajuste', value: 'Nomina Individual de Ajuste' },
                { text: 'Documento Soporte Electronico', value: 'Documento Soporte Electronico' },
                { text: 'Nota de Ajuste al Documento Soporte Electronico', value: 'Nota de Ajuste al Documento Soporte Electronico' },
                { text: 'Nota de crédito al Documento Equivalente', value: 'Nota de crédito al Documento Equivalente' },
                { text: 'Nota de crédito al Documento Equivalente POS', value: 'Nota de crédito al Documento Equivalente POS' },
            ],
            vmodel: 'Facturacion.tipoDocumento'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Prefijo de la resolución *',
            id: 'prefijo',
            name: 'prefijo',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.prefijo'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Número de resolución *',
            id: 'no_resolucion',
            name: 'no_resolucion',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.no_resolucion'
        })

        // 📌 Fechas
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: "Fecha de Resolución: 'AAAA-MM-DD' *",
            id: 'fechaResolucion',
            name: 'fechaResolucion',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.fechaResolucion',
            slot: {
                // label: `<label for="fechaResolucionDate" class="w-[20px] cursor-pointer" onclick="document.getElementById('fechaResolucionDate').showPicker()"><i class="fa-solid fa-calendar"></i></label>`,
                input: {
                    type: 'date',
                    id: 'fechaResolucionDate',
                    name: 'fechaResolucionDate',
                },
                inputClass: 'w-[20px] '
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: "Fecha Inicial: 'AAAA-MM-DD' *",
            id: 'fechaInicial',
            name: 'fechaInicial',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.fechaInicial',
            slot: {
                input: {
                    type: 'date',
                    id: 'fechaInicialDate',
                    name: 'fechaInicialDate',
                },
                inputClass: 'w-[20px] '
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: "Fecha Hasta: 'AAAA-MM-DD' *",
            id: 'fechaHasta',
            name: 'fechaHasta',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.fechaHasta',
            slot: {
                input: {
                    type: 'date',
                    id: 'fechaHastaDate',
                    name: 'fechaHastaDate',
                },
                inputClass: 'w-[20px] '
            }
        })

        // 📌 Numeración y Clave Técnica
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Número Inicial *',
            id: 'numeroInicial',
            name: 'numeroInicial',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.numeroInicial'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Número Hasta *',
            id: 'numeroHasta',
            name: 'numeroHasta',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.numeroHasta'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Clave Técnica *',
            id: 'claveTecnica',
            name: 'claveTecnica',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.claveTecnica'
        })

        // 📌 Descripción
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Descripción *',
            id: 'descripcion',
            name: 'descripcion',
            tamaño: 'md:col-span-1 col-span-2',
            vmodel: 'Facturacion.descripcion'
        })
        .build()
}