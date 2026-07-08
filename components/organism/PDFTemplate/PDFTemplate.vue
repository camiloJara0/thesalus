<script setup>
import Titulo from '~/components/atoms/html/Titulo.vue'
import Texto from '~/components/atoms/html/Texto.vue'
import Tabla from '~/components/atoms/html/Tabla.vue'
import Firma from '~/components/atoms/html/Firma.vue'
import Espacio from '~/components/atoms/html/Espacio.vue'
import Imagen from '~/components/atoms/Images/Imagen.vue'
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue'
import PDF from '~/components/organism/PDFTemplate/PDF.vue'

import { PdfBuilder } from '~/build/Constructores/PDFBuilder'
import { cargarStore } from '../Forms/componentLoader'

const varView = useVarView()
const imprimir = ref(false)
const props = defineProps({
    Propiedades: {
        type: [Object],
        required: true
    }

});

const tablaStore = await cargarStore(props.Propiedades.storePinia) || {}
const showDropdown = ref(false);
const config = ref({
    format: "a4",
    orientation: "p", // p = portrait, l = landscape
    margin: 10,
    background: true,
});

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const cerrarDropdown = () => {
    showDropdown.value = false;
};

const componentes = {
    Titulo,
    Texto,
    Tabla,
    Espacio,
    Firma,
    Imagen
}

function getValue(obj, path) {
    console.log(obj, path)
    if (!path) return undefined
    return path.split('.').reduce((acc, key) => acc[key], obj)
}

// const exportPdf = async () => {
//     const pdfBuilder = new PdfBuilder()
//         .setElementId(props.Propiedades.elementId)
//         .setFileName(props.Propiedades.filename)
//         .setFormat(config.value.format)
//         .setOrientation(config.value.orientation)
//         .setMargins(config.value.margin)
//         .setSello(props.Propiedades.sello)

//     await pdfBuilder.export()


//     cerrarDropdown()
//     props.Propiedades.isActive.value = false
// }
const exportPdf = async () => {
    varView.propiedadesPDF = props.Propiedades
    imprimir.value = true
    window.onafterprint = () => {
        imprimir.value = false;   // cerrar impresión
        cerrarDropdown()
        cerrar()
    };

}

const cerrar = () => {
    props.Propiedades.isActive.value = false
    varView.showPDFEvolucion = false
    varView.showPDFNota = false
    varView.showPDFTerapia = false
    varView.showPDFMedicina = false
    varView.showPDFTrabajoSocial = false
    varView.showPDFMedicamentos = false
}

// const elementoId = document.getElementById(props.Propiedades.elementId)
// watch(() => elementoId, (newValue) => {
//     if(unref(props.Propiedades.isActive) && newValue){
//         exportPdf()
//     }
// })
</script>

<template>
    <PDF v-if="imprimir"></PDF>
    <FondoBlur v-if="unref(props.Propiedades.isActive) && !imprimir">
        <div class="bg-gray-50  rounded-2xl shadow-lg pb-7 md:w-[75%] md:h-[85%] w-[98%] h-[80%]">
            <div
                class="w-full flex justify-between items-center gap-2 py-4 md:px-8 px-2 bg-[var(--color-default)] rounded-t-lg">
                <div>
                    <h2 class="text-white font-bold md:text-2xl text-xl">Vista previa del PDF</h2>
                    <p class="text-gray-200 text-xs">{{ props.Propiedades.filename }}</p>
                </div>
                <div class="flex h-full items-center justify-center text-xl text-gray-200">
                    <div class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer"
                        @click="exportPdf"><i class="fa-solid fa-print"></i>
                    </div>
                    <div @click="cerrar"
                        class="w-10 h-10 flex justify-center items-center rounded-xl hover:text-white hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
                        <i class="fa-solid fa-close hover:text-white"></i>
                    </div>
                </div>
            </div>
            <!-- Contenido HTML -->
            <div class="scrollForm bg-white w-full gap-[15px] max-h-[90%] overflow-y-auto border-b-lg">
                <div class="p-6 bg-white text-black shadow-md">

                    <component v-for="component in Propiedades.components" :is="componentes[component.tipo]"
                        :Propiedades="{
                            ...component,
                            disabled: true,
                            ...(component.vmodel ? { texto: component.texto + getValue(tablaStore?.Formulario, component.vmodel) } : {}),
                        }" />
                    <slot/>
                </div>
            </div>
        </div>
    </FondoBlur>
</template>

<style scoped>
.dropdownAjuste {
    opacity: 0;
    pointer-events: none;
    transform: translateX(0) translateY(-10%);
    transition: all 0.3s ease;
}

.drop:hover .dropdownAjuste {
    opacity: 1;
    pointer-events: all;
    transform: translateX(0) translateY(0);
}
</style>
