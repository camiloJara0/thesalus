// Clase base para construir formularios completos
export class CalendarioBuilder {
  constructor() {
    this.propiedades = {
        citas: [], // Lista de Citas
        estilos: '', // CSS Componente
    }
  }

  setCitas(citas) {
    this.propiedades.citas = citas
    return this
  }

  setEstilos(estilos) {
    this.propiedades.estilos = estilos
    return this
  }

  build() {
    return this.propiedades
  }
}

export class CitasBuilder {
  constructor() {
    this.propiedades = {
        citas: [], // Lista de citas
        tamaño: '', // CSS cita
        estilos: '', // CSS contenedor
        showTodas: false, // Mostrar Todas las Citas
        filtros: [] // Filtros por valor
    }
  }

  setCitas(citas) {
    this.propiedades.citas = citas
    return this
  }

  setTamaño(tamaño) {
    this.propiedades.tamaño = tamaño
    return this
  }

  setEstilos(estilos) {
    this.propiedades.estilos = estilos
    return this
  }

  setShowTodas(boolean) {
    this.propiedades.showTodas = boolean
    return this
  }

  setFiltros(filtros) {
    this.propiedades.filtros = filtros
    return this
  }

  build() {
    return this.propiedades
  }
}