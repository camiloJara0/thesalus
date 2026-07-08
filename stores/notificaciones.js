import { defineStore } from "pinia";

export const useNotificacionesStore = defineStore("Notificaciones", {
    // state
    state: () => {
        let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

        return {
            swal: null,
            respuesta: null,
            options: {
                titulo: '',
                texto: '',
                confirmtext: '',
                icono: '',
                canceltext: '',
                position: '',
                tiempo: 2000,
                position: '',
                background: '#d33',
                input: 'text',
                inputAtributes: { placeholder: "Digite" },
                theme: theme
            }

        };
    },
    actions: {
        inicia() {
            const { $swal } = useNuxtApp()
            this.swal = $swal
        },
        // Alerta simple
        simple() {
            this.inicia()
            const result = this.swal.fire({
                title: this.options.titulo,
                text: this.options.texto,
                icon: this.options.icono,
                timer: this.options.tiempo,
                customClass: {
                    popup: this.options.theme === 'dark' ? 'swal-dark' : 'swal-light',
                },
            });
            return result
        },
        // Alerta con posicion de mensaje o notificacion
        mensaje() {
            this.inicia()
            this.swal.fire({
                position: this.options.position,
                text: this.options.texto,
                showConfirmButton: false,
                timer: this.options.tiempo,
                background: this.options.background,
                timerProgressBar: true,
                color: '#fff'
            });
        },
        // Alerta con Respuesta
        async alertRespuesta() {
            this.inicia()
            const result = await this.swal.fire({
                icon: this.options.icono,
                title: this.options.titulo,
                html: this.options.html,
                showCancelButton: true,
                confirmButtonText: this.options.confirmtext,
                cancelButtonText: this.options.canceltext,
                
                customClass: {
                    // Opcional: aplica la clase de tema
                    popup: this.options.theme === 'dark' ? 'swal-dark' : 'swal-light',
                },
            })
            if (result.isConfirmed) {
                return 'confirmado'
            } else if (result.isDenied) {
                return 'denegado'
            } else {
                return 'cancelado'
            }
        },
        // Alerta con Input
        async alertRespuestaInput() {
            this.inicia()
            const result = await this.swal.fire({
                icon: this.options.icono,
                title: this.options.titulo,
                html: this.options.html,
                input: this.options.input,
                inputAttributes: this.options.inputAtributes,
                showCancelButton: true,
                confirmButtonText: this.options.confirmtext,
                cancelButtonText: this.options.canceltext,
                
                customClass: {
                    // Opcional: aplica la clase de tema
                    popup: this.options.theme === 'dark' ? 'swal-dark' : 'swal-light',
                },
            })
            if (result.isConfirmed) {
                return {
                    estado: 'confirmado',
                    valor: result.value || ''
                };
            } else if (result.isDenied) {
                return {
                    estado: 'denegado',
                    valor: null
                };
            } else {
                return {
                    estado: 'cancelado',
                    valor: null
                };
            }
        },

        loading() {
            this.inicia();
            // SweetAlert2 para mostrar "Cargando..."
            this.swal.fire({
                title: this.options.titulo || 'Cargando...',
                // html: this.options.texto || 'Por favor, espere un momento...',
                html: `
                    <p id="swal-text">${this.options.texto || 'Inicializando...'}</p>
                    <div style="width:100%; background:#e5e7eb; border-radius:6px; overflow:hidden; margin-top:10px;">
                        <div id="swal-progress"
                            style="width:0%; height:10px; background:#326872; transition:width .3s;">
                        </div>
                    </div>
                    <small id="swal-percent">0%</small>
                `,
                allowOutsideClick: false,
                allowEscapeKey: false,   // Evita que se cierre con la tecla Esc
                showConfirmButton: false, // Oculta el botón de Confirmar
                didOpen: () => {
                    // Muestra el indicador de carga (spinner)
                    this.swal.showLoading(); 
                },
                customClass: {
                    // Opcional: aplica la clase de tema
                    popup: this.options.theme === 'dark' ? 'swal-dark' : 'swal-light',
                },
            });
        },

        close() {
            this.swal.close();
        }
    }
})