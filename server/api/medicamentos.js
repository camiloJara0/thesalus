// server/api/medicamentos.js
import { readFileSync } from 'fs';
import { join } from 'path';
import zlib from 'zlib';

let medicamentosCache = null;

function loadMedicamentos() {
  if (medicamentosCache) return medicamentosCache;

  const filePath = join(process.cwd(), 'public/data/medicamentos.json.gz');
  const compressed = readFileSync(filePath);
  const decompressed = zlib.gunzipSync(compressed).toString('utf-8');
  medicamentosCache = JSON.parse(decompressed);

  return medicamentosCache;
}

export default defineEventHandler((event) => {
  try {
    const q = getQuery(event).q?.toLowerCase() || ''
    const medicamentos = loadMedicamentos()

    const results = medicamentos.filter(m =>
      m.producto.toLowerCase().includes(q) ||
      m.principioactivo.toLowerCase().includes(q) ||
      m.expedientecum.toLowerCase().includes(q)
    )

    return results.slice(0, 50)
  } catch (err) {
    console.error('Error en API medicamentos:', err)
    return { error: 'No se pudo cargar medicamentos' }
  }

});
