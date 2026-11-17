# Plan Backoffice de Desarrolladores (Parte B) — Reconstruido para aprobación

> **Nota:** este documento reconstruye el plan aprobado en conversación a partir del
> resumen de arquitectura. Los números (13 tareas, 11 secciones, 20 endpoints,
> migraciones M1-M6) provienen del plan original; los nombres exactos de secciones,
> endpoints y el desglose por tarea se han derivado aquí y **requieren aprobación**.
> Prerequisito cumplido: Plan de Seguridad (T0, Fases 1-3) — `Acceso::tienePermiso`
> es la base del middleware `permiso`.

---

## 1. Objetivo

Panel de desarrollador (`/v1/backoffice/*`) para operar la aplicación sin tocar la
BD ni el servidor a mano: monitoreo de errores y trabajos, auditoría, métricas de
API, mantenimiento de usuarios/tokens, limpieza de archivos y respaldos.

## 2. Decisiones aprobadas (del plan original)

| Elemento | Decisión |
|---|---|
| Rutas | Prefijo `/v1/backoffice/*` |
| Gate de rol | Middleware `backoffice.access` → `rol === 'SuperAdmin'` |
| Gate de permiso | Middleware `permiso:Backoffice_*` → reutiliza `Acceso::tienePermiso` |
| Alta de SuperAdmin | **Solo** comando `php artisan superadmin:assign {correo}` — jamás por HTTP |
| Secciones | 11 secciones `Backoffice_*` nuevas en `secciones` |
| Tablas nuevas | `audit_logs`, `error_logs`, `metricas_api_dias` |
| Migraciones | 6, **solo aditivas** (M1-M6): sin ALTER destructivo, sin DROP |
| Endpoints | 20 |
| Tareas | T1-T13 (este documento) |
| Login | Rama `SuperAdmin` en `UserController::login` (plan Seguridad §8) |

## 3. Diagnóstico actual (verificado 2026-11-13)

- `users.rol` varchar(50): 1 Admin, 154 Profesionales, **0 SuperAdmin**.
- No existen middlewares `permiso` ni `backoffice` (`App/Http/Middleware/` solo
  tiene los de Laravel base + `CheckTokenExpiration`); alias en `Kernel` solo
  incluye `check.token.expiration` entre los propios.
- `Handler::reportable()` vacío (línea 29); errores 500 solo van a `laravel.log`
  (29 MB, sin rotación, `LOG_LEVEL=debug`).
- Colas `database` con cron activo (`queue:work` cada min, `exports:prune` diario,
  `exports:reap` cada 15 min en `App/Console/Kernel.php`); `failed_jobs` = 3.
- Sin auditoría (0 rastros); sin respaldos; storage con `temp_pdf_*` y `temp_*.pdf`.
- `secciones(id, nombre)` — sin más columnas; `aprobarPermiso` sin validar aprobador
  (deuda conocida, fuera de alcance salvo guard de `Backoffice_*`).
- `routes/api.php`: rutas directas `/v1/...`, grupo `['auth:sanctum',
  'check.token.expiration']` en línea 61.

## 4. Las 11 secciones `Backoffice_*`

| # | Sección | Pantalla / pestaña que gobierna |
|---|---|---|
| 1 | `Backoffice_view` | Acceso base al panel (menú) |
| 2 | `Backoffice_salud` | Salud + configuración resumida |
| 3 | `Backoffice_bd` | Estadísticas de tablas (pestaña de Salud) |
| 4 | `Backoffice_errores` | Monitor de errores + visor de `laravel.log` |
| 5 | `Backoffice_trabajos` | Colas, jobs y `failed_jobs` |
| 6 | `Backoffice_exportaciones` | Estado de exportaciones PDF/zip (pestaña de Trabajos) |
| 7 | `Backoffice_auditoria` | Auditoría |
| 8 | `Backoffice_metricas` | Métricas de API |
| 9 | `Backoffice_usuarios` | Usuarios, roles y tokens |
| 10 | `Backoffice_limpieza` | Temporales, logs y tokens |
| 11 | `Backoffice_respaldos` | Respaldos de BD |

Reglas:

- Se insertan con **M1** (solo `nombre`; la tabla no tiene más columnas).
- SuperAdmin las recibe **todas en el login** (misma rama que Admin). No se guardan
  en `profesionals_has_permisos`.
- El formulario de permisos del frontend **oculta todo prefijo `Backoffice_`**
  (ni profesión ni profesional pueden solicitarlos vía UI).
- `solicitarPermiso`/`aprobarPermiso` del backend **rechazan** secciones
  `Backoffice_*` (guard en T1) — el acceso real lo da el rol, no el grant.

## 5. Migraciones M1-M6 (solo aditivas)

| M | Contenido |
|---|---|
| M1 | `INSERT` de las 11 secciones `Backoffice_*` (idempotente: `insertOrIgnore` por nombre) |
| M2 | `CREATE TABLE audit_logs` |
| M3 | `CREATE TABLE error_logs` |
| M4 | `CREATE TABLE metricas_api_dias` |
| M5 | Índices sobre tablas existentes: `failed_jobs`(failed_at), `jobs`(queue, reserved_at), `personal_access_tokens`(expires_at), `users`(rol), `exports`(estado, created_at) |
| M6 | Índices sobre tablas nuevas: `audit_logs`(user_id, accion, created_at), `error_logs`(level, occurred_at, fingerprint), `metricas_api_dias.fecha` UNIQUE |

Esquemas propuestos:

```
audit_logs:       id, user_id NULL, correo, accion, modelo NULL, modelo_id NULL,
                  descripcion, ip, user_agent, datos JSON NULL, created_at
error_logs:       id, level, message TEXT, fingerprint CHAR(40),
                  context JSON (url, method, user_id, exception, file, line, payload),
                  occurred_at, created_at
metricas_api_dias: id, fecha DATE UNIQUE, solicitudes INT, errores_4xx INT,
                  errores_5xx INT, latencia_promedio_ms INT, updated_at
```

## 6. Los 20 endpoints

Grupo: `Route::middleware(['auth:sanctum', 'check.token.expiration',
'backoffice.access'])->prefix('v1/backoffice')` + `permiso:Backoffice_X` por
ruta + `throttle:30,1` en escrituras.

| # | Método y ruta | Permiso | Descripción |
|---|---|---|---|
| 1 | `GET /salud` | `Backoffice_salud` | PHP/Laravel, uptime, DB, disco, tamaño de log, cola, config resumida (sin secretos), stats de tablas |
| 2 | `GET /errores` | `Backoffice_errores` | Listado paginado de `error_logs` (filtros: fecha, level, fingerprint) |
| 3 | `GET /errores/{id}` | `Backoffice_errores` | Detalle con context JSON |
| 4 | `DELETE /errores` | `Backoffice_errores` | Purga (por rango o nivel) |
| 5 | `GET /trabajos` | `Backoffice_trabajos` | Jobs en cola (pendientes/reservados) + `failed_jobs` recientes |
| 6 | `GET /trabajos/failed/{id}` | `Backoffice_trabajos` | Payload/exception del failed_job |
| 7 | `POST /trabajos/failed/{id}/reintentar` | `Backoffice_trabajos` | Re-despacha el job (solo tipos conocidos: `ExportZipJob`) |
| 8 | `GET /exportaciones` | `Backoffice_exportaciones` | Fila de `exports` + capacidad/concurrencia |
| 9 | `GET /auditoria` | `Backoffice_auditoria` | Listado paginado (filtros: usuario, acción, fecha) |
| 10 | `GET /auditoria/{id}` | `Backoffice_auditoria` | Detalle con `datos` JSON |
| 11 | `GET /metricas` | `Backoffice_metricas` | Serie de `metricas_api_dias` (rango) + resumen |
| 12 | `GET /usuarios` | `Backoffice_usuarios` | Usuarios con rol, empresa, estado y # de tokens activos |
| 13 | `GET /usuarios/{id}` | `Backoffice_usuarios` | Detalle: permisos efectivos, tokens recientes |
| 14 | `POST /usuarios/{id}/tokens/purgar` | `Backoffice_usuarios` | Revoca todos los tokens del usuario |
| 15 | `POST /limpieza/temporales` | `Backoffice_limpieza` | Borra `temp_pdf_*`/`temp_*.pdf` de storage |
| 16 | `POST /limpieza/logs` | `Backoffice_limpieza` | Trunca `laravel.log` conservando últimas N líneas |
| 17 | `POST /limpieza/tokens` | `Backoffice_limpieza` | Poda de `personal_access_tokens` expirados |
| 18 | `GET /respaldos` | `Backoffice_respaldos` | Lista archivos en `storage/app/backups` |
| 19 | `POST /respaldos` | `Backoffice_respaldos` | Crea respaldo (mysqldump si `MYSQLDUMP_PATH` está definido; si no, 501) |
| 20 | `GET /respaldos/{archivo}/descargar` | `Backoffice_respaldos` | Descarga validando nombre (sin path traversal) |

## 7. Seguridad

1. **Doble gate** en cada ruta: `backoffice.access` (rol SuperAdmin) **y**
   `permiso:Backoffice_*` (vía `Acceso::tienePermiso`). Un Admin recibe todos los
   permisos en login pero **falla** `backoffice.access` por rol.
2. `Acceso::esSuperAdmin()` nuevo helper (compara `rol === 'SuperAdmin'`).
3. `superadmin:assign {correo}`: solo CLI, verifica que el usuario exista, pone
   `rol = 'SuperAdmin'`, imprime aviso. **Ningún endpoint HTTP cambia roles.**
4. Guard en `solicitarPermiso`/`aprobarPermiso`: rechazan nombres `Backoffice_*`.
5. Escrituras con `throttle:30,1`; toda acción de escritura genera `audit_logs`.
6. `GET /salud` y `GET /usuarios` filtran valores secretos (nunca `.env`, passwords,
   tokens completos ni `APP_KEY`).
7. Descarga de respaldos: whitelist de nombre de archivo + `realpath` dentro de
   `storage/app/backups`.
8. `error_logs.context.payload` recorta a 2 KB y enmascara claves `password*`,
   `token`, `authorization`.

## 8. Login — rama SuperAdmin (plan Seguridad §8)

En `UserController::login`, la rama que hoy hace `Admin → todas las secciones`
pasa a `in_array($user->rol, ['Admin', 'SuperAdmin'])`. SuperAdmin recibe todas
las secciones (incluidas `Backoffice_*`). El resto de la lógica (token, expiración
16 h, poda de tokens expirados ya presente) no cambia.

## 9. Frontend

- Rutas Nuxt: `pages/Backoffice/*.vue` (sin middleware de ruta — el proyecto no
  usa `middleware/`; gating por componente).
- Guard: componente/`v-if` con `usePermisos` → `rol === 'SuperAdmin'` y
  `hasPermiso('Backoffice_view')`; si no, `<Restringido />`.
- `data/permisos.js`: `esPermisoOculto()` **y** filtro de formulario añaden el
  prefijo `Backoffice_` (no aparecen en "Solicitar permisos" ni en el form de
  profesiones).
- Menú lateral con las 11 secciones; pantallas T10-T12.
- Tabla `data/Buttons.js` / navegación: agregar entradas solo para SuperAdmin.

## 10. Tareas T1-T13

| T | Alcance | Entregables |
|---|---|---|
| **T1** | **Fundación SuperAdmin** | M1 (secciones), `BackofficeAccess` + `Permiso` (aliases en Kernel), `Acceso::esSuperAdmin()`, comando `superadmin:assign`, rama SuperAdmin en login, guard `Backoffice_*` en solicitar/aprobar, grupo base de rutas `/v1/backoffice/*`, ocultar prefijo `Backoffice_` en formularios FE, tests |
| **T2** | Monitor de errores | M3, modelo `ErrorLog`, captura en `Handler::reportable`, endpoints 2-4, tests |
| **T3** | Monitor de trabajos | Endpoints 5-8 (cola, failed, reintento `ExportZipJob`, exportaciones), tests |
| **T4** | Auditoría | M2, modelo + helper `Audit::log()`, hooks en acciones de escritura del backoffice + login/aprobarPermiso, endpoints 9-10, tests |
| **T5** | Métricas | M4, middleware `MetricasApi` (contadores en cache), comando `metricas:flush` en schedule, endpoint 11, tests |
| **T6** | Salud y BD | Endpoint 1 (health + config allowlist + stats de tablas), tests |
| **T7** | Usuarios y tokens | Endpoints 12-14, tests |
| **T8** | Limpieza | Endpoints 15-17 + audit, tests |
| **T9** | Respaldos | Endpoints 18-20 + config `MYSQLDUMP_PATH`, tests |
| **T10** | FE fundación | Layout `pages/Backoffice`, nav con 11 secciones, guard SuperAdmin, ocultar prefijo en forms |
| **T11** | FE monitores | Pantallas: Errores, Trabajos+Exportaciones, Auditoría, Métricas |
| **T12** | FE gestión | Pantallas: Usuarios, Limpieza, Respaldos, Salud+BD |
| **T13** | Cierre | Suite backend verde, `npm run test:run`, `npm run build`, `manual_tecnico.txt` §19 Backoffice, notas en plan |

## 11. Fuera de alcance (deudas conocidas)

- Corregir mensajes 403 enumeradores de usuarios (deuda T0 anotada).
- Validación de aprobador en `aprobarPermiso` más allá del guard `Backoffice_*`.
- Rotación de `laravel.log` vía Monolog (la limpieza manual la cubre T8;
  rotación automática puede ser follow-up).
- Cambiar `LOG_LEVEL` de debug a warning (recomendado, decisión del operador).

## 12. Verificación

- Backend: `php -l` por archivo; `C:\xampp\php\php.exe vendor\bin\phpunit
  --testsuite Feature` (baseline: 87 tests, 3 fallos preexistentes en LoginTest/
  RateLimitingTest — no aumentar ese conteo).
- Frontend: `npm run test:run` (baseline 303), `npm run build`.
- Manual: `superadmin:assign` en dev → login → menú Backoffice visible; con rol
  Admin → 403 en `/v1/backoffice/salud`.

## 13. Supuestos a confirmar con la aprobación

1. Nombres de las 11 secciones (tabla de §4) y de los 20 endpoints (§6).
2. SuperAdmin **no** se crea por HTTP bajo ninguna circunstancia (solo CLI).
3. Los respaldos usan `mysqldump` externo configurable (`MYSQLDUMP_PATH`); si no
   está definido el endpoint responde 501.
4. Métricas diarias agregadas (sin desglose por ruta) — `metricas_api_dias` es
   por día, no por día+ruta.
5. El reintento de `failed_jobs` solo soporta `ExportZipJob` (único job propio);
   otros tipos responden 400.
6. `Backoffice_*` oculto del formulario de permisos y bloqueado en
   `solicitarPermiso`/`aprobarPermiso`.

---

## 14. Notas de ejecucion (cierre T13)

- **Estado: T1-T13 completados** (backend + frontend + manual �19).
- Backend verificado con php vendor/bin/phpunit --testsuite Feature:
  143 tests; unicos fallos = los 3 preexistentes de baseline (LoginTest x2,
  RateLimitingTest). Frontend: 
pm run test:run y 
pm run build verdes.
- Desviaciones menores sobre el plan:
  - Los indices M6 de tablas nuevas (error_logs, audit_logs,
    metricas_api_dias) se incluyeron en sus propias migraciones CREATE
    en vez de una M6 separada; M5 (indices sobre tablas existentes)
    queda pendiente como mejora de rendimiento.
  - metricas:flush consolida por defecto el dia anterior; acepta argumento
    opcional fecha Y-m-d.
  - El reintento de failed_jobs verifica commandName antes de unserialize
    (solo ExportZipJob), y tambien confirma que la exportacion exista.
  - Descarga de respaldos desde el FE usa fetch + blob (el token Bearer no
    viaja en <a href>).
