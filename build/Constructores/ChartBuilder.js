export class ChartBuilder {
    constructor() {
        this.propiedades = {
            datos: [], // data
            configuracion: {},
            contenedorCards: '', // CSS
            contenedor: '', // CSS
            header: { // Header carta
                title: '',
                subtitle: '',
                html: ''
            },
            tamaño: '', // CSS card
        }
    }

    setDatos(data) {
        this.propiedades.datos = data
        return this
    }

    setConfiguracion(config) {
        this.propiedades.configuracion = config
        return this
    }

    setTamaño(tamaño) {
        this.propiedades.tamaño = tamaño
        return this
    }

    setContenedor(contenedor) {
        this.propiedades.contenedor = contenedor
        return this
    }

    setcontenedorCards(contenedorCards) {
        this.propiedades.contenedorCards = contenedorCards
        return this
    }

    setheaderHtml(html) {
        this.propiedades.header.html = html
        return this
    }

    setheaderTitle(title) {
        this.propiedades.header.title = title
        return this
    }

    setheaderSubTitle(subtitle) {
        this.propiedades.header.subtitle = subtitle
        return this
    }

    build() {
        return this.propiedades
    }
}