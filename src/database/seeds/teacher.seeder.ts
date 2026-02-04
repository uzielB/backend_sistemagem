import { DataSource } from 'typeorm';
import { Teacher, GradoAcademico } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

/**
 * Seeder para crear docentes de prueba
 * 
 * IMPORTANTE: Este seeder debe ejecutarse DESPUÉS del user.seeder
 * porque necesita que existan usuarios con rol DOCENTE
 */
async function seedTeachers() {
  // Crear conexión a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Postgres2025!',
    database: 'sistema_academico',
    entities: [User, Teacher],
    synchronize: false, // No modificar estructura, solo insertar datos
  });

  try {
    // Inicializar conexión
    await dataSource.initialize();
    console.log('📡 Conexión a la base de datos establecida');

    // Obtener repositorios
    const userRepository = dataSource.getRepository(User);
    const teacherRepository = dataSource.getRepository(Teacher);

    // Buscar usuarios con rol DOCENTE que NO tengan perfil de docente
    const docenteUsers = await userRepository.find({
      where: { rol: UserRole.DOCENTE },
    });

    console.log(`\n👨‍🏫 Encontrados ${docenteUsers.length} usuarios con rol DOCENTE`);

    if (docenteUsers.length === 0) {
      console.log('❌ No se encontraron usuarios con rol DOCENTE');
      console.log('💡 Ejecuta primero el user.seeder.ts');
      await dataSource.destroy();
      return;
    }

    // Verificar cuántos ya tienen perfil de docente
    const existingTeachers = await teacherRepository.find();
    console.log(`📋 Docentes existentes en BD: ${existingTeachers.length}`);

    // Limpiar tabla (opcional - comentar si no quieres eliminar datos existentes)
    if (existingTeachers.length > 0) {
      console.log('🗑️  Limpiando tabla de docentes...');
      await teacherRepository.remove(existingTeachers);
      console.log('✅ Tabla limpiada');
    }

    // DOCENTE 1: Perfil completo
    const teacher1 = teacherRepository.create({
      usuarioId: docenteUsers[0].id,
      numeroEmpleado: 'EMP001',
      departamento: 'Departamento de Ciencias de la Salud',
      especialidad: 'Fisioterapia Deportiva',
      fechaContratacion: new Date('2020-01-15'),
      gradosAcademicos: [GradoAcademico.LICENCIATURA, GradoAcademico.MAESTRIA],
      areaGradoAcademico: 'Licenciatura en Fisioterapia, Maestría en Rehabilitación Física',
      haCompletadoFormulario: true,
      haSubidoDocumentos: true,
      haProporcionadoDatosBancarios: true,
      estaActivo: true,
    });

    // DOCENTE 2: Perfil incompleto (solo formulario)
    let teacher2 = null;
    if (docenteUsers.length > 1) {
      teacher2 = teacherRepository.create({
        usuarioId: docenteUsers[1].id,
        numeroEmpleado: 'EMP002',
        departamento: 'Departamento de Ciencias Sociales',
        especialidad: 'Derecho Civil y Mercantil',
        fechaContratacion: new Date('2021-08-20'),
        gradosAcademicos: [GradoAcademico.LICENCIATURA, GradoAcademico.MAESTRIA, GradoAcademico.DOCTORADO],
        areaGradoAcademico: 'Licenciatura en Derecho, Maestría en Derecho Civil, Doctorado en Ciencias Jurídicas',
        haCompletadoFormulario: true,
        haSubidoDocumentos: false,
        haProporcionadoDatosBancarios: false,
        estaActivo: true,
      });
    }

    // DOCENTE 3: Perfil nuevo (nada completado)
    let teacher3 = null;
    if (docenteUsers.length > 2) {
      teacher3 = teacherRepository.create({
        usuarioId: docenteUsers[2].id,
        numeroEmpleado: 'EMP003',
        departamento: 'Departamento de Educación',
        especialidad: 'Pedagogía y Didáctica',
        fechaContratacion: new Date('2024-01-10'),
        gradosAcademicos: [GradoAcademico.LICENCIATURA],
        areaGradoAcademico: 'Licenciatura en Ciencias de la Educación',
        haCompletadoFormulario: false,
        haSubidoDocumentos: false,
        haProporcionadoDatosBancarios: false,
        estaActivo: true,
      });
    }

    // Si solo hay 1 usuario DOCENTE, crear docentes adicionales ficticios
    // (esto requeriría crear más usuarios DOCENTE primero)

    // Guardar en la base de datos
    console.log('\n💾 Guardando docentes en la base de datos...\n');

    await teacherRepository.save(teacher1);
    console.log('✅ Docente 1 creado:');
    console.log(`   - Usuario: ${docenteUsers[0].nombre} ${docenteUsers[0].apellidoPaterno}`);
    console.log(`   - Número de empleado: ${teacher1.numeroEmpleado}`);
    console.log(`   - Departamento: ${teacher1.departamento}`);
    console.log(`   - Perfil completo: SÍ ✅`);

    if (teacher2) {
      await teacherRepository.save(teacher2);
      console.log('\n✅ Docente 2 creado:');
      console.log(`   - Usuario: ${docenteUsers[1].nombre} ${docenteUsers[1].apellidoPaterno}`);
      console.log(`   - Número de empleado: ${teacher2.numeroEmpleado}`);
      console.log(`   - Departamento: ${teacher2.departamento}`);
      console.log(`   - Perfil completo: NO (falta documentos y datos bancarios) ⚠️`);
    }

    if (teacher3) {
      await teacherRepository.save(teacher3);
      console.log('\n✅ Docente 3 creado:');
      console.log(`   - Usuario: ${docenteUsers[2].nombre} ${docenteUsers[2].apellidoPaterno}`);
      console.log(`   - Número de empleado: ${teacher3.numeroEmpleado}`);
      console.log(`   - Departamento: ${teacher3.departamento}`);
      console.log(`   - Perfil completo: NO (perfil nuevo) ⚠️`);
    }

    console.log('\n🎉 Seeder de docentes ejecutado exitosamente');
    console.log(`📊 Total de docentes creados: ${teacher2 && teacher3 ? 3 : teacher2 ? 2 : 1}`);

    // Cerrar conexión
    await dataSource.destroy();
    console.log('✅ Conexión cerrada');

  } catch (error) {
    console.error('❌ Error al ejecutar el seeder:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Ejecutar el seeder
seedTeachers();