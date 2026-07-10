<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useDatosEmpresaBuilder } from '~/build/Empresa/useDatosEmpresaBuilder';
import { useDatosSofwareBuilder } from '~/build/Empresa/useDatosSoftwareBuilder';
import { useDatosNominaBuilder } from '~/build/Empresa/useDatosNominaBuilder';
import { useDatosEquivalentesBuilder } from '~/build/Empresa/useDatosEquivalentesBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { useEmpresaStore } from '~/stores/Formularios/empresa/Empresa';
import Restringido from '~/components/organism/NoEnviados/Restringido.vue';

const varView = useVarView()
const puedeVer = varView.getPermisos.includes('Configuracion_view');
const puedeGet = varView.getPermisos.includes('Configuracion_get');
const puedePost = varView.getPermisos.includes('Configuracion_post');
const puedePut = varView.getPermisos.includes('Configuracion_put');
const puedeDelete = varView.getPermisos.includes('Configuracion_delete');
const empresaStore = useEmpresaStore()

onMounted(async() => {
    await empresaStore.indexDBDatos()
})

const propiedades = computed(() => {

    // Formularios Configuracion Empresa
    const propiedadesEmpresa = useDatosEmpresaBuilder({
        storeId: 'DatosEmpresa',
        storePinia: 'Empresa'
    })
    
    const propiedadesSoftware = useDatosSofwareBuilder({
        storeId: 'DatosSoftware',
        storePinia: 'Software'
    })
    
    const propiedadesNomina = useDatosNominaBuilder({
        storeId: 'DatosNomina',
        storePinia: 'Nomina'
    })
    
    const propiedadesEquivalente = useDatosEquivalentesBuilder({
        storeId: 'DatosEquivalentes',
        storePinia: 'DocumentosEquivalentes'
    })
    
    
    // Construccion de pagina
    const pagina = new ComponenteBuilder()
    
    pagina
        .setFondo('FondoDefault')
        .setHeaderPage({titulo: 'Configuracion de la Empresa', descripcion: 'Registra y configura segun los datos de tu Empresa.'})
        .setEstilos('')
        .setLayout('')
        .setContenedor('w-full flex flex-col gap-3')
        if (puedePost) pagina.addComponente('Form', propiedadesEmpresa)
        if (puedePost) pagina.addComponente('Form', propiedadesSoftware)
        if (puedePost) pagina.addComponente('Form', propiedadesNomina)
        if (puedePost) pagina.addComponente('Form', propiedadesEquivalente)
    
    return pagina.build()
})


</script>

<template>
    <Pagina v-if="puedeVer" :Propiedades="propiedades"/>
    <Restringido v-else />
</template>