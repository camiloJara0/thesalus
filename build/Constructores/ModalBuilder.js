export class ModalBuilder {
    constructor() {
        this.propiedades = {
            componentes: [], // Componentes ej. (Tabla, Form)
            secciones: [], // // Secciones o páginas del model; debe inicializarse con al menos una
            seccionActual: [],
            fondo: '', // Componente fondo ej. "FondoBlur"
            tamaño: '', // "LG", "XS", "SM"
            estilos: '', // CSS
            show: '', // Visibilidad Formulario 
            cerrarModal: '', // Funcion cerrar modal
            header: {
                titulo: '',
                descripcion: '',
                button: [],
            },
            headerModal: {}, // Header del Modal
            contenedor: '',
        };
    }

    setFondo(fondo = 'FondoDefault') {
        this.propiedades.fondo = fondo
        return this
    }

    setTamaño(tamañoClave = 'LG') {
        const clases = tamañosDisponibles[tamañoClave] || tamañosDisponibles['LG']
        this.propiedades.tamaño = clases

        return this
    }

    setEstilos(estilos) {
        this.propiedades.estilos = estilos
        return this
    }

    setShowModal(boolean) {
        this.propiedades.show = boolean
        return this
    }

    setCerrarModal(f) {
        this.propiedades.cerrarModal = f
        return this
    }

    setHeaderModal(header) {
        this.propiedades.headerModal = header
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

    nuevaSeccion(nombre, contenedor, descripcion = '') {
        const seccion = {
            nombre,
            descripcion,
            contenedor,
            componentes: []
        };
        this.propiedades.secciones.push(seccion);
        this.propiedades.seccionActual = seccion;
        return this;
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
        if (this.propiedades.seccionActual) {
            this.propiedades.seccionActual.componentes.push(componente);
        } else {
            console.warn('No hay sección activa. Usa .nuevaSeccion(nombre) antes de agregar campos.');
        }
        return this;

    }


    build() {
        return this.propiedades;
    }
};

const tamañosDisponibles = {
    LG: 'lg:w-[70%] md:w-[85%] md:h-[85%] w-[98%] h-[80%]',
    XS: 'md:w-[65%] md:h-[70%] w-[98%] h-[80%]',
    SM: 'lg:w-[45%] lg:h-[65%] md:w-[50%] md:h-[70%] w-[98%] h-[80%]',
}