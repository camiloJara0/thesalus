// Clase base para construir formularios completos
export class FormularioBuilder {
  constructor() {
    this.propiedades = {
      formulario: {
        fondo: true,  // Fondo por defecto
        contenedorCampos: '', // class Contenedor de campos
        estilos: '', // class Modal
        botones: [], // Lista de botones que se mostrarán en el formulario
        tamañoForm: '', // "LG", "XS", "SM", "MD"
        tipo: 'Form', // "Wizard", "Form"
        tituloFormulario: '', // Titulo en formulario Wizard
        esquemas: [], // Esquemas con campos agrupados
        secciones: [], // Secciones o páginas del formulario
        show: false, // Visibilidad del formulario
        soloVer: false, // Campos disabled (no se pueden editar)
        editarFormulario: false, // Campos editables (disabled cambiable)
        eliminar: null, // Funcion de eliminar
        footer: null, // Configuración del footer con botones
      },
      content: {
        storeId: '', // Identificador de la acción en el módulo accionesFormulario
        storePinia: '', // Nombre del store de pinia asociado
        camposRequeridos: '', // Lista de campos requeridos
      },
      seccionActual: null
    }
  }

  setStoreId(id) {
    this.propiedades.content.storeId = id
    return this
  }

  setStorePinia(pinia) {
    this.propiedades.content.storePinia = pinia
    return this
  }

  setSoloVer(estado) {
    this.propiedades.formulario.soloVer = estado
    return this
  }

  // Alias para setSoloVer
  setFormularioSoloVer(estado) {
    return this.setSoloVer(estado)
  }

  setEditarFormulario(boolean) {
    this.propiedades.formulario.editarFormulario = boolean
    return this
  }

  setEliminarFormulario(f) {
    this.propiedades.formulario.eliminar = f
    return this
  }

  setCamposRequeridos(campos) {
    this.propiedades.content.camposRequeridos = campos
    return this
  }

  setFormularioFondo(fondo) {
    this.propiedades.formulario.fondo = fondo
    return this
  }

  // Alias para setFormularioFondo
  setFondo(fondo) {
    return this.setFormularioFondo(fondo)
  }

  setFormularioEstilos(estilos) {
    this.propiedades.formulario.estilos = estilos
    return this
  }

  setFormularioContenedorCampos(estilos) {
    this.propiedades.formulario.contenedorCampos = estilos
    return this
  }

  setBotones(botones) {
    this.propiedades.formulario.botones = botones
    return this
  }

  setFormulariotamaño(tamañoClave = 'LG') {
    const clases = tamañosDisponibles[tamañoClave] || tamañosDisponibles['LG']
    this.propiedades.formulario.tamañoForm = clases

    return this
  }

  // Alias para setFormulariotamaño
  setTamaño(tamañoClave = 'LG') {
    return this.setFormulariotamaño(tamañoClave)
  }

  setFormularioShow(show) {
    this.propiedades.formulario.show = show
    return this
  }

  setFormularioTipo(tipo) {
    this.propiedades.formulario.tipo = tipo
    return this
  }

  // Alias para setFormularioTipo
  setTipoFormulario(tipo) {
    return this.setFormularioTipo(tipo)
  }

  setFormularioTituloFormulario(tituloFormulario) {
    this.propiedades.formulario.tituloFormulario = tituloFormulario
    return this
  }

  setFormularioSecciones(secciones) {
    this.propiedades.formulario.secciones = secciones
    return this
  }

  nuevaSeccion(nombre, descripcion = '') {
    const seccion = {
      nombre,
      descripcion,
      campos: []
    };
    this.propiedades.formulario.secciones.push(seccion);
    this.propiedades.seccionActual = seccion;
    return this;
  }

  addCampo(campo) {
    if (this.propiedades.seccionActual) {
      this.propiedades.seccionActual.campos.push(campo);
    } else {
      console.warn('No hay sección activa. Usa .nuevaSeccion(nombre) antes de agregar campos.');
    }
    return this;
  }

  setEsquemas(esquemas) {
    this.propiedades.formulario.esquemas = esquemas;
    return this;
  }

  setFooter(footer) {
    this.propiedades.formulario.footer = footer;
    return this;
  }

  build() {
    return this.propiedades
  }
}


const tamañosDisponibles = {
  LG: 'lg:w-[70%] md:w-[85%] md:h-[85%] w-[95%] h-[80%]',
  XS: 'md:w-[65%] md:h-[70%] w-[95%] h-[80%]',
  SM: 'lg:w-[45%] lg:h-[65%] md:w-[50%] md:h-[70%] w-[95%] h-[80%]',
  MD: 'lg:w-[55%] lg:h-[70%] md:w-[65%] md:h-[75%] w-[95%] h-[80%]',
}