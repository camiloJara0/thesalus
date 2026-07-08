<script setup>
import { computed, onMounted, ref, h } from 'vue'
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue'
import { validarYEnviarKardex } from '~/Core/Pacientes/POSTKardex.js';

const historias = ref([])
let copiaKardex = [];
const filasCambiadas = ref(new Set())
const actualizarCambios = ref(false)
const apiRest = useApiRest()

const {
  options,
  mensaje,
  alertRespuestaInput
} = useNotificacionesStore();

onMounted(async () => {
  const kardex = await apiRest.getData('', 'traeKardex')
  historias.value = kardex.map(k => {
    return { ...k, id: k.paciente_id }
  })
  copiaKardex = historias.value
});

function actualizarFila(id) {
  actualizarCambios.value = true
  filasCambiadas.value.add(id)
}

function filaFueCambiada(id) {
  return filasCambiadas.value.has(id)
}

async function guardarCambios() {
  const datosActualizados = historias.value.filter(dato =>
    filasCambiadas.value.has(dato.id)
  )
  console.log(datosActualizados)
  for (const fila of datosActualizados) {
    await guardar(fila)
  }

  filasCambiadas.value.clear()
  actualizarCambios.value = false
}

const columns = [
  // Fijas
  { accessorKey: "No_document", header: "Documento", ordenar: true, pinned: true, size: 120, meta: { class: "sticky-col col-1" } },
  { accessorKey: "name", header: "Nombre", ordenar: true, pinned: true, size: 200, meta: { class: "sticky-col col-2" } },
  { accessorKey: "Eps", header: "EPS", ordenar: true, pinned: true, size: 230, meta: { class: "sticky-col col-3" } },

  // Inputs simples
  { accessorKey: "type_doc", header: "Tipo Doc", },
  { accessorKey: "celular", header: "Tel", },
  { accessorKey: "direccion", header: "Dirección", },
  { accessorKey: "barrio", header: "Barrio", },
  { accessorKey: "nacimiento", header: "Fecha Nto", },
  { accessorKey: "municipio", header: "Municipio Atención", },
  { accessorKey: "regimen", header: "Regimen", },
  { accessorKey: "diagnostico", header: "Diagnóstico", },
  // Selects
  {
    accessorKey: "kit_cateterismo",
    header: "Kit Cateterismo",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.kit_cateterismo,
      "onUpdate:modelValue": (val) => {
        row.original.kit_cateterismo = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "SI", value: 1 },
        { label: "NO", value: 0 }
      ]
    })
  },
  {
    accessorKey: "rango",
    header: "C/ cuanto",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.rango,
      "onUpdate:modelValue": (val) => {
        row.original.rango = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "Cada 4 horas", value: "Cada 4 horas" },
        { label: "Cada 6 horas", value: "Cada 6 horas" },
        { label: "Cada 8 horas", value: "Cada 8 horas" },
        { label: "Cada 12 horas", value: "Cada 12 horas" },
        { label: "No requiere", value: "No requiere" }
      ]
    })
  },
  {
    accessorKey: "kit_cambioSonda",
    header: "Cambio de sonda",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.kit_cambioSonda,
      "onUpdate:modelValue": (val) => {
        row.original.kit_cambioSonda = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "SI", value: 1 },
        { label: "NO", value: 0 }
      ]
    })
  },
  {
    accessorKey: "kit_gastro",
    header: "Kit gastro",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.kit_gastro,
      "onUpdate:modelValue": (val) => {
        row.original.kit_gastro = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "SI", value: 1 },
        { label: "NO", value: 0 }
      ]
    })
  },
  {
    accessorKey: "traqueo",
    header: "Traqueo",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.traqueo,
      "onUpdate:modelValue": (val) => {
        row.original.traqueo = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "SI", value: 1 },
        { label: "NO", value: 0 }
      ]
    })
  },
  {
    accessorKey: "equipos_biomedicos",
    header: "Equipos Biomedicos",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.equipos_biomedicos,
      "onUpdate:modelValue": (val) => {
        row.original.equipos_biomedicos = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "SI", value: 1 },
        { label: "NO", value: 0 }
      ]
    })
  },
  {
    accessorKey: "oxigeno",
    header: "Oxigeno",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.oxigeno,
      "onUpdate:modelValue": (val) => {
        row.original.oxigeno = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "SI", value: 1 },
        { label: "NO", value: 0 }
      ]
    })
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.estado,
      "onUpdate:modelValue": (val) => {
        row.original.estado = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "ACTIVO", value: "ACTIVO" },
        { label: "FALLECIDO", value: "FALLECIDO" },
        { label: "CAMBIO DE PRESTADOR", value: "CAMBIO DE PRESTADOR" },
        { label: "RETIRADO", value: "RETIRADO" },
        { label: "EGRESO", value: "EGRESO" },
        { label: "SUSPENDIDO", value: "SUSPENDIDO" },
        { label: "CANCELADO", value: "CANCELADO" }
      ]
    })
  },
  {
    accessorKey: "vm",
    header: "VM",
    cell: ({ row }) => h(USelect, {
      modelValue: row.original.vm,
      "onUpdate:modelValue": (val) => {
        row.original.vm = val
        actualizarFila(row.original.id)
      },
      variant: "ghost",
      items: [
        { label: "SI", value: 1 },
        { label: "NO", value: 0 }
      ]
    })
  },
  // Inputs
  {
    accessorKey: "fecha_ultima_visita",
    header: "Fecha última visita médica",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.fecha_ultima_visita = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapia_respiratoria",
    header: "TR",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapia_respiratoria = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapeuta_respiratoria",
    header: "Terapeuta Respiratoria",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapeuta_respiratoria = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapia_fisica",
    header: "TF",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapia_fisica = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapeuta_fisica",
    header: "Terapeuta Físico",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapeuta_fisica = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapia_fonoaudiologia",
    header: "TFO",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapia_fonoaudiologia = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapeuta_fonoaudiologia",
    header: "Terapeuta Fonoaudiología",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapeuta_fonoaudiologia = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapia_ocupacional",
    header: "TO",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapia_ocupacional = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "terapeuta_ocupacional",
    header: "Terapeuta Ocupacional",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.terapeuta_ocupacional = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "TEO_cantidad",
    header: "TEO Cantidad",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.TEO_cantidad = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "profesional_nutricionista",
    header: "Nutricionista",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.profesional_nutricionista = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "nutricionista",
    header: "Control Nutrición",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.nutricionista = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "VPSico",
    header: "VPSico",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.VPSico = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "psicologia",
    header: "Control Psicología",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.psicologia = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "trabajo_social",
    header: "T social",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.trabajo_social = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },
  {
    accessorKey: "profesional_trabajo_social",
    header: "Control T social",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.profesional_trabajo_social = val
          actualizarFila(row.original.id)
        },
        variant: "ghost"
      })
  },

  // Inputs

  {
    accessorKey: "ultimoCambio", header: "Último cambio de sonda",
    cell: ({ row, getValue }) =>
      h(UInput, {
        modelValue: getValue(),
        "onUpdate:modelValue": (val) => {
          row.original.ultimoCambio = val
          actualizarFila(row.original.id)
        },
        variant: "ghost",
        type: "date"
      }),
  },

]

async function guardar(fila) {
  const filaAfectada = copiaKardex.find(k => k.id_paciente === fila.id_paciente)
  const cambioSonda = filaAfectada.ultimoCambio !== fila.ultimoCambio
  if (fila.ultimoCambio && cambioSonda) {
    options.icono = 'warning'
    options.titulo = 'Agrega detalles del cambio de sonda'
    options.html = `<div class="flex flex-col items-start">`
    options.input = 'text'
    options.inputAtributes = { placeholder: 'Observaciones de cambio de sonda' }
    options.confirmtext = 'Si, Guardar'
    options.canceltext = 'Atras'

    const respuesta = await alertRespuestaInput()

    if (respuesta.estado !== 'confirmado') return

    if (!respuesta.valor) {
      options.position = 'top-end'
      options.texto = 'Ingrese una observación de cambio de sonda.'
      options.background = '#d33'
      options.tiempo = 1500
      mensaje()
      return
    }

    fila.observacion = respuesta.valor
  }
  try {
    await validarYEnviarKardex(fila);
    options.tipo = 'success',
    options.background = '#22c55e',
    options.texto = 'Kardex actualizado correctamente',
    options.tiempo = 3000,
    options.position = 'top-right',
    mensaje()
  } catch (error) {
    options.tipo = 'error',
    options.background = '#d33',
    options.texto = 'No se pudo actualizar Kardex',
    options.tiempo = 3000,
    options.position = 'top-right',
    mensaje()
  }
}

const columnPinning = ref({
  left: ['No_document'],
})
</script>
<template>
  <UCard :ui="{ body: { padding: 'p-6' }, header: { padding: 'p-6' } }" class="bg-white dark:bg-gray-800">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-lg bg-linear-to-br from-amber-100 to-amber-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
            <i class="fa-solid fa-file-medical text-amber-600 dark:text-amber-400 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">Kardex Médico</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ historias.value?.length }} registros</p>
          </div>
        </div>
        <UButton icon="i-lucide-download" color="amber" variant="ghost" @click="$emit('descargar')">
          Descargar
        </UButton>
      </div>
    </template>

    <!-- Timeline de Historias -->
    <div v-if="historias.length > 0" class="space-y-4">
      <!-- <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt> -->
      <UTable :columns="columns" :data="historias" v-model:column-pinning="columnPinning"
        :row-class="(row) => filaFueCambiada(row.id) ? 'bg-yellow-100' : ''"></UTable>
    </div>

    <Transition name="slide-up">
      <div v-if="actualizarCambios"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-xl shadow-xl bg-yellow-400">
        <span class="text-sm font-medium">
          Tienes cambios sin guardar
        </span>
        <ButtonRounded @click="guardarCambios">
          <i class="fa-solid fa-floppy-disk"></i>
        </ButtonRounded>
      </div>
    </Transition>
    <!-- Empty State -->
    <div v-if="historias.length < 1" class="text-center py-12">
      <i class="fa-solid fa-clipboard text-5xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 dark:text-gray-400 mb-2 font-medium">Kardex</p>
      <p class="text-sm text-gray-400 dark:text-gray-500">Pacientes sin registros médicos aún</p>
    </div>
  </UCard>
</template>
