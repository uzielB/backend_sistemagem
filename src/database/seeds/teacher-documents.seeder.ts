import { DataSource } from 'typeorm';
import { TeacherDocument, EstatusDocumentos } from '../../teacher-documents/entities/teacher-document.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Seeder para crear documentos de docentes
 * 
 * 3 registros de prueba:
 * - Docente 1 (María): 100% completo, APROBADO
 * - Docente 2 (Carlos): 66% completo, PENDIENTE
 * - Docente 3 (Ana): 33% completo, PENDIENTE
 */
async function seedTeacherDocuments() {
  console.log('');
  console.log('================================================');
  console.log('🌱 SEEDER DE DOCUMENTOS DOCENTES - Sistema GEM');
  console.log('================================================');
  console.log('');

  // Crear conexión a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Postgres2025!',
    database: 'sistema_academico',
    entities: [TeacherDocument, Teacher, User], // ✅ Incluir todas las entidades relacionadas
    synchronize: false,
  });

  try {
    // Inicializar conexión
    await dataSource.initialize();
    console.log('📡 Conexión a la base de datos establecida');

    // Obtener repositorio
    const documentsRepository = dataSource.getRepository(TeacherDocument);

    // Verificar documentos existentes
    const existing = await documentsRepository.find();
    console.log(`📋 Documentos existentes: ${existing.length}`);

    // Limpiar tabla (opcional)
    if (existing.length > 0) {
      console.log('🗑️  Limpiando tabla de documentos...');
      await documentsRepository.remove(existing);
      console.log('✅ Tabla limpiada');
    }

    console.log('\n💾 Creando documentos de docentes...\n');

    // Documentos de prueba
    const documentos = [
      // DOCENTE 1: María González - 100% COMPLETO, APROBADO
      {
        docenteId: 1,
        curpPdf: '/uploads/documents/teachers/1/curp.pdf',
        actaNacimientoPdf: '/uploads/documents/teachers/1/acta_nacimiento.pdf',
        inePdf: '/uploads/documents/teachers/1/ine.pdf',
        tituloPdf: '/uploads/documents/teachers/1/titulo.pdf',
        cedulaProfesionalPdf: '/uploads/documents/teachers/1/cedula_profesional.pdf',
        cvPdf: '/uploads/documents/teachers/1/cv.pdf',
        documentosCompletos: true,
        porcentajeCompletado: 100,
        estatus: EstatusDocumentos.APROBADO,
        comentarios: 'Todos los documentos verificados y aprobados.',
        revisadoPor: 1, // SUPER_ADMIN
        fechaRevision: new Date('2025-01-21'),
      },

      // DOCENTE 2: Carlos Ramírez - 66% COMPLETO, PENDIENTE
      {
        docenteId: 2,
        curpPdf: '/uploads/documents/teachers/2/curp.pdf',
        actaNacimientoPdf: '/uploads/documents/teachers/2/acta_nacimiento.pdf',
        inePdf: '/uploads/documents/teachers/2/ine.pdf',
        tituloPdf: '/uploads/documents/teachers/2/titulo.pdf',
        cedulaProfesionalPdf: null, // FALTA
        cvPdf: null, // FALTA
        documentosCompletos: false,
        porcentajeCompletado: 66.67,
        estatus: EstatusDocumentos.PENDIENTE,
        comentarios: 'Faltan: Cédula Profesional y CV',
        revisadoPor: null,
        fechaRevision: null,
      },

      // DOCENTE 3: Ana Martínez - 33% COMPLETO, PENDIENTE
      {
        docenteId: 3,
        curpPdf: '/uploads/documents/teachers/3/curp.pdf',
        actaNacimientoPdf: '/uploads/documents/teachers/3/acta_nacimiento.pdf',
        inePdf: null, // FALTA
        tituloPdf: null, // FALTA
        cedulaProfesionalPdf: null, // FALTA
        cvPdf: null, // FALTA
        documentosCompletos: false,
        porcentajeCompletado: 33.33,
        estatus: EstatusDocumentos.PENDIENTE,
        comentarios: null,
        revisadoPor: null,
        fechaRevision: null,
      },
    ];

    // Guardar en base de datos
    let count = 0;
    for (const documentoData of documentos) {
      const document = documentsRepository.create(documentoData);
      await documentsRepository.save(document);

      console.log(`✅ Documentos creados:`);
      console.log(`   Docente ID: ${documentoData.docenteId}`);
      console.log(`   Porcentaje completado: ${documentoData.porcentajeCompletado}%`);
      console.log(`   Estatus: ${documentoData.estatus}`);
      console.log(`   Documentos completos: ${documentoData.documentosCompletos ? 'SÍ ✓' : 'NO ✗'}`);
      console.log('');
      count++;
    }

    console.log('================================================');
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Registros creados: ${count}`);
    console.log(`   📄 100% completos: 1 (Docente 1 - APROBADO)`);
    console.log(`   📄 66% completos: 1 (Docente 2 - PENDIENTE)`);
    console.log(`   📄 33% completos: 1 (Docente 3 - PENDIENTE)`);
    console.log('================================================');
    console.log('');
    console.log('🎉 Seeder de documentos ejecutado exitosamente');

    // Cerrar conexión
    await dataSource.destroy();
    console.log('✅ Conexión cerrada\n');

  } catch (error) {
    console.error('❌ Error al ejecutar el seeder:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Ejecutar seeder
seedTeacherDocuments()
  .then(() => {
    console.log('✅ Seeder completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar seeder:', error);
    process.exit(1);
  });