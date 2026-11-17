# Plan de Seguridad y Permisos — Fases 1-3

Estado: aprobado por el usuario (alcance cerrado).
Backend: `C:\xampp\htdocs\proyectos\backendThesalusv1` · Frontend: Nuxt 3 `santaIsabel`.

## 1. Decisiones cerradas

- Alcance backend: **solo lecturas con scoping** + `show/update/destroy` de paciente (sin 403 por `X_get/post`).
- **7 permisos base** (ocultos del formulario + otorgados siempre).
- Ocultar también los **24 permisos sin efecto** (no los revisa ningún código activo).

## 2. Fase 1 — Backend: helper de acceso

- NUEVO `config/permisos.php`: `PERMISOS_BASE` = `Datos_get`, `Citas_view`, `Citas_get`,
  `Pacientes_view`, `Pacientes_get`, `Historias_view`, `Historias_get`
  (espejo documentado de `data/permisos.js` en el frontend).
- NUEVO `app/Support/Acceso.php` (caché por request):
  - `esAdmin()` · `esProfesional()` · `idProfesional()` · `permisosEfectivos()` · `tienePermiso()`
  - `puedeVerTodosPacientes()` = Admin || `ListaPacientes`
  - `scopePacientes($q)` = si restringido → `whereHas('citas', id_medico = yo)`
  - `scopeAnalisis($q)` = si restringido → `whereHas('historia.paciente', citas.id_medico = yo)`
  - `puedeVerPaciente($id)` · `puedeVerAnalisis($id)` (`analises.id_historia` → `id_paciente`)
  - Restringido sin fila `Profesional` → conjunto vacío (acceso seguro por defecto).
- `UserController::login`: inyectar `PERMISOS_BASE` (dedupe) en `permisos` de todos los roles.
  Nota: hoy `rol == 'Admin'` recibe todas las secciones; cualquier otro rol cae en `else` con
  permisos vacíos → la rama `SuperAdmin` del Backoffice debe sumarse aquí (plan Backoffice §8).

## 3. Fase 2 — Scoping de endpoints (`php -l` por archivo)

Reglas: pacientes → solo atendidos (`citas.id_medico = yo`); citas → Profesional solo propias
(idéntico a `filtrarPorRol` del frontend y a `infoCitas/citasPorRango/citasPaginadas`);
análisis → por paciente accesible.

| Archivo | Método | Acción |
|---|---|---|
| PacienteController | `index`, `pacientesInactivos` | `scopePacientes` |
| | `traePacientes` | Profesional fuerza id propio (ignora request); Admin mantiene param (BC) |
| | `show`, `update`, `destroy` | 403 si `!puedeVerPaciente` |
| | `traeKardex` | acotar query inicial (`whereIn` subquery `citas`) |
| HistoriaClinicaController | `index` | `scopePacientes` |
| | `pacientesConHistoria` | Auth > request (igual que `traePacientes`) |
| | `traeDatosHistoria`, `analisisInicial` | `scopeAnalisis` |
| | `analisisCompleta($id)` | 403 si `!puedeVerAnalisis` |
| | `analisisPaciente(id)`, `analisisPaginado/Filtrado(paciente_id)` | con paciente → 403 si no accesible; sin paciente → `scopeAnalisis` |
| | `exportarPdfIndice`, `exportarPdf`, `exportarPdfAsync`, `exportarExcel` | restringido → forzar `id_profesional` propio + `scopeAnalisis`; `id_paciente` presente → 403 si no accesible |
| | `imprimirEvolucion/TrabajoSocial/Medicina` | 403 si `!puedeVerAnalisis` |
| CitaController | `index`, `citasHoy`, `citasFiltradas` | Profesional → `where id_medico = yo` (`infoCitas` sin cambios) |
| KardexController | `registrosPaciente` | 403 si `!puedeVerPaciente` |
| NotaController | `index`, `show`, `imprimir` | scope por analisis→paciente + 403 |
| TerapiaController | `index`, `show`, `imprimir` | igual que Nota |

Fuera de alcance: `DashboardController` (agregados sin PII), `filtrosCitas`/`filtrosAnalisis`
(metadatos), `informacionUsers`, escrituras de citas/historias.

## 4. Fase 3 — Frontend: limpieza del formulario

- `data/permisos.js`: exportar `PERMISOS_BASE` (7) y `PERMISOS_NO_APLICA` (24):
  `Codigos_*` (5), `Citas_delete`, `Pacientes_delete`, `Historias_post/put/delete`,
  `Evoluciones_get/post`, `Notas_get/post`, `Medicacion_get/post`, `MedicinaGeneral_get/post`,
  `TrabajoSocial_get/post`, `Terapias_get/post`, `Tratamientos_get/post`.
  (Flujos "Cancelar cita"/"Eliminar paciente" existen pero su botón no revisa el permiso;
  si luego se gatea, se reactiva el nombre — sigue en DB.)
- `usePermisos.hasPermiso` → base siempre `true`; `hasAllPermisos`/`hasAnyPermiso` pasan por
  `hasPermiso` (cubre sesiones abiertas antes del deploy).
- `stores/Entidades/Profesion.js::listSecciones` y
  `stores/Formularios/empresa/Profesion.js::listSecciones`
  → omitir base + no-aplica (además de `Diagnosticos_view`/`ListaPacientes` ya omitidos).
- `stores/Formularios/empresa/Profesion.js::traerSecciones` (Solicitar permisos de Home)
  → omitir base + no-aplica.
- `traerPermisos(id)` por id SIN tocar (estado de edición).
- Resultado: formulario **90 → 59 secciones (−35%)**.

## 5. Verificación

1. `php -l` por archivo backend.
2. Smoke: token profesional sin `ListaPacientes` → `GET /pacientes`, `/historiasClinicas`,
   `/citasHoy` solo suyos; Admin → todos; `PUT` paciente no atendido → 403.
3. `npm run test:run` (291 + nuevos tests de `hasPermiso` base) y `npm run build`.
4. Manual: modal Nueva/Modificar Profesión y Solicitar permisos con menos secciones;
   servicios cargan sin tildar `Datos_get`.

## 6. Riesgos / notas

- No se toca la DB (filas base existentes quedan; redundantes e inofensivas; al editar una
  profesión podrían salir del array `permisos` — irrelevante porque siempre se otorgan).
- Sesiones abiertas antes del deploy: las cubre `hasPermiso` del frontend; al re-login el
  backend ya las inyecta.
- Caché offline (IndexedDB) puede servir listas previas hasta el siguiente refresh en línea.
- `manual_tecnico.txt`: nota de permisos base + scoping backend.
- **Orden:** Fase 1 → 2 (`php -l`) → 3 (tests+build) → doc.
- Este plan es **prerequisito del Backoffice** (reutiliza `Acceso::tienePermiso` para el
  middleware `permiso:Backoffice_*`).
