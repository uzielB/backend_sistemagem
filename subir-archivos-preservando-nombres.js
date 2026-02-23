/**
 * Script para subir archivos PDF preservando nombres originales
 * y vincularlos automáticamente con sus materias
 * 
 * Uso:
 * 1. Coloca tus PDFs en una carpeta (ej: C:\MIS_PDFS\)
 * 2. Ajusta PDFS_SOURCE_PATH a esa carpeta
 * 3. Ejecuta: node subir-archivos-preservando-nombres.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// ==========================================
// CONFIGURACIÓN
// ==========================================

// 🔧 AJUSTA ESTA RUTA a donde tienes tus PDFs originales
const PDFS_SOURCE_PATH = 'C:\\pdfs';  // ⚠️ CAMBIAR ESTA RUTA

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'sistema_academico',
  user: 'postgres',
  password: 'Postgres2025!',
};

const UPLOADS_DEST_PATH = path.join(__dirname, 'uploads', 'temarios');
const PERIODO_ESCOLAR_ID = 5;
const SUBIDO_POR = 1;

// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================
async function subirArchivosPreservandoNombres() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Verificar carpeta origen
    if (!fs.existsSync(PDFS_SOURCE_PATH)) {
      throw new Error(`❌ La carpeta ${PDFS_SOURCE_PATH} no existe.\n\nAjusta PDFS_SOURCE_PATH en el script.`);
    }

    // 2. Verificar/Crear carpeta destino
    if (!fs.existsSync(UPLOADS_DEST_PATH)) {
      fs.mkdirSync(UPLOADS_DEST_PATH, { recursive: true });
      console.log(`📁 Carpeta destino creada: ${UPLOADS_DEST_PATH}\n`);
    }

    // 3. Leer archivos PDF
    const archivos = fs.readdirSync(PDFS_SOURCE_PATH)
      .filter(f => f.endsWith('.pdf'))
      .sort();
    
    console.log(`📄 Total archivos encontrados en origen: ${archivos.length}\n`);

    if (archivos.length === 0) {
      throw new Error('❌ No se encontraron archivos PDF en la carpeta origen');
    }

    console.log('📋 Primeros 10 archivos:');
    archivos.slice(0, 10).forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log('');

    // 4. Obtener materias
    const materiasQuery = await client.query(`
      SELECT id, codigo, nombre
      FROM materias
      WHERE esta_activo = true
      ORDER BY codigo
    `);

    const materias = materiasQuery.rows;
    console.log(`📚 Total materias activas: ${materias.length}\n`);

    // 5. Vincular por nombre
    const results = {
      success: [],
      errors: [],
      notFound: [],
    };

    console.log('🔗 Iniciando proceso de carga y vinculación...\n');
    console.log('═'.repeat(70));

    for (const archivo of archivos) {
      const codigoMateria = archivo.replace('.pdf', '');  // ARQ-101.pdf → ARQ-101
      
      console.log(`\n📄 Procesando: ${archivo}`);
      console.log(`   Código extraído: ${codigoMateria}`);

      // Buscar materia por código
      const materia = materias.find(m => m.codigo === codigoMateria);

      if (!materia) {
        console.log(`   ⚠️ No se encontró materia con código: ${codigoMateria}`);
        results.notFound.push({ archivo, codigo: codigoMateria });
        continue;
      }

      console.log(`   ✅ Materia encontrada: ${materia.nombre} (ID: ${materia.id})`);

      try {
        // Copiar archivo preservando nombre original
        const sourcePath = path.join(PDFS_SOURCE_PATH, archivo);
        const destPath = path.join(UPLOADS_DEST_PATH, archivo);

        fs.copyFileSync(sourcePath, destPath);
        console.log(`   📂 Archivo copiado: ${archivo}`);

        // Obtener tamaño
        const stats = fs.statSync(destPath);
        const tamanoMb = (stats.size / (1024 * 1024)).toFixed(2);

        // Verificar si ya existe vínculo
        const existingQuery = await client.query(
          'SELECT id FROM archivos_temario_base WHERE materia_id = $1 AND periodo_escolar_id = $2',
          [materia.id, PERIODO_ESCOLAR_ID]
        );

        if (existingQuery.rows.length > 0) {
          console.log(`   ⏭️ Ya existe vínculo para esta materia`);
          results.errors.push({
            archivo,
            materia: materia.codigo,
            error: 'Ya tiene archivo vinculado'
          });
          continue;
        }

        // Insertar registro en BD
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
            `uploads/temarios/${archivo}`,
            archivo,
            tamanoMb,
            1,
            'GENERAL',
            SUBIDO_POR,
            true,
          ]
        );

        const syllabusId = insertQuery.rows[0].id;
        console.log(`   💾 Registro creado en BD (ID: ${syllabusId})`);

        results.success.push({
          archivo,
          materia: materia.codigo,
          materiaNombre: materia.nombre,
          syllabusId,
        });

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        results.errors.push({
          archivo,
          materia: materia.codigo,
          error: error.message,
        });
      }
    }

    // 6. Resumen
    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 RESUMEN FINAL:');
    console.log('═'.repeat(70));
    console.log(`Total archivos procesados:  ${archivos.length}`);
    console.log(`✅ Subidos y vinculados:    ${results.success.length}`);
    console.log(`⚠️ Materia no encontrada:   ${results.notFound.length}`);
    console.log(`❌ Errores:                 ${results.errors.length}`);
    console.log('═'.repeat(70));

    if (results.notFound.length > 0) {
      console.log('\n⚠️ ARCHIVOS SIN MATERIA CORRESPONDIENTE:');
      results.notFound.forEach(e => {
        console.log(`  - ${e.archivo} (código buscado: ${e.codigo})`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      results.errors.slice(0, 10).forEach(e => {
        console.log(`  - ${e.archivo}: ${e.error}`);
      });
      if (results.errors.length > 10) {
        console.log(`  ... y ${results.errors.length - 10} errores más`);
      }
    }

    if (results.success.length > 0) {
      console.log('\n✅ PRIMERAS 10 VINCULACIONES EXITOSAS:');
      results.success.slice(0, 10).forEach(s => {
        console.log(`  ${s.materia} ← ${s.archivo}`);
      });
      
      if (results.success.length > 10) {
        console.log(`  ... y ${results.success.length - 10} más`);
      }
    }

    console.log('\n🎉 PROCESO COMPLETADO\n');

  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos\n');
  }
}

// Ejecutar
subirArchivosPreservandoNombres().catch(console.error);