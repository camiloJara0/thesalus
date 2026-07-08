import { mapCampos } from "~/components/organism/Forms/useFormulario";
import { municipios } from "~/data/municipios.js";
import { computed } from 'vue'

export function useUsuarioValidaciones(formulario, tipo) {

    const calcularEdad = (fecha) => {
        const hoy = new Date();
        let edad = hoy.getFullYear() - fecha.getFullYear();
        const mes = hoy.getMonth() - fecha.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--;
        return edad;
    };

    const validarFechaNacimiento = (fecha, tipoDoc) => {
        const edad = calcularEdad(new Date(fecha));

        if (edad < 0 || edad > 100) {
            return "La edad debe estar entre 0 y 100 años";
        }

        if (tipoDoc === "cedula" && edad < 18) {
            return "Para cédula, la edad mínima es 18 años";
        }

        if (tipoDoc === "Tarjeta de identidad" && edad > 17) {
            return "Para tarjeta de identidad, la edad máxima es 17 años";
        }

        return "";
    };

    const validarFecha = (event) => {
        let mensaje = ''
        if(tipo === 'Profesional'){
            mensaje = validarFechaNacimiento(
                event.target.value,
                formulario.Profesional.info_usuario.type_doc
            );
        } else {
            mensaje = validarFechaNacimiento(
                event.target.value,
                formulario.Paciente.info_usuario.type_doc
            );
        }
        mostrarError(mensaje);
    };

    const validarTipoDoc = (event) => {
        let mensaje = ''
        if(tipo === 'Profesional'){
            if (!formulario.Profesional.info_usuario.nacimiento) return;
    
            mensaje = validarFechaNacimiento(
                formulario.Profesional.info_usuario.nacimiento,
                event.target.value
            );
        } else {
            if (!formulario.Paciente.info_usuario.nacimiento) return;
    
            mensaje = validarFechaNacimiento(
                formulario.Paciente.info_usuario.nacimiento,
                event.target.value
            );
        }
        mostrarError(mensaje);
    };

    const mostrarError = (mensaje) => {
        const errorDiv = document.getElementById("error-fecha");
        if (errorDiv) {
            errorDiv.innerHTML = mensaje ? `<p>${mensaje}</p>` : "";
        }
    };

    const buscarUsuarioPorDocumento = async (documento) => {
        const store = useIndexedDBStore();
        store.almacen = "InformacionUser";

        const usuarios = await store.leerdatos();
        const encontrado = usuarios.find(u => u.No_document === documento);

        if (encontrado) {
            mapCampos(encontrado, formulario);
        }
    };

    const municipiosOptions = computed(() => {
        const departamentoSeleccionado = formulario.InformacionUser.departamento;
        const departamento = municipios.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

        return departamento ? departamento.municipios : [];
    });

    const municipiosOptionsProfesional = computed(() => {
        const departamentoSeleccionado = formulario.Profesional.departamento_laboral;
        const departamento = municipios.find(dep => dep.nombre.toUpperCase() === departamentoSeleccionado.toUpperCase());

        return departamento ? departamento.municipios : [];
    });

    return {
        validarFecha,
        validarTipoDoc,
        buscarUsuarioPorDocumento,
        municipiosOptions,
        municipiosOptionsProfesional
    };
}
