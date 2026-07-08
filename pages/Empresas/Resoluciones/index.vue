<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useDatosResolucionBuilder } from '~/build/Empresa/useDatosResolucionBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { useFacturacionStore } from '~/stores/Formularios/empresa/Facturacion';
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const storeFacturacion = useFacturacionStore();
const { listResoluciones } = storeToRefs(storeFacturacion);
const Resoluciones = ref([]);
const refresh = ref(1)

async function llamaDatos () {
    Resoluciones.value = await listResoluciones.value
    refresh.value++
}

onMounted(async() => {
    Resoluciones.value = await listResoluciones.value
});

// Formularios Configuracion Empresa
const propiedadesResolucion = useDatosResolucionBuilder({
    storeId: 'DatosFacturacion',
    storePinia: 'Resolucion',
})

// Construccion de pagina
const pagina = new ComponenteBuilder()
const builderTabla = new TablaBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setHeaderPage({titulo: 'Configuracion de Resolucion', descripcion: 'Registra y configura segun los datos de tu Empresa.'})
    .setEstilos('')
    .setLayout('')
    .setContenedor('w-full flex flex-col gap-5')
    .addComponente('Form', propiedadesResolucion)
    .addComponente('Tabla', builderTabla
        .setColumnas([
            { titulo: 'tipoDocumento', value: 'Tipo de documento', tamaño: 100, ordenar: true },
            { titulo: 'prefijo', value: 'Prefijo', tamaño: 100, ordenar: true },
            { titulo: 'no_resolucion', value: 'Resolucion', tamaño: 100 },
            { titulo: 'fechaInicial', value: 'Fecha Inicial', tamaño: 100 },
            { titulo: 'fechaHasta', value: 'Fecha Hasta', tamaño: 100 },
            { titulo: 'numeroInicial', value: 'Numero', tamaño: 100, ordenar: true },
            { titulo: 'numeroHasta', value: 'Hasta', tamaño: 100, ordenar: true }
        ])
        .setHeaderTabla({ titulo: 'Resoluciones Registradas', color: 'bg-[var(--color-default)] text-white', })
        .setDatos(Resoluciones)
    )
    .build()

// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh"/>
</template>