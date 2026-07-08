export class ComponenteBuilder {
  constructor() {
    this.propiedades = {
      fondo: '', // Aplica componente fondo ej. "FondoDefault"
      estilos: '', // CSS
      layout: '',
      header: {
        titulo: '',
        descripcion: '',
        button: [],
      },
      contenedor: '',
      componentes: [], // Lista de componentes ej. (Tabla, Form)
    }
  }

  setFondo(fondo = 'FondoDefault') {
    this.propiedades.fondo = fondo
    return this
  }

  setEstilos(estilos) {
    this.propiedades.estilos = estilos
    return this
  }

  setLayout(layout) {
    this.propiedades.layout = layout
    return this
  }

  setHeaderPage(header) {
    this.propiedades.header = header
    return this
  }

  setContenedor(contenedor) {
    this.propiedades.contenedor = contenedor
    return this
  }

  addComponente(tipo, input) {
    let componente;

    // Si el input tiene un método build, asumimos que es un builder
    if (input && typeof input.build === 'function') {
      componente = input.build();
    } else if (input && typeof input === 'object') {
      // Si ya es un objeto, lo usamos directamente
      componente = input;
    } else {
      throw new Error('El componente debe ser un objeto o tener un método build()');
    }

    componente.tipo = tipo;
    this.propiedades.componentes.push(componente);
    return this;

  }

  build() {
    return this.propiedades
  }


}