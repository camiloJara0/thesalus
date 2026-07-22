/**
 * Datos de prueba para validaciones de formularios.
 * Organizados por tipo de entidad con casos válidos e inválidos.
 */

// ==================== CELULAR ====================
export const celularTests = [
    { label: 'Celular colombiano válido (310)', value: '3101234567', expected: null },
    { label: 'Celular colombiano válido (320)', value: '3209876543', expected: null },
    { label: 'Celular colombiano válido (300)', value: '3001112233', expected: null },
    { label: 'Celular muy corto (6 dígitos)', value: '310123', expected: 'error' },
    { label: 'Celular muy largo (11 dígitos)', value: '31012345678', expected: 'error' },
    { label: 'Celular con letras', value: '310abc4567', expected: 'error' },
    { label: 'Celular con espacios', value: '310 123 4567', expected: 'error' },
    { label: 'Celular vacío (opcional)', value: '', expected: null },
    { label: 'Celular nulo (opcional)', value: null, expected: null },
    { label: 'Celular solo ceros', value: '0000000000', expected: null },
    { label: 'Celular decimal', value: '310123456.7', expected: 'error' },
    { label: 'Celular negativo', value: '-3101234567', expected: 'error' },
    { label: 'Celular con符号', value: '310-123-4567', expected: 'error' },
]

// ==================== TELÉFONO ====================
export const telefonoTests = [
    { label: 'Teléfono válido (7 dígitos)', value: '6011234', expected: null },
    { label: 'Teléfono válido (10 dígitos)', value: '6011234567', expected: null },
    { label: 'Teléfono muy corto (5 dígitos)', value: '12345', expected: 'error' },
    { label: 'Teléfono muy largo (11 dígitos)', value: '12345678901', expected: 'error' },
    { label: 'Teléfono con letras', value: '601abcd', expected: 'error' },
    { label: 'Teléfono vacío (opcional)', value: '', expected: null },
    { label: 'Teléfono nulo (opcional)', value: null, expected: null },
]

// ==================== EMAIL ====================
export const emailTests = [
    { label: 'Email válido simple', value: 'test@correo.com', expected: null },
    { label: 'Email válido con subdominio', value: 'user@mail.empresa.co', expected: null },
    { label: 'Email válido con guión', value: 'mi-correo@test.com', expected: null },
    { label: 'Email válido con punto', value: 'nombre.apellido@empresa.com', expected: null },
    { label: 'Email sin @', value: 'testcorreo.com', expected: 'error' },
    { label: 'Email sin dominio', value: 'test@', expected: 'error' },
    { label: 'Email sin extensión', value: 'test@correo', expected: 'error' },
    { label: 'Email con espacios', value: 'test @correo.com', expected: 'error' },
    { label: 'Email vacío (opcional)', value: '', expected: null },
    { label: 'Email nulo (opcional)', value: null, expected: null },
    { label: 'Email con múltiples @', value: 'test@@correo.com', expected: 'error' },
    { label: 'Email con doble dominio', value: 'test@correo..com', expected: null },
]

// ==================== DOCUMENTO ====================
export const documentoTests = [
    { label: 'Documento válido (7 dígitos)', value: '1234567', expected: null },
    { label: 'Documento válido (10 dígitos)', value: '1234567890', expected: null },
    { label: 'Documento muy corto (6 dígitos)', value: '123456', expected: 'error' },
    { label: 'Documento muy largo (11 dígitos)', value: '12345678901', expected: 'error' },
    { label: 'Documento con letras', value: '12345abc', expected: 'error' },
    { label: 'Documento vacío (requerido)', value: '', expected: 'error' },
    { label: 'Documento nulo (requerido)', value: null, expected: 'error' },
    { label: 'Documento con espacios', value: '123 4567', expected: 'error' },
    { label: 'Documento solo ceros', value: '0000000', expected: null },
]

// ==================== NOMBRE ====================
export const nombreTests = [
    { label: 'Nombre válido', value: 'Juan Carlos', expected: null },
    { label: 'Nombre válido largo', value: 'María José de los Santos', expected: null },
    { label: 'Nombre muy corto (2 chars)', value: 'Ju', expected: 'error' },
    { label: 'Nombre solo 1 char', value: 'J', expected: 'error' },
    { label: 'Nombre vacío', value: '', expected: 'error' },
    { label: 'Nombre nulo', value: null, expected: 'error' },
    { label: 'Nombre con números', value: 'Juan123', expected: null },
    { label: 'Nombre con 3 chars exactos', value: 'Ana', expected: null },
]

// ==================== PASSWORD ====================
export const passwordTests = [
    { label: 'Password válido', value: 'password1', expected: null },
    { label: 'Password con símbolo', value: 'Pass@1word', expected: null },
    { label: 'Password muy corto', value: 'pass1', expected: 'error' },
    { label: 'Password sin número', value: 'password', expected: 'error' },
    { label: 'Password sin letra', value: '12345678', expected: 'error' },
    { label: 'Password vacío', value: '', expected: 'error' },
    { label: 'Password nulo', value: null, expected: 'error' },
    { label: 'Password 8 caracteres exactos', value: 'abcde123', expected: null },
    { label: 'Password con espacios', value: 'pass word1', expected: null },
]

// ==================== FECHA FORMATO ====================
export const fechaFormatoTests = [
    { label: 'Fecha válida', value: '2024-01-15', expected: null },
    { label: 'Fecha válida bisiesto', value: '2024-02-29', expected: null },
    { label: 'Fecha no bisiesto inválida', value: '2023-02-29', expected: 'error' },
    { label: 'Fecha formato DD/MM/YYYY', value: '15/01/2024', expected: 'error' },
    { label: 'Fecha mes inválido', value: '2024-13-15', expected: 'error' },
    { label: 'Fecha día inválido', value: '2024-01-32', expected: 'error' },
    { label: 'Fecha vacía', value: '', expected: null },
    { label: 'Fecha nula', value: null, expected: null },
    { label: 'Fecha incompleta', value: '2024-01', expected: 'error' },
    { label: 'Fecha con texto', value: '2024-enero-15', expected: 'error' },
]

// ==================== FECHA NO PASADA ====================
export const fechaNoPasadaTests = (() => {
    const hoy = new Date()
    const yyyy = hoy.getFullYear()
    const mm = String(hoy.getMonth() + 1).padStart(2, '0')
    const dd = String(hoy.getDate()).padStart(2, '0')
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)
    const yyyyAyer = ayer.getFullYear()
    const mmAyer = String(ayer.getMonth() + 1).padStart(2, '0')
    const ddAyer = String(ayer.getDate()).padStart(2, '0')
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)
    const yyyyManana = manana.getFullYear()
    const mmManana = String(manana.getMonth() + 1).padStart(2, '0')
    const ddManana = String(manana.getDate()).padStart(2, '0')

    return [
        { label: 'Hoy', value: `${yyyy}-${mm}-${dd}`, expected: null },
        { label: 'Ayer', value: `${yyyyAyer}-${mmAyer}-${ddAyer}`, expected: 'error' },
        { label: 'Mañana', value: `${yyyyManana}-${mmManana}-${ddManana}`, expected: null },
        { label: 'Formato inválido', value: 'invalido', expected: 'error' },
        { label: 'Vacía', value: '', expected: null },
    ]
})()

// ==================== FECHA NACIMIENTO ====================
export const fechaNacimientoTests = [
    { label: 'Adulto con CC válido', value: '1990-05-15', tipoDoc: 'CC', expected: null },
    { label: 'Menor con CC (debe fallar)', value: '2015-05-15', tipoDoc: 'CC', expected: 'error' },
    { label: 'Menor con TI válido', value: '2015-05-15', tipoDoc: 'TI', expected: null },
    { label: 'Adulto con TI (debe fallar)', value: '1990-05-15', tipoDoc: 'TI', expected: 'error' },
    { label: 'Recién nacido', value: '2026-07-20', tipoDoc: null, expected: null },
    { label: 'Edad 100 años', value: '1926-07-20', tipoDoc: null, expected: null },
    { label: 'Mayor de 100 años', value: '1920-01-01', tipoDoc: null, expected: 'error' },
    { label: 'Fecha futura', value: '2030-01-01', tipoDoc: null, expected: 'error' },
]

// ==================== HORA ====================
export const horaTests = [
    { label: 'Hora válida madrugada', value: '00:00', expected: null },
    { label: 'Hora válida mañana', value: '09:30', expected: null },
    { label: 'Hora válida noche', value: '23:59', expected: null },
    { label: 'Hora inválida 24:00', value: '24:00', expected: 'error' },
    { label: 'Hora inválida sin minutos', value: '09:', expected: 'error' },
    { label: 'Hora con segundos', value: '09:30:00', expected: 'error' },
    { label: 'Hora vacía', value: '', expected: null },
    { label: 'Hora nula', value: null, expected: null },
    { label: 'Hora con letras', value: 'ab:cd', expected: 'error' },
]

// ==================== PRESIÓN ARTERIAL ====================
export const presionTests = [
    { label: 'PA válida normal', value: '120/80', expected: null },
    { label: 'PA válida alta', value: '140/90', expected: null },
    { label: 'PA sin barra', value: '12080', expected: 'error' },
    { label: 'PA con un número', value: '120/', expected: 'error' },
    { label: 'PA con letras', value: 'abc/def', expected: 'error' },
    { label: 'PA vacía', value: '', expected: null },
    { label: 'PA nula', value: null, expected: null },
]

// ==================== DIRECCIÓN ====================
export const direccionTests = [
    { label: 'Dirección válida', value: 'Calle 45 # 12-34', expected: null },
    { label: 'Dirección válida larga', value: 'Avenida Caracas # 45-67, Barrio Centro', expected: null },
    { label: 'Dirección muy corta (4 chars)', value: 'Cll', expected: 'error' },
    { label: 'Dirección vacía', value: '', expected: 'error' },
    { label: 'Dirección nula', value: null, expected: 'error' },
    { label: 'Dirección con 5 caracteres exactos', value: 'Calle', expected: null },
    { label: 'Dirección con 6 caracteres', value: 'Calle 1', expected: null },
]

// ==================== SELECT REQUERIDO ====================
export const selectRequeridoTests = [
    { label: 'Valor válido string', value: 'masculino', expected: null },
    { label: 'Valor válido número', value: 1, expected: null },
    { label: 'Valor vacío string', value: '', expected: 'error' },
    { label: 'Valor nulo', value: null, expected: 'error' },
    { label: 'Valor undefined', value: undefined, expected: 'error' },
    { label: 'Valor 0', value: 0, expected: 'error' },
    { label: 'Valor false', value: false, expected: 'error' },
    { label: 'Array vacío (truthy)', value: [], expected: null },
    { label: 'Objeto vacío (truthy)', value: {}, expected: null },
]

// ==================== DATOS COMPLETOS DE PACIENTE ====================
export const pacienteCompleto = {
    info_usuario: {
        name: 'Juan Carlos Pérez',
        No_document: '1234567890',
        type_doc: 'CC',
        celular: '3101234567',
        telefono: '6011234567',
        nacimiento: '1990-05-15',
        direccion: 'Calle 45 # 12-34, Barrio Centro',
        municipio: 'Bogotá',
        departamento: 'Cundinamarca',
        barrio: 'Centro',
        zona: 'Urbana',
    },
    sexo: 'masculino',
    genero: 'masculino',
    eps: { codigo: '001', nombre: 'EPS Salud', id: 1, nit: '900123456' },
    id_eps: 1,
    regimen: 'Contributivo',
    vulnerabilidad: 'Ninguna',
    estado: 'Activo',
    convenio_id: null,
    convenios: { id: null, nombre: '' },
    plan_manejo_procedimientos: [],
    antecedente: [],
}

export const pacienteCompletoInvalido = {
    info_usuario: {
        name: 'Ju',
        No_document: '',
        type_doc: 'CC',
        celular: '',
        telefono: '',
        nacimiento: '',
        direccion: '',
        municipio: '',
        departamento: '',
        barrio: '',
        zona: '',
    },
    sexo: '',
    genero: '',
    eps: null,
    id_eps: null,
    regimen: '',
    vulnerabilidad: '',
}

// ==================== DATOS COMPLETOS DE PROFESIONAL ====================
export const profesionalCompleto = {
    info_usuario: {
        name: 'María López García',
        No_document: '9876543210',
        type_doc: 'CC',
        celular: '3209876543',
        telefono: '6019876543',
        nacimiento: '1985-03-20',
        direccion: 'Carrera 7 # 45-67',
        municipio: 'Medellín',
        departamento: 'Antioquia',
        barrio: 'Poblado',
        zona: 'Urbana',
    },
    user: { correo: 'maria.lopez@hospital.com' },
    departamento_laboral: 'Antioquia',
    municipio_laboral: 'Medellín',
    zona_laboral: 'Urbana',
    profesion: { id: 1 },
    id_profesion: 1,
    correoProfesional: 'maria.lopez@hospital.com',
    estado: 'Activo',
}

// ==================== DATOS DE CITA ====================
export const citaCompleta = {
    id_paciente: 1,
    id_medico: 1,
    id_servicio: 1,
    fecha: '2026-07-25',
    hora: '09:00',
    motivo: 'Consulta general',
    servicio: 'Medicina General',
    name_paciente: 'Juan Pérez',
    name_medico: 'Dra. López',
    estado: 'Inactiva',
}

export const citaFechaPasada = {
    ...citaCompleta,
    fecha: '2020-01-01',
}

export const citaHoraInvalida = {
    ...citaCompleta,
    hora: '25:00',
}
