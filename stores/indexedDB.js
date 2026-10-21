import { defineStore } from "pinia";

export const useIndexedDBStore = defineStore("indexeddb", {
    id: 'idexeddb',
    // state
    state: () => {
        return {
            bd: null,
            almacen: '',
            aguardar: {},
            respuesta: null,
            EXPECTED_VERSION: 6,
            _inicializando: null
        };
    },
    actions: {
        async initialize() {
            // Evita aperturas concurrentes (varias lecturas en paralelo comparten una sola)
            if (this.bd) return this.bd
            if (this._inicializando) return this._inicializando

            this._inicializando = new Promise((resolve, reject) => {
                const indexedDB = window.indexedDB || window.webkitIndexedDB;
                const request = indexedDB.open('db-thesalus', this.EXPECTED_VERSION)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result
                    const tx = event.target.transaction

                    // Idempotente: crea store/indice solo si no existen (BDs viejas)
                    const crear = (nombre, opciones) => {
                        if (db.objectStoreNames.contains(nombre)) return tx.objectStore(nombre)
                        return db.createObjectStore(nombre, opciones)
                    }
                    const indice = (objStore, nombre, campo) => {
                        if (!objStore.indexNames.contains(nombre)) {
                            objStore.createIndex(nombre, campo, { unique: false })
                        }
                    }

                    const stores = [
                        'Paciente',
                        'Profesional',
                        'InformacionUser',
                        'Diagnosticos',
                        'DiagnosticosCIF',
                        'Antecedentes',
                        'Enfermedad',
                        'HistoriaClinica',
                        'ExamenFisico',
                        'Analisis',
                        'Plan_manejo_medicamentos',
                        'Plan_manejo_procedimientos',
                        'Plan_manejo_insumos',
                        'Plan_manejo_equipos',
                        'Cita',
                        'Empresa',
                        'Software',
                        'Facturacion',
                        'Nota',
                        'Descripcion_nota',
                        'EPS',
                        'Profesion',
                        'Terapia',
                        'Servicio',
                        'Insumo',
                        'Movimiento',
                        'Kardex',
                        'CeldaColors',
                        'Historial_cambio_sonda',
                        'Convenio',
                        'Historial_prestaciones',
                        'Cie10',
                        'Vadecum'
                    ]
                    const pacientes = crear('Paciente', { keyPath: 'id', autoIncrement: true });
                    indice(pacientes, "buscapaciente", "id");

                    const medicos = crear('Profesional', { keyPath: 'id', autoIncrement: true });
                    indice(medicos, "buscaprofesional", "id");

                    const usersInfo = crear('InformacionUser', { keyPath: 'id', autoIncrement: true });
                    indice(usersInfo, "buscaaInformacionUser", "id");

                    const diagnostico = crear('Diagnosticos', { keyPath: 'id', autoIncrement: true });
                    indice(diagnostico, "buscadiagnostico", "id_diagnostico");

                    const diagnosticoCIF = crear('DiagnosticosCIF', { keyPath: 'id', autoIncrement: true });
                    indice(diagnosticoCIF, "buscadiagnostico", "id_diagnostico");

                    const antecedentes = crear('Antecedentes', { keyPath: 'id', autoIncrement: true });
                    indice(antecedentes, "buscaantecedentes", "id_antecedente");

                    const enfermedadActual = crear('Enfermedad', { keyPath: 'id', autoIncrement: true });
                    indice(enfermedadActual, "buscaenfermedadActual", "enfermedad");

                    const historiaClinica = crear('HistoriaClinica', { keyPath: 'id', autoIncrement: true });
                    indice(historiaClinica, "buscahistoriaClinica", "id_historiaClinica");

                    const examenFisico = crear('ExamenFisico', { keyPath: 'id', autoIncrement: true });
                    indice(examenFisico, "buscaexamenFisico", "id");

                    const analisis = crear('Analisis', { keyPath: 'id', autoIncrement: true });
                    indice(analisis, "buscaanalisis", "id");

                    const planManejoMedicamentos = crear('Plan_manejo_medicamentos', { keyPath: 'id', autoIncrement: true });
                    indice(planManejoMedicamentos, "buscaMedicamentos", "descripcion");

                    const planManejoProcedimientos = crear('Plan_manejo_procedimientos', { keyPath: 'id', autoIncrement: true });
                    indice(planManejoProcedimientos, "buscaProcedimientos", "descripcion");

                    const planManejoInsumos = crear('Plan_manejo_insumos', { keyPath: 'id', autoIncrement: true });
                    indice(planManejoInsumos, "buscainsumos", "nombre");

                    const planManejoEquipos = crear('Plan_manejo_equipos', { keyPath: 'id', autoIncrement: true });
                    indice(planManejoEquipos, "buscaequipos", "descripcion");

                    const citas = crear('Cita', { keyPath: 'id' });
                    indice(citas, "buscaCita", "id");

                    crear('KeyCitas', { keyPath: 'key' });
                    crear('KeyAnalisis', { keyPath: 'key' });

                    const empresa = crear('Empresa', { keyPath: 'no_identificacion' });
                    indice(empresa, "buscaEmpresa", "no_identificacion");

                    const software = crear('Software', { keyPath: 'id', autoIncrement: true });
                    indice(software, "buscaSoftware", "id");

                    const facturacion = crear('Facturacion', { keyPath: 'id', autoIncrement: true });
                    indice(facturacion, "buscaFacturacion", "id");

                    const nota = crear('Nota', { keyPath: 'id', autoIncrement: true });
                    indice(nota, "buscaNota", "id");

                    const descripcionNota = crear('Descripcion_nota', { keyPath: 'id', autoIncrement: true });
                    indice(descripcionNota, "buscaNota", "id");

                    const eps = crear('EPS', { keyPath: 'id', autoIncrement: true });
                    indice(eps, "buscaEPS", "id");

                    const profesion = crear('Profesion', { keyPath: 'id', autoIncrement: true });
                    indice(profesion, "buscaProfesion", "id");

                    const terapia = crear('Terapia', { keyPath: 'id', autoIncrement: true });
                    indice(terapia, "buscaTerapia", "id");

                    const servicio = crear('Servicio', { keyPath: 'id', autoIncrement: true });
                    indice(servicio, "buscaServicio", "id");

                    const insumo = crear('Insumo', { keyPath: 'id', autoIncrement: true });
                    indice(insumo, "buscaInsumo", "id");

                    const movimiento = crear('Movimiento', { keyPath: 'id', autoIncrement: true });
                    indice(movimiento, "buscaMovimiento", "id");

                    const kardex = crear('Kardex', { keyPath: 'id' });
                    indice(kardex, "buscaKardex", "id");

                    const celdaColors = crear('CeldaColors', { keyPath: 'id', });
                    indice(celdaColors, "buscaCeldaColors", "id");

                    const historialCambioSonda = crear('Historial_cambio_sonda', { keyPath: 'id', });
                    indice(historialCambioSonda, "buscaHistorialCambioSonda", "id");

                    crear('Convenio', { keyPath: 'id', autoIncrement: true });

                    crear('Historial_prestaciones', { keyPath: 'id', autoIncrement: true });
                    crear('Cie10', { keyPath: 'id', autoIncrement: true });
                    crear('Vadecum', { keyPath: 'id', autoIncrement: true });

                    // Tabla de versión (siempre sellada en cada upgrade)
                    let tablaVersion
                    if (db.objectStoreNames.contains("Version")) {
                        tablaVersion = tx.objectStore("Version")
                    } else {
                        tablaVersion = db.createObjectStore("Version", { keyPath: "id" })
                    }
                    tablaVersion.put({ id: 1, version: this.EXPECTED_VERSION });

                    // Tabla de control de actualizaciones
                    if (!db.objectStoreNames.contains("LastUpdate")) {
                        const updateStore = db.createObjectStore("LastUpdate", { keyPath: "store" });
                        // Insertar cada store con lastUpdated = 0 por defecto
                        stores.forEach(name => {
                            updateStore.put({ store: name, lastUpdated: 0 });
                        });
                    }

                }

                request.onblocked = () => {
                    console.warn('⚠️ La actualización de db-thesalus está bloqueada por otra pestaña. Cierre las demás pestañas y recargue.');
                    this._inicializando = null
                    reject('upgrade-blocked')
                }

                request.onerror = (event) => {
                    this._inicializando = null
                    reject(event.target.errorCode)
                }

                request.onsuccess = (event) => {

                    this.bd = request.result
                    resolve(this.bd)
                }
            })
        },

        async necesitaRefrescar(storeName, limiteMs = 5 * 60 * 1000) {
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction("LastUpdate", "readonly");
            const store = tx.objectStore("LastUpdate");
            const req = store.get(storeName);

            return new Promise(resolve => {
                req.onsuccess = () => {
                    const info = req.result;
                    const ahora = Date.now();
                    // Tolerante: registros viejos guardan lastUpdate, los nuevos lastUpdated
                    const ultimaActualizacion = info ? (info.lastUpdated ?? info.lastUpdate ?? 0) : 0;
                    resolve(!info || (ahora - ultimaActualizacion) > limiteMs);
                };
                req.onerror = () => resolve(true);
            });
        },

        // TTL por consulta (clave de cache como 'Cita:hoy', 'Analisis:paciente:5')
        async necesitaRefrescarConsulta(clave, limiteMs) {
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction("LastUpdate", "readonly");
            const store = tx.objectStore("LastUpdate");
            const req = store.get(clave);

            return new Promise(resolve => {
                req.onsuccess = () => {
                    const info = req.result;
                    if (!info) return resolve(true);
                    const ultimaActualizacion = info.lastUpdated ?? info.lastUpdate ?? 0;
                    resolve((Date.now() - ultimaActualizacion) > limiteMs);
                };
                req.onerror = () => resolve(true);
            });
        },

        async marcarConsulta(clave) {
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction("LastUpdate", "readwrite");
            tx.objectStore("LastUpdate").put({ store: clave, lastUpdated: Date.now() });
            await tx.done;
        },

        // Limpia la cache si cambio el usuario (evita datos de otra cuenta)
        async asegurarScopeUsuario(usuario) {
            const clave = 'idb_scope_usuario'
            const actual = String(usuario ?? '')
            const anterior = localStorage.getItem(clave)

            if (anterior === actual) return false

            await this.clearDatabase('db-thesalus')
            localStorage.setItem(clave, actual)
            return true
        },

        async leerdatos(almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(nombre, "readonly");
                let STlee = transaccion.objectStore(nombre);
                const request = STlee.getAll();

                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async guardardatos(aguardar, almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            let transaccion = this.bd.transaction(nombre, "readwrite");
            let STabre = transaccion.objectStore(nombre);
            STabre.add(aguardar);
        },

        async guardardatosID(aguardar, almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction(nombre, 'readwrite');
            const store = tx.objectStore(nombre);

            const limpio = JSON.parse(JSON.stringify(aguardar));

            const result = await new Promise((resolve, reject) => {
                const request = store.add(limpio);
                request.onsuccess = () => resolve(request.result); // El ID generado
                request.onerror = () => reject(request.error);
            });

            await tx.done;
            return result;
        },

        async leerpordato(key, almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(nombre, "readonly");
                let STlee = transaccion.objectStore(nombre);

                let request = STlee.get(key)
                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })

        },

        async leerNoEnviados(almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize();
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(nombre, "readonly");
                let store = transaccion.objectStore(nombre);

                let resultado = [];
                let request = store.openCursor();

                request.onerror = function () {
                    reject("Error al leer con cursor");
                };

                request.onsuccess = function (event) {
                    let cursor = event.target.result;
                    if (cursor) {
                        if (cursor.value.sincronizado == 0) { // condición: no enviado
                            resultado.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(resultado);
                    }
                };
            });
        },

        async borrardato(key, almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(nombre, "readwrite");
                let STlee = transaccion.objectStore(nombre);

                let request = STlee.delete(key)

                request.onerror = function () {
                    reject('error al eliminar')
                };

                request.onsuccess = () => {
                    resolve()
                }
            })
        },

        async actualiza(aguardar, almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(nombre, "readwrite");
                let STlee = transaccion.objectStore(nombre);

                let request = STlee.put(aguardar)

                request.onerror = function () {
                    reject('error al actualizar')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async bulkPut(datos = [], almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!Array.isArray(datos)) return false;
            if (!this.bd) {
                await this.initialize();
            }

            const datosValidos = datos.filter(item => {
                return (
                    item &&
                    typeof item === 'object' &&
                    !Array.isArray(item) &&
                    Object.keys(item).length > 0
                );
            });
            // Nada que guardar: no desactivar registros cacheados (evita vaciar la cache)
            if (datosValidos.length === 0) return false;
            return new Promise((resolve, reject) => {
                const transaccion = this.bd.transaction(nombre, "readwrite");
                const store = transaccion.objectStore(nombre);

                const request = store.getAll();

                request.onsuccess = () => {
                    const registrosActuales = request.result;
                    const idsNuevos = new Set(datosValidos.filter(d => d.id != null).map(d => d.id));

                    // Marcar como inactivos los que ya no vienen
                    registrosActuales.forEach(registro => {
                        if (nombre == 'Cita') return
                        if(registro.estado == 'Inactiva' || registro.estado == 'Realizada') return
                        if (registro.sincronizado === 0) return;
                        if (registro.id == null) return;

                        if (!idsNuevos.has(registro.id)) {
                            store.put({ ...registro, estado: 0 });
                        }
                    });

                    // Insertar o actualizar los registros nuevos
                    datosValidos.forEach(item => {
                        const limpio = JSON.parse(JSON.stringify(item));
                        store.put(limpio);
                    });
                };

                transaccion.oncomplete = () => resolve(true);
                transaccion.onerror = (event) => reject(event.target.error);
            });
        },

        async borrartodo(almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(nombre, "readwrite");
                let STlee = transaccion.objectStore(nombre);

                let request = STlee.clear()

                request.onerror = function () {
                    reject('error al eliminar')
                };

                request.onsuccess = () => {
                    resolve();
                }
            })
        },

        async listDatos(id, Tabla, Campo = 'id_historia') {

            const datosTabla = await this.leerdatos(Tabla)

            const getValor = (obj, path) => {
                return path.split('.').reduce((acc, key) => {
                    return acc ? acc[key] : undefined
                }, obj)
            }
            // Array que devuelve los datos filtrados por historia
            const datos = datosTabla.filter((dato) => {
                return parseInt(getValor(dato, Campo)) === parseInt(id)
            })

            return datos
        },

        async borra_lee(key, almacen = null) {
            const nombre = almacen ?? this.almacen;
            if (!this.bd) {
                await this.initialize()
            }
            await this.borrardato(key, nombre)
            return await this.leerdatos(nombre)
        },

        async deleteDatabase(dbName) {
            if (this.bd) {
                this.bd.close();
                this.bd = null;
            }
            this._inicializando = null

            return new Promise((resolve, reject) => {
                const request = indexedDB.deleteDatabase(dbName);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error(`❌ Error al eliminar la base de datos '${dbName}':`, event);
                    reject(event);
                };

                request.onblocked = () => {
                    console.warn(`⚠️ La eliminación de '${dbName}' está bloqueada. Cierra otras pestañas que usen esta base.`);
                };
            });
        },

        async clearDatabase(dbName) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName);

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(db.objectStoreNames, "readwrite");

                    transaction.oncomplete = () => {
                        resolve(true);
                    };

                    transaction.onerror = (event) => {
                        console.error(`❌ Error al limpiar la base de datos '${dbName}':`, event);
                        reject(event);
                    };

                    // Limpiar cada objectStore
                    for (const storeName of db.objectStoreNames) {
                        const store = transaction.objectStore(storeName);
                        if (storeName !== 'Version') store.clear();
                    }
                };

                request.onerror = (event) => {
                    console.error(`❌ Error al abrir la base de datos '${dbName}':`, event);
                    reject(event);
                };
            });
        },

        async validateVersion(dbName) {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName);

                request.onsuccess = (event) => {
                    const db = event.target.result;

                    if (!db.objectStoreNames.contains("Version")) {
                        db.close();
                        resolve(false); // no existe la tabla
                        return;
                    }

                    const tx = db.transaction("Version", "readonly");
                    const store = tx.objectStore("Version");
                    const getReq = store.get(1);

                    getReq.onsuccess = () => {
                        const record = getReq.result;
                        db.close();
                        if (record && record.version === this.EXPECTED_VERSION) {
                            resolve(true); // versión correcta
                        } else {
                            resolve(false); // versión incorrecta
                        }
                    };

                    getReq.onerror = () => {
                        db.close();
                        reject(getReq.error);
                    };
                };

                request.onerror = (event) => reject(event.target.errorCode);
            });
        },

        async getData(key) {
            if (!this.bd) await this.initialize()
            return new Promise((resolve, reject) => {
                const tx = this.bd.transaction('KeyCitas', 'readonly')
                const store = tx.objectStore('KeyCitas')

                const request = store.get(key)
                request.onsuccess = () => {
                    const result = request.result
                    resolve(result ? result : false)
                }
                request.onerror = () => reject(request.error)
            })
        },

        async setData(key, data) {
            if (!this.bd) await this.initialize()
            return new Promise((resolve, reject) => {
                const tx = this.bd.transaction('Cita', 'readwrite')
                const store = tx.objectStore('Cita')

                // Aseguramos que sea clonable
                const limpio = JSON.parse(JSON.stringify(data))
                const request = store.put({ key: key, citas: limpio })

                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })
        }

    }
})