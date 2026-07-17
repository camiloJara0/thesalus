import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useKardexFormBuilder({
    plantilla,
    campos,
    valoresActuales = {},
    pacienteId,
    onGuardar,
    onCerrar
}) {
    const builder = new FormularioBuilder()

    builder
        .setStoreId('GuardarKardex')
        .setStorePinia('Kardex')
        .setFormulariotamaño('MD')
        .setFormularioShow(true)
        .setFormularioTipo('Form')
        .setFormularioTituloFormulario(plantilla?.nombre || 'Kardex')
        .setFormularioContenedorCampos('flex flex-col')
        .setBotones([
            { text: 'Guardar', color: 'primary', type: 'enviar' },
            { text: 'Cancelar', color: 'neutral', type: 'cerrar', accion: onCerrar },
        ])

    builder.nuevaSeccion(plantilla?.nombre || 'Kardex')

    if (campos && campos.length > 0) {
        campos.forEach(campo => {
            builder.addCampo({
                component: 'DynamicField',
                campo: campo,
                placeholder: campo.placeholder || campo.nombre,
                tamaño: campo.tipo === 'textarea' ? 'w-full md:col-span-2' : 'w-full',
                vmodel: `Kardex.valores.${campo.slug}`,
                value: valoresActuales[campo.slug] || '',
                required: campo.requerido,
            })
        })
    } else {
        builder.addCampo({
            component: 'Label',
            text: '<p>No hay campos configurados para esta plantilla</p>',
            tamaño: 'w-full',
            icon: 'i-lucide-alert-circle',
        })
    }

    return builder.build()
}
