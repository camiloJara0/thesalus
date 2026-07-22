import { useInsumoStore } from "~/stores/Entidades/Insumo";
import { usePacientesStore } from "~/stores/Entidades/Paciente";
import { useProfesionalStore } from '~/stores/Entidades/Profesional';
import { useServicioStore } from "~/stores/Entidades/Servicio";
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

        onProgress(10, 'Cargando datos base...');
        await Promise.all([
            serviciosStore.traer(true, true),
            pacientesStore.traer(true, true),
            profesionalesStore.traer(true, true),
            inventarioStore.traer(true, true),
        ]);

        onProgress(60, 'Cargando citas...');
        await citasStore.citasHoy(true);

        onProgress(80, 'Cargando historial clínico...');
        await historiaStore.indexDBDatos();

        onProgress(100, 'Listo');
        return true;
    } catch (error) {
        throw error;
    }
}

