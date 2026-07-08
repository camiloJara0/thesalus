<script setup>

const varView = useVarView()

</script>

<template>
  <div class="cargando">
    <div class="card">
      <!-- Encabezado -->
      <div class="header">
        <h2 class="titulo">{{ varView.loader.titulo }}</h2>
      </div>

      <!-- Contenido -->
      <div class="contenido">
        <p class="mensaje">Procesando tu solicitud...</p>
        <div class="barra">
          <div class="progreso" :style="{ width: varView.loader.progreso + '%' }"></div>
        </div>
        <span class="porcentaje">{{ varView.loader.progreso }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cargando {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* Tarjeta estilo SweetAlert */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  width: 320px;
  padding: 20px;
  text-align: center;
  animation: aparecer 0.4s ease-out;
}

.header {
  margin-bottom: 12px;
}

.titulo {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1e40af;
}

.contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mensaje {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 12px;
  animation: aparecerTexto 2s infinite alternate;
}

.barra {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progreso {
  height: 100%;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  transition: width 0.4s ease-out;
}

.porcentaje {
  font-size: 0.85rem;
  font-weight: bold;
  color: #2563eb;
}

/* Animaciones */
@keyframes aparecer {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes aparecerTexto {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}
</style>

