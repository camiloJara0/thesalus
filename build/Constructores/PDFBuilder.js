export class PdfBuilder {
    constructor() {
        this.config = {
            elementId: null, // ID Componente padre html
            isActive: false,
            storePinia: '',
            margin: 10,
            orientation: "p",
            unit: "mm",
            format: "a4",
            filename: "documento.pdf",
            components: [],
            sello: '',
        }
    }

    setElementId(id) {
        this.config.elementId = id
        return this
    }

    setIsActive(id) {
        this.config.isActive = id
        return this
    }

    setDataPinia(store) {
        this.config.storePinia = store
        return this
    }

    setMargins(margin) {
        this.config.margin = margin
        return this
    }

    setFileName(name) {
        this.config.filename = name
        return this
    }

    setOrientation(orientation) {
        this.config.orientation = orientation
        return this
    }

    setFormat(format) {
        this.config.format = format
        return this
    }

    setSello(sello) {
        this.config.sello = sello
        return this
    }


    async export() {
   
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

        this.config.components.push(componente)
        return this;

    }

    build() {
        return this.config;
    }
}

