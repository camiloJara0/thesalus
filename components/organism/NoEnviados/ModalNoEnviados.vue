<script setup>
import { computed, onMounted, watch } from 'vue';
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';

const noEnviadosStore = useNoEnviados();
const { show, showImportar, totalDocumentosNoEnviados, documentos, importacion } = storeToRefs(noEnviadosStore)

const {
    sincronizarSeccion,
    descargarNoEnviados,
    importarNoEnviados
} = noEnviadosStore

watch(show, async (open) => {
    if (open) {
        await noEnviadosStore.cargarDocumentosNoEnviados();
    }
});

onMounted(async () => {
    await noEnviadosStore.cargarDocumentosNoEnviados();
});

async function recargar() {
    await noEnviadosStore.cargarDocumentosNoEnviados();
}

function obtenerTitulo(documento) {
    return documento?.info_usuario?.name || documento?.name || documento?.nombre || documento?.fecha_historia || documento?.id || 'Registro pendiente';
}

function obtenerDetalle(documento) {
    const detalles = [];

    if (documento?.info_usuario?.No_document) {
        detalles.push(`Doc. ${documento.info_usuario.No_document}`);
    }

    if (documento?.info_usuario?.celular) {
        detalles.push(documento.info_usuario.celular);
    }

    if (documento?.fecha_historia) {
        detalles.push(documento.fecha_historia);
    }

    if (documento?.codigo) {
        detalles.push(`Código: ${documento.codigo}`);
    }

    return detalles.join(' • ') || 'Registro pendiente de sincronización';
}
</script>

<template>
    <UButton icon="i-lucide-bell" color="white" variant="link" size="xs" class="text-gray-100 text-xs relative hover:text-white cursor-pointer"
        @click="show = true">
        Notificaciones
        <span v-if="totalDocumentosNoEnviados > 0"
            class="rounded-full bg-red-600 text-[8px] w-4 h-4 absolute top-0 left-0 flex justify-center items-center font-semibold text-gray-100">
            {{ totalDocumentosNoEnviados }}
        </span>
    </UButton>

    <FondoBlur v-if="show">
        <UModal v-model:open="show" :ui="{ width: 'max-w-3xl' }" prevent-close :overlay="false" :transition="true">
            <template #header>
                <div class="w-full flex flex-wrap items-center justify-between gap-3">
                    <div>

                        <h3 class="text-xl font-semibold text-gray-900">
                            Datos no enviados
                        </h3>
                        <p class="text-sm text-gray-500">
                            Revisa y sincroniza registros guardados offline.
                        </p>
                    </div>
                    <div class="flex gap-1">
                        <UButton icon="i-lucide-x" color="neutral" variant="soft" @click="show = false">
                        </UButton>
                    </div>
                </div>
            </template>
            <template #body>
                <UCard>
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center gap-2 text-amber-600">
                            <UIcon name="i-lucide-cloud-off" class="lg"></UIcon>
                            <p class="text-sm font-semibold">Pendientes de envío <span>{{ totalDocumentosNoEnviados }}</span></p>
                        </div>
                        <div class="flex gap-2">
                            <UButton v-if="totalDocumentosNoEnviados > 0" size="sm" color="primary" variant="soft" icon="i-lucide-download"
                                @click="descargarNoEnviados()">
                                Descargar
                            </UButton>
                            <UModal size="lg" v-model:open="showImportar" :overlay="true" close>
                                <UButton label="open" icon="i-lucide-upload" color="neutral" variant="outline"
                                    size="sm">
                                    Importar
                                </UButton>
                                <template #content>
                                    <div class="p-6 space-y-4">
                                        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <i class="i-lucide-folder-down text-primary"></i>
                                            Subir archivos
                                        </h2>

                                        <p class="text-sm text-gray-500">
                                            Selecciona los archivos que deseas importar.
                                        </p>

                                        <!-- UFileUpload dentro del modal -->
                                        <UFileUpload v-model="importacion"
                                            :onChange="importarNoEnviados"
                                            class="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition" />

                                        <!-- Botones de acción -->
                                        <div class="flex justify-end gap-3 mt-4">
                                            <UButton color="neutral" variant="outline" @click="showImportar = false">
                                                Cancelar
                                            </UButton>
                                            <UButton icon="i-lucide-cloud-download" color="primary" variant="solid"
                                                @click="importarNoEnviados" loading-auto>
                                                Sincronizar
                                            </UButton>
                                        </div>
                                    </div>
                                </template>
                            </UModal>
                            <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" @click="recargar">
                                Actualizar
                            </UButton>
                        </div>
                    </div>
                    <div v-if="noEnviadosStore.cargando" class="flex flex-col items-center justify-center gap-3 py-10">
                        <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent">
                        </div>
                        <p class="text-sm text-gray-500">Consultando registros pendientes...</p>
                    </div>

                    <div v-else-if="!documentos.length || totalDocumentosNoEnviados === 0"
                        class="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <div class="rounded-full bg-emerald-50 p-4 text-emerald-600">
                            <i class="i-lucide-circle-check text-2xl"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-gray-900">Todo está al día</h4>
                            <p class="text-sm text-gray-500">No hay documentos pendientes por enviar en este momento.
                            </p>
                        </div>
                    </div>

                    <div v-else class="space-y-4">
                        <div class="grid gap-3 md:grid-cols-3">
                            <div v-for="seccion in documentos" :key="seccion.key"
                                class="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <p class="text-sm font-semibold text-gray-800">{{ seccion.label }}</p>
                                        <p class="text-xs text-gray-500">{{ seccion.data.length }} registro{{
                                            seccion.data.length === 1 ? ''
                                                : 's' }}</p>
                                    </div>
                                    <UBadge color="warning" size="sm">{{ seccion.data.length }}</UBadge>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <UCard v-for="seccion in documentos" :key="seccion.key" class="border border-gray-200"
                                :ui="{ body: { padding: 'p-4' } }">
                                <div class="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p class="font-semibold text-gray-800">{{ seccion.label }}</p>
                                        <p class="text-xs text-gray-500">Registros pendientes de sincronización</p>
                                    </div>
                                    <div class="flex gap-1">
                                        <UButton size="sm" color="primary" variant="soft" icon="i-lucide-cloud-download"
                                            @click="sincronizarSeccion(seccion.key)">
                                            Sincronizar
                                        </UButton>
                                    </div>
                                </div>

                                <ul class="mt-3 space-y-2">
                                    <li v-for="documento in seccion.data"
                                        :key="documento.id || `${seccion.key}-${documento.id_historia || documento.No_document || documento.name}`"
                                        class="rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2">
                                        <div class="flex items-center justify-between gap-3">
                                            <div>
                                                <p class="text-sm font-medium text-gray-800">{{ obtenerTitulo(documento)
                                                }}
                                                </p>
                                                <p class="text-xs text-gray-500">{{ obtenerDetalle(documento) }}</p>
                                            </div>
                                            <UBadge color="warning" variant="subtle">Pendiente</UBadge>
                                        </div>
                                    </li>
                                </ul>
                            </UCard>
                        </div>
                    </div>

                </UCard>
            </template>
            <!-- <template #footer>
            <div class="flex justify-end">
                <UButton color="neutral" variant="outline" @click="show = false">
                    Cerrar
                </UButton>
            </div>
        </template> -->
        </UModal>
    </FondoBlur>
</template>
