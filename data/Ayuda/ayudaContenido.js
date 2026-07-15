export const ayudaSecciones = [
    {
        slug: 'inicio-sesion',
        titulo: 'Inicio de Sesion',
        icono: 'fa-solid fa-right-to-bracket',
        color: 'bg-blue-500',
        colorClaro: 'bg-blue-100 dark:bg-blue-900/30',
        ruta: '/',
        descripcion: 'Accede a tu cuenta de forma segura',
        contenido: [
            {
                tipo: 'paso',
                titulo: 'Abrir el navegador',
                texto: 'Ingresa a la direccion del sistema Santa Isabel en tu navegador preferido (Chrome, Firefox o Edge).',
                icono: 'fa-solid fa-globe'
            },
            {
                tipo: 'paso',
                titulo: 'Ingresar tu correo',
                texto: 'Escribe tu correo electronico en el campo designado. El sistema validara si es tu primer ingreso.',
                icono: 'fa-solid fa-envelope'
            },
            {
                tipo: 'paso',
                titulo: 'Escribir tu contrasena',
                texto: 'Ingresa tu contrasena. Si es tu primer ingreso, el sistema te pedira que la cambies primero.',
                icono: 'fa-solid fa-lock'
            },
            {
                tipo: 'paso',
                titulo: 'Seleccionar empresa',
                texto: 'Si tu institucion tiene varias sedes, usa el selector de empresa para elegir la correcta.',
                icono: 'fa-solid fa-building'
            },
            {
                tipo: 'paso',
                titulo: 'Hacer clic en Iniciar Sesion',
                texto: 'Presiona el boton y espera a que se carguen tus datos. Seras redirigido segun tu rol.',
                icono: 'fa-solid fa-right-to-bracket'
            }
        ],
        consejos: [
            'Si es tu primer ingreso, revisa tu correo para obtener el codigo de verificacion.',
            'La contrasena debe ser segura: combina letras, numeros y caracteres especiales.',
            'Si olvidaste tu contrasena, usa el enlace "Olvido su contrasena?" en la pantalla de login.'
        ]
    },
    {
        slug: 'dashboard',
        titulo: 'Panel Principal (Dashboard)',
        icono: 'fa-solid fa-gauge-high',
        color: 'bg-emerald-500',
        colorClaro: 'bg-emerald-100 dark:bg-emerald-900/30',
        ruta: '/Home',
        descripcion: 'Tu centro de control principal',
        contenido: [
            {
                tipo: 'info',
                titulo: 'Vista del Administrador',
                texto: 'El administrador ve estadisticas generales: pacientes totales, consultas del dia, citas programadas y RIPS pendientes. Tambien tiene acceso a Acciones Rapidas para crear pacientes, buscar historias y agendar citas.',
                icono: 'fa-solid fa-user-shield'
            },
            {
                tipo: 'info',
                titulo: 'Vista del Profesional',
                texto: 'El profesional ve una tarjeta de bienvenida con su nombre y profesion, sus proximas citas y Acciones Rapidas para agendar, ver pacientes y solicitar permisos.',
                icono: 'fa-solid fa-user-doctor'
            },
            {
                tipo: 'paso',
                titulo: 'Acciones Rapidas del Admin',
                texto: 'Desde el dashboard puedes: Nuevo Paciente (registra un paciente), Buscar Historia (va al historial clinico), Agendar (crea una cita) y Exportar RIPS.',
                icono: 'fa-solid fa-bolt'
            },
            {
                tipo: 'paso',
                titulo: 'Agenda de Pendientes',
                texto: 'Muestra las proximas citas con hora, paciente, servicio y motivo. Haz clic en "Ver Agenda" para ir al calendario completo.',
                icono: 'fa-solid fa-calendar-check'
            }
        ],
        links: [
            { texto: 'Ir a Pacientes', ruta: '/Usuarios', icono: 'fa-solid fa-user' },
            { texto: 'Ir a Citas', ruta: '/Usuarios/Citas', icono: 'fa-solid fa-calendar' },
            { texto: 'Ir a Historial', ruta: '/Historial', icono: 'fa-solid fa-file-medical' }
        ],
        consejos: [
            'El dashboard se adapta automaticamente segun tu rol (Admin o Profesional).',
            'Los colores de las tarjetas de estadisticas indican la tendencia: verde para aumento, rojo para disminucion.'
        ]
    },
    {
        slug: 'pacientes',
        titulo: 'Gestion de Pacientes',
        icono: 'fa-solid fa-user-injured',
        color: 'bg-violet-500',
        colorClaro: 'bg-violet-100 dark:bg-violet-900/30',
        ruta: '/Usuarios',
        descripcion: 'Registrar, buscar y administrar pacientes',
        contenido: [
            {
                tipo: 'paso',
                titulo: 'Ver lista de pacientes',
                texto: 'Al entrar al modulo se muestra una tabla con todos los pacientes. Puedes filtrar por Ciudad o EPS, y exportar a Excel.',
                icono: 'fa-solid fa-list',
                video: '/manual/tablaPacientes.mp4'
            },
            {
                tipo: 'paso',
                titulo: 'Registrar nuevo paciente',
                texto: 'Haz clic en el boton "+" en la tabla. Se abre un formulario paso a paso (Wizard) donde completas: datos personales, direccion, EPS y convenio.',
                icono: 'fa-solid fa-user-plus'
            },
            {
                tipo: 'paso',
                titulo: 'Ver o modificar paciente',
                texto: 'Haz clic en los tres puntos (acciones) a la derecha del paciente. Selecciona "Ver" o "Editar". Modifica los datos y guarda.',
                icono: 'fa-solid fa-pen',
                video: '/manual/editarPaciente.mp4'
            },
            {
                tipo: 'paso',
                titulo: 'Desactivar o eliminar paciente',
                texto: 'Haz clic en los tres puntos (acciones) a la derecha del paciente. Selecciona "Eliminar". Luego debes confirmar la accion dando clic en "Si, eliminar".',
                icono: 'fa-solid fa-pen',
                video: '/manual/eliminarPaciente.mp4'
            },
            {
                tipo: 'info',
                titulo: 'Pestanas disponibles',
                texto: 'El modulo tiene 4 pestanas: Pacientes (tabla principal), EPS (gestion de Entidades Promotoras), Convenios (convenios medicos) y Kardex Medico.',
                icono: 'fa-solid fa-folder-open'
            },
            {
                tipo: 'alerta',
                titulo: 'Datos No Enviados',
                texto: 'Si hay registros que no se pudieron enviar al servidor, aparecera un aviso amarillo arriba de la tabla. Dirigete a la seccion "No Enviados" para sincronizar.',
                icono: 'fa-solid fa-triangle-exclamation'
            }
        ],
        links: [
            { texto: 'Gestionar EPS', ruta: '/Usuarios', icono: 'fa-solid fa-hospital' },
            { texto: 'Gestionar Convenios', ruta: '/Usuarios', icono: 'fa-solid fa-handshake' }
        ],
        consejos: [
            'El sistema valida automaticamente que el documento no este duplicado.',
            'Puedes buscar un paciente escribiendo su nombre o numero de documento en el buscador de la tabla.'
        ]
    },
    {
        slug: 'profesionales',
        titulo: 'Gestion de Profesionales',
        icono: 'fa-solid fa-user-doctor',
        color: 'bg-pink-500',
        colorClaro: 'bg-pink-100 dark:bg-pink-900/30',
        ruta: '/Usuarios/Profesional',
        descripcion: 'Administrar profesionales de la salud',
        contenido: [
            {
                tipo: 'paso',
                titulo: 'Ver profesionales',
                texto: 'La tabla muestra nombre, documento, ciudad, zona, profesion y estado. Puedes filtrar por Ciudad y Zona.',
                icono: 'fa-solid fa-list',
                video: '/manual/tablaProfesional.mp4'
            },
            {
                tipo: 'paso',
                titulo: 'Registrar profesional',
                texto: 'Haz clic en "Agregar" y completa el formulario: datos personales, profesion, municipio laboral y zona.',
                icono: 'fa-solid fa-user-plus',
                video: '/manual/nuevoProfesional.mp4'
            },
            {
                tipo: 'paso',
                titulo: 'Ver o modificar profesional',
                texto: 'Haz clic en los tres puntos (acciones) a la derecha del paciente. Selecciona "Ver" o "Editar". Modifica los datos y guarda.',
                icono: 'fa-solid fa-pen',
                video: '/manual/editarProfesional.mp4'
            },
            {
                tipo: 'paso',
                titulo: 'Desactivar o eliminar profesional',
                texto: 'Haz clic en los tres puntos (acciones) a la derecha del profesional. Selecciona "Eliminar". Luego debes confirmar la accion dando clic en "Si, eliminar".',
                icono: 'fa-solid fa-pen',
                video: '/manual/eliminarProfesional.mp4'
            },
            {
                tipo: 'info',
                titulo: 'Pestanas del modulo',
                texto: 'Tres pestanas: Profesionales (tabla), Profesiones (lista de profesiones) y Permisos (asignar/quitar permisos a cada profesional).',
                icono: 'fa-solid fa-folder-open'
            },
            {
                tipo: 'paso',
                titulo: 'Gestionar permisos',
                texto: 'Desde la pestana "Permisos" selecciona una profesion y asignale los permisos para acceder a diferentes secciones del sistema.',
                icono: 'fa-solid fa-lock',
                video: '/manual/permisosProfesional.mp4'
            }
        ],
        consejos: [
            'Los permisos determinan que puede ver y hacer cada profesional en el sistema.',
            'Un profesional sin permisos no podra acceder a ningun modulo.'
        ]
    },
    {
        slug: 'citas',
        titulo: 'Gestion de Citas',
        icono: 'fa-solid fa-calendar-check',
        color: 'bg-amber-500',
        colorClaro: 'bg-amber-100 dark:bg-amber-900/30',
        ruta: '/Usuarios/Citas',
        descripcion: 'Agendar y administrar citas medicas',
        contenido: [
            {
                tipo: 'paso',
                titulo: 'Ver citas del dia',
                texto: 'Al entrar se muestra el calendario con las citas de hoy. Cada cita indica hora, paciente, servicio y motivo.',
                icono: 'fa-solid fa-calendar-day'
            },
            {
                tipo: 'paso',
                titulo: 'Cambiar a vista en lista',
                texto: 'Haz clic en "En Lista" para ver las citas en formato de tabla con filtros por servicio, estado, profesional, mes y año.',
                icono: 'fa-solid fa-table-list'
            },
            {
                tipo: 'paso',
                titulo: 'Crear una cita',
                texto: 'Haz clic en "Agendar". Selecciona fecha, hora, paciente, profesional, servicio y escribe el motivo. Guarda la cita.',
                icono: 'fa-solid fa-plus'
            },
            {
                tipo: 'info',
                titulo: 'Acciones segun estado',
                texto: 'Cita Inactiva: Editar, Realizar o Eliminar. Cita Realizada: Ver Observacion. Cita Cancelada: Ver Motivo de cancelacion.',
                icono: 'fa-solid fa-circle-info'
            }
        ],
        links: [
            { texto: 'Ver Dashboard', ruta: '/Home', icono: 'fa-solid fa-gauge-high' },
            { texto: 'Gestionar Profesionales', ruta: '/Usuarios/Profesional', icono: 'fa-solid fa-user-doctor' }
        ],
        consejos: [
            'Las citas canceladas conservan el motivo de cancelacion para referencia futura.',
            'Puedes sincronizar los datos usando el boton de nube en la esquina superior.'
        ]
    },
    {
        slug: 'historial',
        titulo: 'Historial Clinico',
        icono: 'fa-solid fa-file-medical',
        color: 'bg-red-500',
        colorClaro: 'bg-red-100 dark:bg-red-900/30',
        ruta: '/Historial',
        descripcion: 'Consultar y gestionar historias clinicas',
        contenido: [
            {
                tipo: 'paso',
                titulo: 'Seleccionar paciente',
                texto: 'En la tabla de historias clinicas, haz clic en la flecha (->) del paciente que deseas consultar.',
                icono: 'fa-solid fa-arrow-right'
            },
            {
                tipo: 'info',
                titulo: 'Panel del historial',
                texto: 'El historial tiene 3 secciones principales: Registros (tablas clinicas), Evolucion (graficos) e Inventario (productos asignados al paciente).',
                icono: 'fa-solid fa-folder-open'
            },
            {
                tipo: 'paso',
                titulo: 'Ver registros clinicos',
                texto: 'Dentro de "Registros" hay 8 pestanas: Notas, Evoluciones, Terapias, Consultas, Social, Diagnosticos, Medicamentos y Tratamientos.',
                icono: 'fa-solid fa-table-list'
            },
            {
                tipo: 'paso',
                titulo: 'Exportar a PDF o Excel',
                texto: 'Desde la lista de historias, haz clic en "Exportar" y selecciona si quieres exportar todos los registros o por servicio especifico.',
                icono: 'fa-solid fa-file-pdf'
            },
            {
                tipo: 'paso',
                titulo: 'Ver grafico de evolucion',
                texto: 'Haz clic en "Evolucion" en el panel de navegacion para ver el grafico de IMC del paciente a lo largo del tiempo.',
                icono: 'fa-solid fa-chart-line'
            },
            {
                tipo: 'paso',
                titulo: 'Ver inventario asignado',
                texto: 'Haz clic en "Inventario" para ver los insumos y productos asignados al paciente con sus movimientos.',
                icono: 'fa-solid fa-boxes-stacked'
            }
        ],
        links: [
            { texto: 'Gestionar Insumos', ruta: '/Historial/Insumos', icono: 'fa-solid fa-pills' },
            { texto: 'Ver Citas', ruta: '/Usuarios/Citas', icono: 'fa-solid fa-calendar' }
        ],
        consejos: [
            'Cada pestana de registros tiene filtros por servicio, profesional, mes y año.',
            'Los registros no enviados se muestran arriba de la tabla con un boton "Enviar".',
            'El grafico de IMC se actualiza automaticamente cuando agregas un nuevo examen fisico.'
        ]
    },
    {
        slug: 'insumos',
        titulo: 'Inventario e Insumos',
        icono: 'fa-solid fa-boxes-stacked',
        color: 'bg-orange-500',
        colorClaro: 'bg-orange-100 dark:bg-orange-900/30',
        ruta: '/Historial/Insumos',
        descripcion: 'Control de inventario y movimientos',
        contenido: [
            {
                tipo: 'info',
                titulo: 'Pestanas del modulo',
                texto: 'Tres pestanas: Inventario (lista de insumos), Movimientos (entradas y salidas) y Prestaciones (timeline de insumos prestados).',
                icono: 'fa-solid fa-folder-open'
            },
            {
                tipo: 'paso',
                titulo: 'Ver inventario',
                texto: 'La tabla muestra nombre, si es prestable, tipo y stock. El stock se colorea: verde (>9), amarillo (2-9), rojo (1 o menos).',
                icono: 'fa-solid fa-box'
            },
            {
                tipo: 'paso',
                titulo: 'Agregar insumo',
                texto: 'Haz clic en "Agregar" y completa el formulario con nombre, categoria, stock y si es prestable.',
                icono: 'fa-solid fa-plus'
            },
            {
                tipo: 'paso',
                titulo: 'Registrar movimiento',
                texto: 'Selecciona un insumo y haz clic en "Agregar Movimiento". Registra la entrada o salida con el paciente y profesional relacionado.',
                icono: 'fa-solid fa-right-left'
            }
        ],
        consejos: [
            'El icono de stock en rojo indica que el insumo esta por agotarse.',
            'Los movimientos se vinculan automaticamente al paciente y profesional.'
        ]
    },
    {
        slug: 'empresa',
        titulo: 'Configuracion de Empresa',
        icono: 'fa-solid fa-building',
        color: 'bg-teal-500',
        colorClaro: 'bg-teal-100 dark:bg-teal-900/30',
        ruta: '/Empresas/Configuracion',
        descripcion: 'Configurar datos de la institucion',
        contenido: [
            {
                tipo: 'paso',
                titulo: 'Acceder a configuracion',
                texto: 'Ve a Empresas > Configuracion en el menu lateral. Solo los administradores con permisos pueden modificar estos datos.',
                icono: 'fa-solid fa-cog'
            },
            {
                tipo: 'info',
                titulo: 'Secciones de configuracion',
                texto: 'Cuatro formularios: Datos de la Empresa (nombre, NIT, direccion), Datos del Software, Datos de Nomina y Documentos Equivalentes.',
                icono: 'fa-solid fa-list-check'
            },
            {
                tipo: 'paso',
                titulo: 'Modificar datos',
                texto: 'Completa o actualiza los campos de cada formulario. Los cambios se guardan inmediatamente en el servidor.',
                icono: 'fa-solid fa-pen'
            }
        ],
        consejos: [
            'Asegurate de que los datos de la empresa esten correctos, ya que se usan en facturacion y reportes.',
            'Los documentos equivalentes se usan para configurar tipos de documentos admitidos.'
        ]
    },
    {
        slug: 'servicios-codigos',
        titulo: 'Servicios, CIE-10 y Vademecum',
        icono: 'fa-solid fa-file-medical',
        color: 'bg-indigo-500',
        colorClaro: 'bg-indigo-100 dark:bg-indigo-900/30',
        ruta: '/Empresas',
        descripcion: 'Gestionar servicios y codigos medicos',
        contenido: [
            {
                tipo: 'info',
                titulo: 'Pestanas disponibles',
                texto: 'Tres pestanas: Servicios (servicios medicos), CIE-10 (codigos de enfermedades) y Vademecums (catalogo de medicamentos).',
                icono: 'fa-solid fa-folder-open'
            },
            {
                tipo: 'paso',
                titulo: 'Gestionar Servicios',
                texto: 'Cada servicio tiene nombre, plantilla asociada y estado. Puedes ver la plantilla de cada servicio con "Ver Plantilla".',
                icono: 'fa-solid fa-briefcase'
            },
            {
                tipo: 'paso',
                titulo: 'Gestionar CIE-10',
                texto: 'Catalogo de codigos de enfermedades. Cada registro tiene codigo y nombre. Puedes agregar, editar y exportar a Excel.',
                icono: 'fa-solid fa-file-lines'
            },
            {
                tipo: 'paso',
                titulo: 'Gestionar Vademecum',
                texto: 'Catalogo de medicamentos y productos. Muestra expediente, producto, titular, registro sanitario y estado.',
                icono: 'fa-solid fa-capsules'
            }
        ],
        consejos: [
            'Las plantillas de servicios determinan el tipo de formulario que se usa al crear historias clinicas.',
            'El CIE-10 se usa para los diagnosticos en las historias clinicas.',
            'El Vademecum se usa para prescribir medicamentos a los pacientes.'
        ]
    },
    {
        slug: 'usuarios-admin',
        titulo: 'Usuarios Administradores',
        icono: 'fa-solid fa-users-gear',
        color: 'bg-cyan-500',
        colorClaro: 'bg-cyan-100 dark:bg-cyan-900/30',
        ruta: '/Empresas/Usuarios',
        descripcion: 'Administrar usuarios del sistema',
        contenido: [
            {
                tipo: 'paso',
                titulo: 'Ver administradores',
                texto: 'La tabla muestra documento, nombre, celular, correo y estado de cada administrador registrado.',
                icono: 'fa-solid fa-list'
            },
            {
                tipo: 'paso',
                titulo: 'Crear administrador',
                texto: 'Haz clic en "Agregar" y completa el formulario con los datos del nuevo administrador.',
                icono: 'fa-solid fa-user-plus'
            },
            {
                tipo: 'paso',
                titulo: 'Editar o eliminar',
                texto: 'Haz clic en los tres puntos del administrador. Selecciona "Editar" para modificar o "Eliminar" para desactivar.',
                icono: 'fa-solid fa-pen-to-square'
            }
        ],
        consejos: [
            'Al eliminar un administrador, este se desactiva pero no se borra del sistema.',
            'El nuevo administrador debera cambiar su contrasena en el primer ingreso.'
        ]
    },
    {
        slug: 'permisos',
        titulo: 'Sistema de Permisos',
        icono: 'fa-solid fa-shield-halved',
        color: 'bg-rose-500',
        colorClaro: 'bg-rose-100 dark:bg-rose-900/30',
        ruta: null,
        descripcion: 'Control de acceso por roles y permisos',
        contenido: [
            {
                tipo: 'info',
                titulo: 'Como funcionan los permisos',
                texto: 'Cada modulo tiene permisos de tipo: _view (ver), _get (obtener datos), _post (crear), _put (modificar), _delete (eliminar). Los permisos se asignan desde Profesionales > Pestana Permisos.',
                icono: 'fa-solid fa-circle-info'
            },
            {
                tipo: 'paso',
                titulo: 'Asignar permisos (Admin)',
                texto: 'Ve a Usuarios > Profesionales > Pestana "Permisos". Selecciona un profesional y marca las secciones a las que debe tener acceso.',
                icono: 'fa-solid fa-user-lock'
            },
            {
                tipo: 'paso',
                titulo: 'Solicitar permisos (Profesional)',
                texto: 'Desde tu dashboard, haz clic en "Solicitar Permisos". Selecciona las secciones que necesitas y envia la solicitud al administrador.',
                icono: 'fa-solid fa-paper-plane'
            },
            {
                tipo: 'paso',
                titulo: 'Aprobar permisos (Admin)',
                texto: 'El administrador recibe un enlace por correo. Al abrirlo, el sistema aprueba automaticamente el permiso.',
                icono: 'fa-solid fa-check-circle'
            }
        ],
        consejos: [
            'Un profesional sin permisos no puede ver ningun modulo del sistema.',
            'Los permisos temporales tienen una fecha de expiracion.',
            'Si no puedes acceder a un modulo, probablemente no tienes los permisos necesarios.'
        ]
    },
    {
        slug: 'offline',
        titulo: 'Modo Offline',
        icono: 'fa-solid fa-wifi',
        color: 'bg-slate-500',
        colorClaro: 'bg-slate-100 dark:bg-slate-900/30',
        ruta: null,
        descripcion: 'Trabajar sin conexion a internet',
        contenido: [
            {
                tipo: 'info',
                titulo: 'Como funciona',
                texto: 'El sistema puede funcionar sin internet gracias a la tecnologia PWA y IndexedDB. Los datos se guardan localmente y se sincronizan cuando vuelve la conexion.',
                icono: 'fa-solid fa-circle-info'
            },
            {
                tipo: 'paso',
                titulo: 'Trabajar offline',
                texto: 'Si pierdes la conexion, puedes seguir creando y modificando registros normalmente. Los datos se guardan en tu navegador.',
                icono: 'fa-solid fa-cloud-arrow-down'
            },
            {
                tipo: 'paso',
                titulo: 'Sincronizar datos',
                texto: 'Cuando vuelva la conexion, busca los avisos amarillos de "Datos No Enviados" y usa los botones "Enviar" para sincronizar.',
                icono: 'fa-solid fa-cloud-arrow-up'
            },
            {
                tipo: 'alerta',
                titulo: 'Limitaciones',
                texto: 'No puedes iniciar sesion sin conexion. Algunos datos podrian no estar actualizados. La sincronizacion puede tardar dependiendo de la cantidad de registros.',
                icono: 'fa-solid fa-triangle-exclamation'
            }
        ],
        consejos: [
            'El sistema se instala como aplicacion (PWA) desde el navegador para mejor experiencia offline.',
            'Revisa periodicamente los "Datos No Enviados" para asegurar que todo este sincronizado.'
        ]
    },
    {
        slug: 'preguntas-frecuentes',
        titulo: 'Preguntas Frecuentes',
        icono: 'fa-solid fa-circle-question',
        color: 'bg-gray-500',
        colorClaro: 'bg-gray-100 dark:bg-gray-900/30',
        ruta: null,
        descripcion: 'Respuestas a dudas comunes',
        contenido: [
            {
                tipo: 'faq',
                titulo: 'Olvide mi contrasena',
                texto: 'Usa la opcion "Olvido su contrasena?" en la pantalla de login. Recibiras un codigo por correo electronico para crear una nueva contrasena.',
                icono: 'fa-solid fa-key'
            },
            {
                tipo: 'faq',
                titulo: 'No puedo acceder a un modulo',
                texto: 'Si dice "Acceso Restringido", no tienes los permisos necesarios. Solicita permisos al administrador desde tu dashboard.',
                icono: 'fa-solid fa-lock'
            },
            {
                tipo: 'faq',
                titulo: 'Los datos no se guardan',
                texto: 'Verifica tu conexion a internet. Si estas offline, los datos se guardan localmente y se sincronizan cuando vuelva la conexion.',
                icono: 'fa-solid fa-cloud'
            },
            {
                tipo: 'faq',
                titulo: 'Puedo usar el sistema en el celular',
                texto: 'Si. El sistema es compatible con dispositivos moviles y puede instalarse como aplicacion (PWA) desde el navegador.',
                icono: 'fa-solid fa-mobile-screen'
            },
            {
                tipo: 'faq',
                titulo: 'Como exporto datos a Excel',
                texto: 'En las tablas que lo permitan, haz clic en el boton de Excel (icono de hoja de calculo) en la esquina superior derecha de la tabla.',
                icono: 'fa-solid fa-file-excel'
            },
            {
                tipo: 'faq',
                titulo: 'Como cambio mi contrasena',
                texto: 'El cambio de contrasena se realiza desde el perfil de usuario o cuando el administrador lo indica en el primer ingreso.',
                icono: 'fa-solid fa-pen'
            }
        ]
    }
]

export const ayudaBusquedaData = ayudaSecciones.flatMap(seccion => {
    const items = [{
        seccion: seccion.titulo,
        slug: seccion.slug,
        icono: seccion.icono,
        color: seccion.color,
        ruta: seccion.ruta,
        texto: seccion.descripcion,
        tipo: 'seccion'
    }]

    seccion.contenido?.forEach(item => {
        items.push({
            seccion: seccion.titulo,
            slug: seccion.slug,
            icono: item.icono || seccion.icono,
            color: seccion.color,
            ruta: seccion.ruta,
            texto: `${item.titulo} - ${item.texto}`,
            tipo: item.tipo,
            titulo: item.titulo
        })
    })

    seccion.consejos?.forEach(consejo => {
        items.push({
            seccion: seccion.titulo,
            slug: seccion.slug,
            icono: 'fa-solid fa-lightbulb',
            color: seccion.color,
            ruta: seccion.ruta,
            texto: consejo,
            tipo: 'consejo'
        })
    })

    seccion.links?.forEach(link => {
        items.push({
            seccion: seccion.titulo,
            slug: seccion.slug,
            icono: link.icono,
            color: seccion.color,
            ruta: link.ruta,
            texto: `${link.texto} - Navegacion directa`,
            tipo: 'link',
            titulo: link.texto
        })
    })

    return items
})
