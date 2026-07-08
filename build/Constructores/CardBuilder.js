export class CardBuilder {
    constructor() {
        this.propiedades = {
            cards: [], // Lista de Cards
            numeroCards: 0,
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

    setCards(cards) {
        this.propiedades.cards = cards
        return this
    }

    setNumeroCards(numero) {
        this.propiedades.numeroCards = numero
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