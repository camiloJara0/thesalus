<script setup lang="ts">
// Props compatibles con NuxtUI 3.3.7
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  id: String,
  name: String,
  required: Boolean,
  disabled: Boolean,
  color: {
    type: String,
    default: 'primary'
  },
  variant: {
    type: String,
    default: 'outline'
  },
  size: {
    type: String,
    default: 'md'
  },
  Propiedades: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'change']);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let drawing = false;

const resizeCanvas = () => {
    if (!canvasRef.value) return;

    // Guardar lo dibujado antes de cambiar tamaño
    const oldData = ctx?.getImageData(
      0,
      0,
      canvasRef.value.width,
      canvasRef.value.height
    );

    const rect = canvasRef.value.getBoundingClientRect();
    const oldWidth = canvasRef.value.width;
    const oldHeight = canvasRef.value.height;

    // Ajustar tamaño interno al tamaño visual
    canvasRef.value.width = rect.width;
    canvasRef.value.height = rect.height;

    ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';

      // Si había dibujo previo, reescalarlo
      if (oldData) {
        // Crear un canvas temporal con el contenido viejo
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = oldWidth;
        tempCanvas.height = oldHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx?.putImageData(oldData, 0, 0);

        // Dibujar la imagen vieja escalada al nuevo tamaño
        ctx.drawImage(tempCanvas, 0, 0, oldWidth, oldHeight, 0, 0, rect.width, rect.height);
      }
    }
  };

onMounted(() => {
  // Inicializar
  resizeCanvas();

  // Escuchar cambios de tamaño
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
});


const startDrawing = (event: MouseEvent | TouchEvent) => {
  drawing = true;
  ctx?.beginPath();
  const { x, y } = getCoordinates(event);
  ctx?.moveTo(x, y);
};

const draw = (event: MouseEvent | TouchEvent) => {
  if (!drawing || !ctx) return;
  const { x, y } = getCoordinates(event);
  ctx.lineTo(x, y);
  ctx.stroke();
};

const stopDrawing = () => {
  drawing = false;
  if (canvasRef.value) {
    if (!isCanvasBlank(canvasRef.value)) {
      const dataUrl = canvasRef.value.toDataURL('image/png');
      emit('update:modelValue', dataUrl);
      emit('change', dataUrl);
    } else {
      // Si está vacío, emitimos cadena vacía
      emit('update:modelValue', '');
      emit('change', '');
    }
  }
};

const clearCanvas = () => {
  if (canvasRef.value && ctx) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    emit('update:modelValue', '');
  }
};

const getCoordinates = (event: MouseEvent | TouchEvent) => {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  if (event instanceof MouseEvent) {
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  } else {
    const touch = event.touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
};

function isCanvasBlank(canvas: HTMLCanvasElement) {
  const blank = document.createElement('canvas');
  blank.width = canvas.width;
  blank.height = canvas.height;
  return canvas.toDataURL() === blank.toDataURL();
}

</script>

<template>
  <div class="w-full" :class="Propiedades.tamaño">
    <UFormField
      v-if="Propiedades.label || Propiedades.name"
      :label="Propiedades.label"
      :name="Propiedades.name"
    >
      <div
        class="border border-gray-300 dark:border-gray-700 rounded-md p-2 flex flex-col gap-2"
        :class="[`u-${variant}`, `u-${color}`, `u-${size}`]"
      >
        <canvas
          ref="canvasRef"
          width="400"
          height="200"
          class="border border-gray-300 dark:border-gray-700 rounded-md cursor-crosshair"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="startDrawing"
          @touchmove.prevent="draw"
          @touchend.prevent="stopDrawing"
        ></canvas>

        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="solid"
            size="sm"
            @click="clearCanvas"
          >
            Limpiar
          </UButton>
        </div>
      </div>
    </UFormField>
  </div>
</template>