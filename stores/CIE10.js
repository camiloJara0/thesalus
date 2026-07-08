import { CIE10 } from "~/data/CIE10";
import { municipios } from "~/data/municipios";
import { defineStore } from "pinia";
import { traerCie_10 } from "~/Core/Empresa/Datos/CIE10/GetCIe10";

// Store para guardar codigos CIE-10
export const useCodigos = defineStore('CodigosCie10', {
    state: () => ({
        municipios: municipios,
        bd: null
    }),

    getters: {

    },

    actions: {
        async initialize() {
            return new Promise((resolve, reject) => {
                const indexedDB = window.indexedDB || window.webkitIndexedDB;
                const request = indexedDB.open('datos-thesalus', 1)
                request.onupgradeneeded = (event) => {
                    const db = event.target.result

                    const CIE_10 = db.createObjectStore('CIE_10', { keyPath: "code" });
                    CIE_10.createIndex("buscaCie", "code", { unique: false });

                    const Ubicaciones = db.createObjectStore('Ubicaciones', { keyPath: "nombre" });
                    Ubicaciones.createIndex("buscaUbicacion", "nombre", { unique: false });
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

        async leerdatos(local = false) {
            if (!this.bd) {
                await this.initialize()
            }

            const codigos = await new Promise((resolve, reject) => {
                let transaccion = this.bd.transaction('CIE_10', "readonly");
                let STlee = transaccion.objectStore('CIE_10');
                const request = STlee.getAll();
                
                request.onerror = function () {
                    reject('error al leer')
                };
                
                request.onsuccess = function (event) {
                    resolve(event.target.result)
                }
            })

            if(local){ return codigos}

            const codigosWeb = await traerCie_10()

            const codigosWebNormalizados = codigosWeb?.map(item => ({
                code: item.codigo,
                description: item.nombre
            }));

            // Juntar ambos arrays
            let todosLosCodigos = [...codigos, ...codigosWebNormalizados]

            return todosLosCodigos
        },

        async guardardatos() {
            // Verificar si ya hay datos en CIE_10
            const datos = await new Promise((resolve, reject) => {
                const transaccion = this.bd.transaction('CIE_10', "readonly");
                const STlee = transaccion.objectStore('CIE_10');
                const request = STlee.getAll();

                request.onerror = () => reject('error al leer');
                request.onsuccess = (event) => resolve(event.target.result);
            });

            if (datos.length > 0) return;

            // Guardar datos en CIE_10
            const transaccionCIE = this.bd.transaction('CIE_10', "readwrite");
            const STabreCIE = transaccionCIE.objectStore('CIE_10');
            const cleanData = JSON.parse(JSON.stringify(CIE10));

            for (let item of cleanData) {
                try {
                    await new Promise((resolve, reject) => {
                        const request = STabreCIE.add(item);
                        request.onsuccess = () => resolve();
                        request.onerror = (e) => reject(e);
                    });
                } catch (e) {
                    console.error("Error agregando el código:", item.code, e);
                }
            }

            // Guardar datos en Ubicaciones
            const transaccionUbicaciones = this.bd.transaction('Ubicaciones', "readwrite");
            const STabreUbicaciones = transaccionUbicaciones.objectStore('Ubicaciones');
            const cleanMunicipios = JSON.parse(JSON.stringify(this.municipios));
            for (let municipio of cleanMunicipios) {
                try {
                    await new Promise((resolve, reject) => {
                        const request = STabreUbicaciones.add(municipio);
                        request.onsuccess = () => resolve();
                        request.onerror = (e) => reject(e);
                    });
                } catch (e) {
                    console.error("Error agregando el municipio:", municipio.nombre, e);
                }
            }
        },


    }
})
