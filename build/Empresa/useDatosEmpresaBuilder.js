// builders/useDatosEmpresaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useDatosEmpresaBuilder({
    storeId,
    storePinia
}) {
    const builder = new FormularioBuilder()

    return builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(false)
        .setBotones([{
            type: 'enviar', text: 'Enviar', color: 'bg-blue-500',
        }])
        .setCamposRequeridos(['Empresa.nombre',
            'Empresa.logo',
            'Empresa.logoLogin',
            'Empresa.JPG',
            'Empresa.no_identificacion',
            'Empresa.DV',
            'Empresa.registroMercantil',
            'Empresa.direccion',
            'Empresa.telefono',
            'Empresa.lenguaje',
            'Empresa.impuesto',
            'Empresa.pais',
            'Empresa.tipoDocumento',
            'Empresa.tipoOperacion',
            'Empresa.tipoEntorno',
            'Empresa.tipoMoneda',
            'Empresa.tipoOrganizacion',
            'Empresa.municipio',
            'Empresa.tipoResponsabilidad',
            'Empresa.tipoRegimen',])
        .setFormularioContenedorCampos('grid lg:grid-cols-4! md:grid-cols-3! grid-cols-1!')
        .nuevaSeccion('Datos Empresa')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-building text-blue-500 mr-1"></i>Datos de la Empresa',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'nombre',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Nombre Comercial *',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Empresa.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Logo *',
            id: 'logo',
            name: 'logo',
            tamaño: 'w-full',
            vmodel: 'Empresa.logo',
            slot: {
                label: '<label for="logoFile"><i class="fa-solid fa-image text-blue-500 cursor-pointer hover:text-blue-600"></i></label>',
                input: {
                    type: 'file',
                    accept: 'image/png, image/jpeg',
                    id: 'logoFile',
                    name: 'logoFile',
                    onChange: "event => logoFile(Empresa, 'logo', event)"
                }
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Logo Login *',
            id: 'logoLogin',
            name: 'logoLogin',
            tamaño: 'w-full',
            vmodel: 'Empresa.logoLogin',
            slot: {
                label: '<label for="logoLoginFile"><i class="fa-solid fa-image text-blue-500 cursor-pointer hover:text-blue-600"></i></label>',
                input: {
                    type: 'file',
                    accept: 'image/png, image/jpeg',
                    id: 'logoLoginFile',
                    name: 'logoLoginFile',
                    onChange: "event => logoFile(Empresa, 'logoLogin', event)"
                }
            }
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'JPG firmas facturas *',
            id: 'JPG',
            name: 'firmas',
            tamaño: 'w-full',
            vmodel: 'Empresa.JPG',
            slot: {
                label: '<label for="JPGfirmas"><i class="fa-solid fa-image text-blue-500 cursor-pointer hover:text-blue-600"></i></label>',
                input: {
                    type: 'file',
                    accept: 'image/png, image/jpeg',
                    id: 'JPGfirmas',
                    name: 'JPGfirmas',
                    onChange: "event => logoFile(Empresa, 'JPG', event)"
                }
            }
        })

        // 📌 Sección: Configuración de la Empresa
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-gear text-blue-500 mr-1"></i>Configuración de la Empresa',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'IdEmpresa'
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            placeholder: 'Número de identificación *',
            id: 'IdEmpresa',
            name: 'IdEmpresa',
            tamaño: 'w-full',
            vmodel: 'Empresa.no_identificacion'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'DV *',
            id: 'DV',
            name: 'DV',
            tamaño: 'w-full',
            vmodel: 'Empresa.DV',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Registro Mercantil *',
            id: 'registroMercantil',
            name: 'registroMercantil',
            tamaño: 'w-full',
            vmodel: 'Empresa.registroMercantil',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Dirección *',
            id: 'direccion',
            name: 'direccion',
            tamaño: 'w-full',
            vmodel: 'Empresa.direccion',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Teléfono *',
            id: 'telefono',
            name: 'telefono',
            tamaño: 'w-full',
            vmodel: 'Empresa.telefono'
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Lenguaje *',
            id: 'lenguaje',
            name: 'lenguaje',
            tamaño: 'w-full',
            vmodel: 'Empresa.lenguaje',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Impuesto *',
            id: 'impuesto',
            name: 'impuesto',
            tamaño: 'w-full',
            vmodel: 'Empresa.impuesto',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'País *',
            id: 'pais',
            name: 'pais',
            tamaño: 'w-full',
            vmodel: 'Empresa.pais',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Documento *',
            id: 'tipoDocumento',
            name: 'tipoDocumento',
            tamaño: 'w-full',
            vmodel: 'Empresa.tipoDocumento',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Operación *',
            id: 'tipoOperacion',
            name: 'tipoOperacion',
            tamaño: 'w-full',
            vmodel: 'Empresa.tipoOperacion',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo Entorno *',
            id: 'tipoEntorno',
            name: 'tipoEntorno',
            tamaño: 'w-full',
            vmodel: 'Empresa.tipoEntorno',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo Moneda *',
            id: 'tipoMoneda',
            name: 'tipoMoneda',
            tamaño: 'w-full',
            vmodel: 'Empresa.tipoMoneda',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Organización *',
            id: 'tipoOrganizacion',
            name: 'tipoOrganizacion',
            tamaño: 'w-full',
            vmodel: 'Empresa.tipoOrganizacion',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Municipio *',
            id: 'municipio',
            name: 'municipio',
            tamaño: 'w-full',
            vmodel: 'Empresa.municipio',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Responsabilidad *',
            id: 'tipoResponsabilidad',
            name: 'tipoResponsabilidad',
            tamaño: 'w-full',
            vmodel: 'Empresa.tipoResponsabilidad',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            placeholder: 'Tipo de Régimen *',
            id: 'tipoRegimen',
            name: 'tipoRegimen',
            tamaño: 'w-full',
            vmodel: 'Empresa.tipoRegimen',
            upperCase: true
        })
        .build()
}