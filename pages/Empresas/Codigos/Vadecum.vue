<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { useVadecumStore } from '~/stores/Formularios/Codigos/Vadecum';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { useVadecumBuilder } from '~/build/Codigos/useVadecumBuilder';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { useVadecumActions } from '~/composables/Usuarios/Vadecum';

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const vadecumStore = useVadecumStore();
const vadecumList = ref([]);
const refresh = ref(1);

const show = ref(false);
const showVer = ref(false);

async function llamadatos() {
    vadecumList.value = await vadecumStore.listVadecum();
    varView.datosActualizados();
}

const {
    agregarVadecum,
    verVadecum,
    cerrar,
    eliminarVadecums
} = useVadecumActions({
    vadecumStore,
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

const builderTablaVademecum = new TablaBuilder();

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder();
    const puedeVer = varView.getPermisos.includes('Vadecum_view');
    const puedeGet = varView.getPermisos.includes('Vadecum_get');
    const puedePost = varView.getPermisos.includes('Vadecum_post');
    const puedePut = varView.getPermisos.includes('Vadecum_put');

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
                .setheaderTitle('Gestión de Códigos Vademécum')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            );
        return pagina.build();
    }

    const propiedadesVerVadecum = puedePut
        ? useVadecumBuilder({
            storeId: 'ModificarVadecum',
            storePinia: 'Vadecum',
            cerrarModal: cerrar,
            show: showVer,
            tipoFormulario: 'Wizard',
            verUser: true,
            eliminar: eliminarVadecums,
            soloVer: varView.soloVer,
        })
        : null;

    const propiedadesVadecum = puedePost
        ? useVadecumBuilder({
            storeId: 'NuevoVadecum',
            storePinia: 'Vadecum',
            cerrarModal: cerrar,
            show: show,
            tipoFormulario: 'Wizard',
        })
        : null;

    builderTabla
        .setColumnas([
            { titulo: 'expediente', value: 'Expediente', ordenar: true, tamaño: 120 },
            { titulo: 'producto', value: 'Producto', tamaño: 250 },
            { titulo: 'titular', value: 'Titular', tamaño: 200 },
            { titulo: 'registrosanitario', value: 'Registro Sanitario', tamaño: 150 },
            { titulo: 'estadoregistro', value: 'Estado', tamaño: 100 }
        ])
        .setHeaderTabla({
            titulo: 'Gestión de Códigos Vademécum',
            descripcion: 'Administra el listado de medicamentos, productos y servicios',
            color: 'bg-[var(--color-default)] text-white',
            accionAgregar: puedePost ? agregarVadecum : null,
            buscador: true,
            excel: true,
            filtros: [
                { columna: 'estado', placeholder: 'Estado' }
            ]
        })
        .setDatos(vadecumList);

    const accionesVademecum = [];
    if (puedePut) {
        accionesVademecum.push({ icon: "ver", action: verVadecum });
    }

    if (acciones.length > 0) {
        builderTablaVademecum.setAcciones({ icons: accionesVademecum, botones: true });
    }

    pagina
        .setFondo('FondoDefault')
        .setLayout('')
        .setContenedor('w-full')
        .addComponente('Tabla', builderTablaVademecum);

    if (propiedadesVadecum) pagina.addComponente('Form', propiedadesVadecum);
    if (propiedadesVerVadecum) pagina.addComponente('Form', propiedadesVerVadecum);

    return pagina.build();
});
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>
