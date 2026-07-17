// utils/componentLoader.js
import { defineAsyncComponent } from 'vue';

export function loadComponent(name) {
  const componentMap = {
    Input: () => import('~/components/atoms/Inputs/Input.vue'),
    InputContraseña: () => import('~/components/atoms/Inputs/InputContraseña.vue'),
    Select: () => import('~/components/atoms/Selects/Select.vue'),
    Label: () => import('~/components/atoms/Labels/Label.vue'),
    SelectSearch: () => import('~/components/atoms/Selects/SelectSearch.vue'),
    SelectSearchOld: () => import('~/components/atoms/Selects/SelectSearchOld.vue'),
    SelectMultiple: () => import('~/components/atoms/Selects/SelectMultiple.vue'),
    Textarea: () => import('~/components/atoms/Textareas/Textarea.vue'),
    Checkbox: () => import('~/components/atoms/Checkbox/Checkbox.vue'),
    GroupCampos: () => import('~/components/molecules/groupCampos/GroupCampos.vue'),
    Imagen: () => import('~/components/atoms/Images/Imagen.vue'),
    Permisos: () => import('~/components/atoms/Selects/Permisos.vue'),
    Card: () => import('~/components/molecules/Cards/Card.vue'),
    Button: () => import('~/components/atoms/Buttons/Button.vue'),
    DynamicField: () => import('~/components/atoms/DynamicField/DynamicField.vue')
  };

  const loader = componentMap[name];
  return loader ? defineAsyncComponent(loader) : null;
}

export async function cargarStore(storeName) {
  let tablaStore;

  switch (storeName) {
    case 'Pacientes': {
      const { usePacientesStore } = await import('~/stores/Entidades/Paciente');
      tablaStore = usePacientesStore();
      break;
    }
    case 'Profesionales': {
      const { useProfesionalStore } = await import('~/stores/Entidades/Profesional');
      tablaStore = useProfesionalStore();
      break;
    }
    case 'Usuarios': {
      const { useUsersStore } = await import('~/stores/Formularios/usuarios/Users');
      tablaStore = useUsersStore();
      break;
    }
    case 'Historias': {
      const { useHistoriasStore } = await import('~/stores/Formularios/historias/Historia');
      tablaStore = useHistoriasStore();
      break;
    }
    case 'Login': {
      const { useUsuariosStore } = await import('~/stores/Formularios/login/Login');
      tablaStore = useUsuariosStore();
      break;
    }
    case 'Notas': {
      const { useNotasStore } = await import('~/stores/Formularios/historias/Notas');
      tablaStore = useNotasStore();
      break;
    }
    case 'Citas': {
      const { useCitasStore } = await import('~/stores/Formularios/citas/Cita');
      tablaStore = useCitasStore();
      break;
    }
    case 'Resolucion': {
      const { useFacturacionStore } = await import('~/stores/Formularios/empresa/Facturacion');
      tablaStore = useFacturacionStore();
      break;
    }
    case 'Profesion': {
      const { useProfesionStore } = await import('~/stores/Entidades/Profesion');
      tablaStore = useProfesionStore();
      break;
    }
    case 'EPS': {
      const { useEpsStore } = await import('~/stores/Entidades/Eps');
      tablaStore = useEpsStore();
      break;
    }
    case 'Servicio': {
      const { useServicioStore } = await import('~/stores/Entidades/Servicio');
      tablaStore = useServicioStore();
      break;
    }
    case 'Empresa': {
      const { useEmpresaStore } = await import('~/stores/Formularios/empresa/Empresa');
      tablaStore = useEmpresaStore();
      break;
    }
    case 'Software': {
      const { useSoftwareStore } = await import('~/stores/Formularios/empresa/Software');
      tablaStore = useSoftwareStore();
      break;
    }
    case 'Nomina': {
      const { useNominaStore } = await import('~/stores/Formularios/empresa/Nomina');
      tablaStore = useNominaStore();
      break;
    }
    case 'DocumentosEquivalentes': {
      const { useSoftwareDEStore } = await import('~/stores/Formularios/empresa/DocumentosEquivalentes');
      tablaStore = useSoftwareDEStore();
      break;
    }
    case 'Insumos': {
      const { useInsumoStore } = await import('~/stores/Entidades/Insumo');
      tablaStore = useInsumoStore();
      break;
    }
    case 'Convenio': {
      const { useConvenioStore } = await import('~/stores/Entidades/Convenio');
      tablaStore = useConvenioStore();
      break;
    }
    case 'Kardex': {
      const { useKardexStore } = await import('~/stores/Entidades/Kardex');
      tablaStore = useKardexStore();
      break;
    }
    case 'Vadecum': {
      const { useVadecumStore } = await import('~/stores/Formularios/Codigos/Vadecum');
      tablaStore = useVadecumStore();
      break;
    }
    case 'Cie10': {
      const { useCie10Store } = await import('~/stores/Entidades/Cie10');
      tablaStore = useCie10Store();
      break;
    }
    default:
      console.warn(`Store "${storeName}" no reconocido.`);
      break;
  }

  return tablaStore;
}