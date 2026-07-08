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
            EXPECTED_VERSION: 6
        };
    },
    actions: {
        async initialize() {
            return new Promise((resolve, reject) => {
                const indexedDB = window.indexedDB || window.webkitIndexedDB;
                const request = indexedDB.open('db-thesalus', 1)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result
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
                        'Historial_cambio_sonda'
                    ]
                    const pacientes = db.createObjectStore('Paciente', { keyPath: 'id', autoIncrement: true });
                    pacientes.createIndex("buscapaciente", "id", { unique: false });

                    const medicos = db.createObjectStore('Profesional', { keyPath: 'id', autoIncrement: true });
                    medicos.createIndex("buscaprofesional", "id", { unique: false });

                    const usersInfo = db.createObjectStore('InformacionUser', { keyPath: 'id', autoIncrement: true });
                    usersInfo.createIndex("buscaaInformacionUser", "id", { unique: false });

                    const diagnostico = db.createObjectStore('Diagnosticos', { keyPath: 'id', autoIncrement: true });
                    diagnostico.createIndex("buscadiagnostico", "id_diagnostico", { unique: false });

                    const diagnosticoCIF = db.createObjectStore('DiagnosticosCIF', { keyPath: 'id', autoIncrement: true });
                    diagnosticoCIF.createIndex("buscadiagnostico", "id_diagnostico", { unique: false });

                    const antecedentes = db.createObjectStore('Antecedentes', { keyPath: 'id', autoIncrement: true });
                    antecedentes.createIndex("buscaantecedentes", "id_antecedente", { unique: false });

                    const enfermedadActual = db.createObjectStore('Enfermedad', { keyPath: 'id', autoIncrement: true });
                    enfermedadActual.createIndex("buscaenfermedadActual", "enfermedad", { unique: false });

                    const historiaClinica = db.createObjectStore('HistoriaClinica', { keyPath: 'id', autoIncrement: true });
                    historiaClinica.createIndex("buscahistoriaClinica", "id_historiaClinica", { unique: false });

                    const examenFisico = db.createObjectStore('ExamenFisico', { keyPath: 'id', autoIncrement: true });
                    examenFisico.createIndex("buscaexamenFisico", "id", { unique: false });

                    const analisis = db.createObjectStore('Analisis', { keyPath: 'id', autoIncrement: true });
                    analisis.createIndex("buscaanalisis", "id", { unique: false });

                    const planManejoMedicamentos = db.createObjectStore('Plan_manejo_medicamentos', { keyPath: 'id', autoIncrement: true });
                    planManejoMedicamentos.createIndex("buscaMedicamentos", "descripcion", { unique: false });

                    const planManejoProcedimientos = db.createObjectStore('Plan_manejo_procedimientos', { keyPath: 'id', autoIncrement: true });
                    planManejoProcedimientos.createIndex("buscaProcedimientos", "descripcion", { unique: false });

                    const planManejoInsumos = db.createObjectStore('Plan_manejo_insumos', { keyPath: 'id', autoIncrement: true });
                    planManejoInsumos.createIndex("buscainsumos", "nombre", { unique: false });

                    const planManejoEquipos = db.createObjectStore('Plan_manejo_equipos', { keyPath: 'id', autoIncrement: true });
                    planManejoEquipos.createIndex("buscaequipos", "descripcion", { unique: false });

                    const citas = db.createObjectStore('Cita', { keyPath: 'id' });
                    citas.createIndex("buscaCita", "id", { unique: false });

                    const keyCitas = db.createObjectStore('KeyCitas', { keyPath: 'key' });
                    const keyAnalisis = db.createObjectStore('KeyAnalisis', { keyPath: 'key' });

                    const empresa = db.createObjectStore('Empresa', { keyPath: 'no_identificacion' });
                    empresa.createIndex("buscaEmpresa", "no_identificacion", { unique: false });

                    const software = db.createObjectStore('Software', { keyPath: 'id', autoIncrement: true });
                    software.createIndex("buscaSoftware", "id", { unique: false });

                    const facturacion = db.createObjectStore('Facturacion', { keyPath: 'id', autoIncrement: true });
                    facturacion.createIndex("buscaFacturacion", "id", { unique: false });

                    const nota = db.createObjectStore('Nota', { keyPath: 'id', autoIncrement: true });
                    nota.createIndex("buscaNota", "id", { unique: false });

                    const descripcionNota = db.createObjectStore('Descripcion_nota', { keyPath: 'id', autoIncrement: true });
                    descripcionNota.createIndex("buscaNota", "id", { unique: false });

                    const eps = db.createObjectStore('EPS', { keyPath: 'id', autoIncrement: true });
                    eps.createIndex("buscaEPS", "id", { unique: false });

                    const profesion = db.createObjectStore('Profesion', { keyPath: 'id', autoIncrement: true });
                    profesion.createIndex("buscaProfesion", "id", { unique: false });

                    const terapia = db.createObjectStore('Terapia', { keyPath: 'id', autoIncrement: true });
                    terapia.createIndex("buscaTerapia", "id", { unique: false });

                    const servicio = db.createObjectStore('Servicio', { keyPath: 'id', autoIncrement: true });
                    servicio.createIndex("buscaServicio", "id", { unique: false });

                    const insumo = db.createObjectStore('Insumo', { keyPath: 'id', autoIncrement: true });
                    insumo.createIndex("buscaInsumo", "id", { unique: false });

                    const movimiento = db.createObjectStore('Movimiento', { keyPath: 'id', autoIncrement: true });
                    movimiento.createIndex("buscaMovimiento", "id", { unique: false });

                    const kardex = db.createObjectStore('Kardex', { keyPath: 'id' });
                    kardex.createIndex("buscaKardex", "id", { unique: false });

                    const celdaColors = db.createObjectStore('CeldaColors', { keyPath: 'id', });
                    celdaColors.createIndex("buscaCeldaColors", "id", { unique: false });

                    const historialCambioSonda = db.createObjectStore('Historial_cambio_sonda', { keyPath: 'id', });
                    historialCambioSonda.createIndex("buscaHistorialCambioSonda", "id", { unique: false });

                    const convenios = db.createObjectStore('Convenio', { keyPath: 'id', autoIncrement: true });

                    db.createObjectStore('Historial_prestaciones', { keyPath: 'id', autoIncrement: true });
                    db.createObjectStore('Cie10', { keyPath: 'id', autoIncrement: true });
                    db.createObjectStore('Vadecum', { keyPath: 'id', autoIncrement: true });

                    // Tabla de versión
                    if (!db.objectStoreNames.contains("Version")) {
                        const versionStore = db.createObjectStore("Version", { keyPath: "id" });
                        versionStore.put({ id: 1, version: this.EXPECTED_VERSION });
                    }

                    // Tabla de control de actualizaciones
                    if (!db.objectStoreNames.contains("LastUpdate")) {
                        const updateStore = db.createObjectStore("LastUpdate", { keyPath: "store" });
                        // Insertar cada store con lastUpdated = 0 por defecto
                        stores.forEach(name => {
                            updateStore.put({ store: name, lastUpdated: 0 });
                        });
                    }

                }

                request.onerror = (event) => {
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
                    resolve(!info || (ahora - info.lastUpdated) > limiteMs);
                };
            });
        },

        async leerdatos() {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readonly");
                let STlee = transaccion.objectStore(this.almacen);
                const request = STlee.getAll();

                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async guardardatos(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            let transaccion = this.bd.transaction(this.almacen, "readwrite");
            let STabre = transaccion.objectStore(this.almacen);
            STabre.add(aguardar);
        },

        async guardardatosID(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            const tx = this.bd.transaction(this.almacen, 'readwrite');
            const store = tx.objectStore(this.almacen);

            const limpio = JSON.parse(JSON.stringify(aguardar));

            const result = await new Promise((resolve, reject) => {
                const request = store.add(limpio);
                request.onsuccess = () => resolve(request.result); // El ID generado
                request.onerror = () => reject(request.error);
            });

            await tx.done;
            return result;
        },

        async leerpordato(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readonly");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.get(key)
                request.onerror = function () {
                    reject('error al leer')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })

        },

        async leerNoEnviados() {
            if (!this.bd) {
                await this.initialize();
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readonly");
                let store = transaccion.objectStore(this.almacen);

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

        async borrardato(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.delete(key)

                request.onerror = function () {
                    reject('error al eliminar')
                };

                request.onsuccess = () => {
                    resolve()
                }
            })
        },

        async actualiza(aguardar) {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

                let request = STlee.put(aguardar)

                request.onerror = function () {
                    reject('error al actualizar')
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })
        },

        async bulkPut(datos = []) {
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
            return new Promise((resolve, reject) => {
                const transaccion = this.bd.transaction(this.almacen, "readwrite");
                const store = transaccion.objectStore(this.almacen);

                const request = store.getAll();

                request.onsuccess = () => {
                    const registrosActuales = request.result;
                    const idsNuevos = new Set(datosValidos.filter(d => d.id != null).map(d => d.id));

                    // Marcar como inactivos los que ya no vienen
                    registrosActuales.forEach(registro => {
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

        async borrartodo() {
            if (!this.bd) {
                await this.initialize()
            }
            return new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction(this.almacen, "readwrite");
                let STlee = transaccion.objectStore(this.almacen);

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

            this.almacen = Tabla
            const datosTabla = await this.leerdatos()

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

        async borra_lee(key) {
            if (!this.bd) {
                await this.initialize()
            }
            return await borrardato(key).then(() => {
                return leerdatos()
            })
        },

        async deleteDatabase(dbName) {
            if (this.bd) {
                this.bd.close();
                this.bd = null;
            }

            return new Promise((resolve, reject) => {
                const request = indexedDB.deleteDatabase(dbName);

                request.onsuccess = () => {
                    console.log(`✅ Base de datos '${dbName}' eliminada correctamente.`);
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
            console.log(this.bd)
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName);

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(db.objectStoreNames, "readwrite");

                    transaction.oncomplete = () => {
                        console.log(`✅ Base de datos '${dbName}' limpiada correctamente.`);
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