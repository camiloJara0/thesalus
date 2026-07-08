<template>
  <div class="relative inline-flex">
    <button
      type="button"
      :class="[color, 'transition-all duration-300 cursor-pointer active:scale-95 w-7.5 h-7.5 flex justify-center items-center text-white rounded-full hover:opacity-75',
        {'opacity-30': props.disabled}
      ]"
      ref="buttonRef"
      @mouseenter="show()"
      @mouseleave="hide()"
      @focus="show()"
      @blur="hide()"
    >
      <slot />
    </button>

    <!-- Teleport al body -->
    <teleport to="body">
      <div
        v-if="tooltip && isVisible"
        class="fixed z-9999 px-2 py-1 text-xs text-white font-semibold bg-(--color-default-600) rounded-lg shadow-lg whitespace-nowrap sm:flex hidden"
        :style="tooltipStyle"
        role="tooltip"
      >
        {{ tooltip }}
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  tooltip: String,
  tooltipPosition: {
    type: String,
    default: 'top' // 'top' | 'bottom' | 'left' | 'right'
  },
  color: {
    type: String,
    default: 'bg-blue-500'
  },
  offset: {
    type: Number,
    default: 8
  },
  activo: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const varView = useVarView()
const buttonRef = ref(null)
const isVisible = ref(false)
const tooltipStyle = reactive({
  top: '0px',
  left: '0px',
  transform: 'none'
})

function updateTooltipPosition() {
  const el = buttonRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()

  // Posicionamiento base
  if (props.tooltipPosition === 'top') {
    tooltipStyle.top = `${rect.top - props.offset}px`
    tooltipStyle.left = `${rect.left + rect.width / 2}px`
    tooltipStyle.transform = 'translate(-50%, -100%)'
  } else if (props.tooltipPosition === 'bottom') {
    tooltipStyle.top = `${rect.bottom + props.offset}px`
    tooltipStyle.left = `${rect.left + rect.width / 2}px`
    tooltipStyle.transform = 'translate(-50%, 0)'
  } else if (props.tooltipPosition === 'left') {
    tooltipStyle.top = `${rect.top + rect.height / 2}px`
    tooltipStyle.left = `${rect.left - props.offset}px`
    tooltipStyle.transform = 'translate(-100%, -50%)'
  } else if (props.tooltipPosition === 'right') {
    tooltipStyle.top = `${rect.top + rect.height / 2}px`
    tooltipStyle.left = `${rect.right + props.offset}px`
    tooltipStyle.transform = 'translate(0, -50%)'
  }
}

function show() {
  isVisible.value = true
  updateTooltipPosition()
}

function hide() {
  isVisible.value = false
}

onMounted(() => {
  // Recalcular en cambios de viewport/scroll
  const handler = () => isVisible.value && updateTooltipPosition()
  window.addEventListener('resize', handler)
  window.addEventListener('scroll', handler, true)

  // Si activo está en true, mostrar tooltip al cargar
  if (props.activo && !varView.cargando) {
    buttonRef.value?.focus()
    show()
    setTimeout(() => {
      hide()
      buttonRef.value?.blur()
    }, 1500) // 1,5 segundos
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateTooltipPosition)
  window.removeEventListener('scroll', updateTooltipPosition, true)
})

// Si cambia la posición, recalcula
watch(() => props.tooltipPosition, () => {
  if (isVisible.value) updateTooltipPosition()
})
</script>