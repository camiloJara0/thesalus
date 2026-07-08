<script setup>

// pendiente

import FondoBlur from '../atoms/Fondos/FondoBlur.vue';

import { onMounted } from 'vue';
import { useVarView } from "~/stores/varview.js";
import { decryptData } from '~/composables/Formulario/crypto';

const varView = useVarView();
const nombrePDF = ref('');
let blobGuardado = '';
// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    await exportarServicioPDF(varView.propiedadesPDF)
    varView.cargando = false
});

// PDF
async function exportarServicioPDF(data) {
    try {
        varView.cargando = true
        const config = useRuntimeConfig()
        const token = decryptData(localStorage.getItem('token'))
        const res = await fetch(`${config.public.api}/api/v1/${data.servicio}/${data.id}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });
        if (!res.ok) {
            throw new Error(`Error en la petición: ${res.status}`);
        }

        const blob = await res.blob();
        blobGuardado = blob
        const url = window.URL.createObjectURL(blob);

        // Leer el nombre desde el header
        const disposition = res.headers.get('Content-Disposition');
        let fileName = `${varView.propiedadesPDF.servicio}`;
        if (disposition) {
            const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/);
            if (match && match[1]) {
                fileName = decodeURIComponent(match[1]);
            }
        }

        nombrePDF.value = fileName

        // Opcion de abrimos el PDF en una nueva pestaña sin descargar
        document.getElementById('visorPDF').src = url;
        document.getElementById('visorPDF').onload = () => {
        document.getElementById('pdfLoader').style.display = 'none';
        };

        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        varView.cargando = false
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        varView.cargando = false
    }
}

async function descargarPDF() {
    if (!blobGuardado) return;
    const url = window.URL.createObjectURL(blobGuardado);

    const a = document.createElement("a");
    a.href = url;
    a.download = nombrePDF.value;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

const cerrarPDF = () => {
    varView.showSincronizar = false
}

</script>

<template>
    <FondoBlur>
            <div
                class="bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 md:w-[55%] md:h-[65%] w-[90%] h-[80%] transform transition-all duration-300 animate-fadeIn">
                <div class="py-6 h-full flex flex-col justify-between">
                    <h2 class="text-2xl font-bold text-center py-3 text-gray-800 dark:text-gray-100 tracking-wide">
                        Configuración de Exportación
                    </h2>
                    <div class="h-full pt-5 overflow-y-auto scrollForm px-10">

                    </div>

                    <div class="w-full flex justify-center items-center gap-4 px-4 mt-6">
                        <ButtonForm
                            color="bg-gray-500 hover:bg-gray-600 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="cerrar">
                            Cancelar
                        </ButtonForm>

                        <ButtonForm
                            color="bg-blue-600 hover:bg-blue-700 text-white font-semibold md:w-[200px] sm:w-[2/3] w-full shadow-md transition-all duration-300"
                            @click="validarform">
                            <download-excel v-if="varView.formComplete" :data="datosAExportar"
                                :name="excel.nombreArchivo" :type="excel.tipoArchivo" :fields="jsonfields"
                                :worksheet="excel.worksheet" :before-finish="cerrar" :before-generate="mostrar">
                                Generar
                            </download-excel>
                            <div v-if="!varView.formComplete">
                                Generar
                            </div>
                        </ButtonForm>
                    </div>

                </div>
            </div>
    </FondoBlur>
</template>