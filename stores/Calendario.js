import { defineStore } from "pinia";
import { nombresMeses } from "~/data/Fechas";

// Esta funcion obtiene la fecha actual
function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
    const año = fecha.getFullYear();
    return {
        fechaFormateada: `${dia}/${mes}/${año}`,
        dia,
        mes,
        año
    };
};
// Devuelve array con calendario desde 2025, hasta el año actual mas 25 años
function obtenerCalendario(desde = 2025, hasta = 2050) {

  const calendario = [];

  for (let año = desde; año <= hasta; año++) {
    const meses = nombresMeses.map((nombre, i) => {
      const fechaInicio = new Date(año, i, 1);
      const inicio = fechaInicio.getDay();

      // Verificar si es febrero y año bisiesto
      let dias = new Date(año, i + 1, 0).getDate();

      return { nombre, dias, inicio };
    });

    calendario.push({ año, meses });
  }

  return calendario;
}


// Store para manejar el calendario, inicializa con la fecha actual
export const useCalendarioCitas = defineStore('CalendarioCitas', {
    state: () => {
        const { fechaFormateada, dia, mes, año } = obtenerFechaActual();
        const desde = new Date().getFullYear();
        const hasta = desde + 25
        const mesesAño = obtenerCalendario(2025, hasta);
        return {
            calendario: mesesAño,
            fecha: fechaFormateada,
            dias: dia,
            meses: parseInt(mes),
            años: año,
            añoDesde: 2025,
        };
    },

    getters: {
        fechaActual: () => {
            const fechaActual = new Date() // Retorna la fecha actual como objeto Date
            // Formatea la fecha actual como 'dd/mm/yyyy'
            const dia = String(fechaActual.getDate()).padStart(2, '0');
            const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // +1 porque enero es 0
            const año = fechaActual.getFullYear();
            return `${dia}/${mes}/${año}`;
        },

        // Obtiene el dia de la semana por la fecha
        diaSemana: (state) => {
            // Convertir 'dd/mm/yyyy' a objeto Date válido
            const [dia, mes, año] = state.fecha.split('/');
            const fechaDate = new Date(`${año}-${mes}-${dia}`);

            // Array de días en español
            const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', ];
            return diasSemana[fechaDate.getDay()];
        },
    },

    actions: {
        cambiarFecha(fecha) {
            const partes = fecha.split('/');
            this.fecha = fecha;
            this.dias = partes[0];
            this.meses = partes[1];
        },

        obtenerFecha() {
            const { fechaFormateada, dia, mes, año } = obtenerFechaActual() 
            this.fecha = fechaFormateada
            this.dias = dia
            this.meses = parseInt(mes)
            this.años = año
        },
    }
})
