/**
 * Script para vincular archivos existentes con materias
 * VERSIÓN CORREGIDA - Maneja períodos escolares
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'sistema_academico',
  user: 'postgres',
  password: 'Postgres2025!',
};

const TEMARIOS_PATH = path.join(__dirname, 'uploads', 'temarios');
const SUBIDO_POR = 1;

async function vincularArchivosExistentes() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // ==========================================
    // 1. VERIFICAR/CREAR PERIODO ESCOLAR
    // ==========================================
    console.log('🔍 Verificando períodos escolares...');
    
    let periodoQuery = await client.query(`
      SELECT * FROM periodos_escolares 
      WHERE esta_activo = true 
      ORDER BY id 
      LIMIT 1
    `);

    let periodoEscolarId;

    if (periodoQuery.rows.length === 0) {
      console.log('⚠️  No hay períodos escolares activos');
      console.log('📝 Creando período escolar por defecto...\n');
      
      const insertPeriodo = await client.query(`
        INSERT INTO periodos_escolares (
          nombre,
          codigo,
          fecha_inicio,
          fecha_fin,
          es_actual,
          esta_activo,
          fecha_creacion,
          fecha_actualizacion
        ) VALUES (
          'Periodo 2025-1',
          '2025-1',
          '2025-01-01',
          '2025-06-30',
          true,
          true,
          NOW(),
          NOW()
        )
        RETURNING id
      `);
      
      periodoEscolarId = insertPeriodo.rows[0].id;
      console.log(`✅ Período escolar creado con ID: ${periodoEscolarId}\n`);
    } else {
      periodoEscolarId = periodoQuery.rows[0].id;
      console.log(`✅ Usando período escolar existente: ${periodoQuery.rows[0].nombre} (ID: ${periodoEscolarId})\n`);
    }

    // ==========================================
    // 2. LEER ARCHIVOS
    // ==========================================
    if (!fs.existsSync(TEMARIOS_PATH)) {
      throw new Error(`La carpeta ${TEMARIOS_PATH} no existe`);
    }

    const archivos = fs.readdirSync(TEMARIOS_PATH)
      .filter(f => f.endsWith('.pdf'))
      .sort();
    
    console.log(`📄 Total archivos encontrados: ${archivos.length}\n`);

    // ==========================================
    // 3. OBTENER MATERIAS
    // ==========================================
    const materiasQuery = await client.query(`
      SELECT id, codigo, nombre, programa_id
      FROM materias
      WHERE esta_activo = true
      ORDER BY codigo
    `);

    const materias = materiasQuery.rows;
    console.log(`📚 Total materias activas: ${materias.length}\n`);

    if (archivos.length < materias.length) {
      console.log(`⚠️ ADVERTENCIA: Hay ${materias.length} materias pero solo ${archivos.length} archivos`);
      console.log(`Se vincularán solo las primeras ${archivos.length} materias\n`);
    }

    // ==========================================
    // 4. VINCULAR
    // ==========================================
    const results = {
      success: [],
      errors: [],
      total: Math.min(archivos.length, materias.length),
    };

    const totalVincular = Math.min(archivos.length, materias.length);

    console.log(`🔗 Iniciando vinculación de ${totalVincular} archivos...\n`);
    console.log('═'.repeat(70));

    for (let i = 0; i < totalVincular; i++) {
      const archivo = archivos[i];
      const materia = materias[i];

      try {
        console.log(`\n[${i + 1}/${totalVincular}] ${materia.codigo} → ${archivo}`);

        // Verificar si ya existe
        const existingQuery = await client.query(
          'SELECT id FROM archivos_temario_base WHERE materia_id = $1 AND periodo_escolar_id = $2',
          [materia.id, periodoEscolarId]
        );

        if (existingQuery.rows.length > 0) {
          console.log('  ⏭️  Ya existe registro');
          results.errors.push({
            materia: materia.codigo,
            archivo,
            error: 'Ya tiene archivo vinculado'
          });
          continue;
        }

        // Obtener tamaño
        const filePath = path.join(TEMARIOS_PATH, archivo);
        const stats = fs.statSync(filePath);
        const tamanoMb = (stats.size / (1024 * 1024)).toFixed(2);

        // Insertar
        const insertQuery = await client.query(
          `INSERT INTO archivos_temario_base (
            materia_id, periodo_escolar_id, titulo, descripcion,
            archivo_pdf, nombre_original, tamano_mb, orden, tipo,
            subido_por, esta_activo, fecha_subida
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          RETURNING id`,
          [
            materia.id,
            periodoEscolarId,
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
        console.log(`  ✅ Registro creado (ID: ${syllabusId})`);

        results.success.push({
          materia: materia.codigo,
          materiaNombre: materia.nombre,
          archivo,
          syllabusId,
        });

      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        results.errors.push({
          materia: materia.codigo,
          archivo,
          error: error.message,
        });
      }
    }

    // ==========================================
    // 5. RESUMEN
    // ==========================================
    console.log('\n' + '═'.repeat(70));
    console.log('\n📊 RESUMEN FINAL:');
    console.log('═'.repeat(70));
    console.log(`Total a vincular:        ${results.total}`);
    console.log(`✅ Vinculados:           ${results.success.length}`);
    console.log(`❌ Errores:              ${results.errors.length}`);
    console.log('═'.repeat(70));

    if (results.errors.length > 0 && results.errors.length <= 10) {
      console.log('\n⚠️ ERRORES:');
      results.errors.forEach(e => {
        console.log(`  - ${e.materia}: ${e.error}`);
      });
    }

    if (results.success.length > 0) {
      console.log('\n✅ PRIMERAS 10 VINCULADAS:');
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

vincularArchivosExistentes().catch(console.error);