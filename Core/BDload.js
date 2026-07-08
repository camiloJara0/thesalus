import { useInsumoStore } from "~/stores/Entidades/Insumo";
import { usePacientesStore } from "~/stores/Entidades/Paciente";
import { useProfesionalStore } from '~/stores/Entidades/Profesional';import { useServicioStore } from "~/stores/Entidades/Servicio";
;
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useHistoriasStore } from "~/stores/Formularios/historias/Historia";


export async function traerDatos(onProgress = () => {}) {
    try {
        const historiaStore = useHistoriasStore()
        const profesionalesStore = useProfesionalStore()
        const pacientesStore = usePacientesStore()
        const citasStore = useCitasStore()
        const serviciosStore = useServicioStore()
        const inventarioStore = useInsumoStore()

        const pasos = [
            { texto: 'Cargando servicios...', fn: () => serviciosStore.traer(true, true) },
            { texto: 'Cargando pacientes...', fn: () => pacientesStore.traer(true, true) },
            { texto: 'Cargando profesionales...', fn: () => profesionalesStore.traer(true, true) },
            { texto: 'Cargando Historial clinico...', fn: () => historiaStore.indexDBDatos() },
            { texto: 'Cargando Inventario...', fn: () => inventarioStore.traer(true, true) },
            { texto: 'Cargando citas...', fn: () => citasStore.citasHoy(true) },
        ];

        const total = pasos.length;

        for (let i = 0; i < total; i++) {
            const porcentaje = Math.round(((i + 1) / total) * 100);
            onProgress(porcentaje, pasos[i].texto);
            await pasos[i].fn();
        }

        return true;
    } catch (error) {
        console.error('Error al traer datos:', error);
        throw error;
    }
}

