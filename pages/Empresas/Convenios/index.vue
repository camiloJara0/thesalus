<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { useConvenioStore } from '~/stores/Formularios/Convenios/Convenio';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { useConvenioBuilder } from '~/build/Convenios/useConvenioBuilder';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { useConvenioActions } from '~/composables/Usuarios/Convenio';

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const convenioStore = useConvenioStore();
const convenioList = ref([]);
const refresh = ref(1);

const show = ref(false);
const showVer = ref(false);

async function llamadatos() {
    convenioList.value = await convenioStore.listConvenios();
    varView.datosActualizados();
}

const {
    agregarConvenio,
    verConvenio,
    cerrar,
    eliminarConvenios
} = useConvenioActions({
    convenioStore,
    varView,
    notificaciones,
    show,
    showVer,
    llamadatos
});

watch(() => show.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        llamadatos();
        refresh.value++;
    }
});

watch(() => showVer.value, async (estado) => {
    if (!estado && varView.cambioEnApi) {
        llamadatos();
        refresh.value++;
    }
});

onMounted(async () => {
    await llamadatos();
});

const builderTabla = new TablaBuilder();

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder();

    const puedeVer = varView.getPermisos.includes('Convenios_view');
    const puedeGet = varView.getPermisos.includes('Convenios_get');
    const puedePost = varView.getPermisos.includes('Convenios_post');
    const puedePut = varView.getPermisos.includes('Convenios_put');

    if (!puedeVer && !puedePost && !puedePut && !puedeGet) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
                .setCards([
                    {
                        header: {
                            html: `<div class="flex flex-col items-center justify-center h-full text-gray-500">
                            <i class="fa-solid fa-user-lock text-6xl mb-4"></i>
                            <h2 class="text-lg font-semibold">Acceso restringido</h2>
                            <p class="text-sm text-center">No tienes permisos para acceder a este módulo.</p>
                            </div>`,
                        },
                    },
                    {},
                    {}
                ])
                .setcontenedorCards('flex flex-col')
                .setContenedor('w-full')
                .setTamaño('flex sm:flex-row justify-center items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Gestión de Convenios')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            );
        return pagina.build();
    }

    const propiedadesVerConvenio = puedePut
        ? useConvenioBuilder({
            storeId: 'ConvenioNuevo',
            storePinia: 'Convenio',
            cerrarModal: cerrar,
            show: showVer,
            tipoFormulario: 'Wizard',
            verUser: true,
            eliminar: eliminarConvenios,
            soloVer: varView.soloVer,
        })
        : null;

    const propiedadesConvenio = puedePost
        ? useConvenioBuilder({
            storeId: 'ConvenioNuevo',
            storePinia: 'Convenio',
            cerrarModal: cerrar,
            show: show,
            tipoFormulario: 'Wizard',
            eliminar: eliminarConvenios,
        })
        : null;

    builderTabla
        .setColumnas([
            { titulo: 'nombre', value: 'Nombre del Convenio', ordenar: true, tamaño: 300 },
            { titulo: 'estado', value: 'Estado', tamaño: 100 },
            { titulo: 'logo', value: 'Logo', tamaño: 150 }
        ])
        .setHeaderTabla({
            titulo: 'Gestión de Convenios',
            descripcion: 'Administra los convenios y aseguradoras',
            color: 'bg-[var(--color-default)] text-white',
            accionAgregar: puedePost ? agregarConvenio : null,
            buscador: true,
            excel: true,
            filtros: [
                { columna: 'estado', placeholder: 'Estado' }
            ]
        })
        .setDatos(convenioList);

    const acciones = [];
    if (puedePut) {
        acciones.push({ icon: "ver", action: verConvenio });
    }

    if (acciones.length > 0) {
        builderTabla.setAcciones({ icons: acciones, botones: true });
    }

    pagina
        .setFondo('FondoDefault')
        .setLayout('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTabla);

    if (propiedadesConvenio) pagina.addComponente('Form', propiedadesConvenio);
    if (propiedadesVerConvenio) pagina.addComponente('Form', propiedadesVerConvenio);

    return pagina.build();
});
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>
