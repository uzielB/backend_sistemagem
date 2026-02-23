/**
 * Script para sincronizar archivos PDF con la base de datos
 * 
 * Uso:
 * node sync-files.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// ==========================================
// CONFIGURACIÓN DE BASE DE DATOS
// ==========================================
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'sistema_academico',
  user: 'postgres',
  password: 'Postgres2025!',
};

// ==========================================
// CONFIGURACIÓN DE ARCHIVOS
// ==========================================
const TEMARIOS_PATH = path.join(__dirname, 'uploads', 'temarios');
const PERIODO_ESCOLAR_ID = 1; // ID del periodo actual
const SUBIDO_POR = 1; // ID del usuario admin

// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================
async function syncFiles() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar que la carpeta exista
    if (!fs.existsSync(TEMARIOS_PATH)) {
      throw new Error(`La carpeta ${TEMARIOS_PATH} no existe`);
    }

    // Leer archivos PDF
    const files = fs.readdirSync(TEMARIOS_PATH).filter(f => f.endsWith('.pdf'));
    console.log(`📄 Archivos encontrados: ${files.length}`);

    const results = {
      success: [],
      errors: [],
      skipped: [],
    };

    for (const filename of files) {
      try {
        // Extraer código de materia
        const codigo = filename.replace('.pdf', '');
        console.log(`\n🔍 Procesando: ${filename} (código: ${codigo})`);

        // Buscar materia
        const materiaQuery = await client.query(
          'SELECT id, nombre FROM materias WHERE codigo = $1 AND esta_activo = true',
          [codigo]
        );

        if (materiaQuery.rows.length === 0) {
          console.log(`⚠️ No se encontró materia con código: ${codigo}`);
          results.errors.push({ filename, error: `No existe materia ${codigo}` });
          continue;
        }

        const materia = materiaQuery.rows[0];
        console.log(`✅ Materia encontrada: ${materia.nombre} (ID: ${materia.id})`);

        // Verificar si ya existe
        const existingQuery = await client.query(
          'SELECT id FROM archivos_temario_base WHERE materia_id = $1 AND nombre_original = $2',
          [materia.id, filename]
        );

        if (existingQuery.rows.length > 0) {
          console.log(`⏭️ Ya existe registro para ${filename}`);
          results.skipped.push({ filename, materiaId: materia.id });
          continue;
        }

        // Obtener tamaño del archivo
        const filePath = path.join(TEMARIOS_PATH, filename);
        const stats = fs.statSync(filePath);
        const tamanoMb = (stats.size / (1024 * 1024)).toFixed(2);

        // Obtener próximo orden
        const ordenQuery = await client.query(
          'SELECT COALESCE(MAX(orden), 0) + 1 as next_orden FROM archivos_temario_base WHERE materia_id = $1 AND periodo_escolar_id = $2',
          [materia.id, PERIODO_ESCOLAR_ID]
        );
        const nextOrden = ordenQuery.rows[0].next_orden;

        // Insertar registro
        const insertQuery = await client.query(
          `INSERT INTO archivos_temario_base (
            materia_id, periodo_escolar_id, titulo, descripcion,
            archivo_pdf, nombre_original, tamano_mb, orden, tipo,
            subido_por, esta_activo, fecha_subida
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          RETURNING id`,
          [
            materia.id,
            PERIODO_ESCOLAR_ID,
            `Temario ${materia.nombre}`,
            `Temario oficial de ${materia.nombre}`,
            `uploads/temarios/${filename}`,
            filename,
            tamanoMb,
            nextOrden,
            'GENERAL',
            SUBIDO_POR,
            true,
          ]
        );

        const syllabusId = insertQuery.rows[0].id;
        console.log(`✅ Registro creado con ID: ${syllabusId}`);

        results.success.push({
          filename,
          materiaId: materia.id,
          materiaCodigo: codigo,
          materiaNombre: materia.nombre,
          syllabusId,
        });

      } catch (error) {
        console.error(`❌ Error procesando ${filename}:`, error.message);
        results.errors.push({ filename, error: error.message });
      }
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN:');
    console.log('═══════════════════════════════════════');
    console.log(`Total archivos:     ${files.length}`);
    console.log(`✅ Sincronizados:   ${results.success.length}`);
    console.log(`⏭️ Ya existían:     ${results.skipped.length}`);
    console.log(`❌ Errores:         ${results.errors.length}`);
    console.log('═══════════════════════════════════════');

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      results.errors.forEach(e => {
        console.log(`  - ${e.filename}: ${e.error}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

// Ejecutar
syncFiles().catch(console.error);