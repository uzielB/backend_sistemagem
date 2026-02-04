import { DataSource } from 'typeorm';
import { TeacherAvailability, EstatusDisponibilidad } from '../../teacher-availability/entities/teacher-availability.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { SchoolPeriod } from '../../school-periods/entities/school-period.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Seeder para crear disponibilidades horarias de docentes
 * 
 * 3 disponibilidades de prueba:
 * - Docente 1 (María): APROBADA, Escolarizado, 4 módulos
 * - Docente 2 (Carlos): REVISADO, Escolarizado + Sabatino
 * - Docente 3 (Ana): PENDIENTE, Sabatino
 */
async function seedTeacherAvailability() {
  console.log('');
  console.log('================================================');
  console.log('🌱 SEEDER DE DISPONIBILIDAD HORARIA - Sistema GEM');
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
    entities: [TeacherAvailability, Teacher, SchoolPeriod, User],
    synchronize: false,
  });

  try {
    // Inicializar conexión
    await dataSource.initialize();
    console.log('📡 Conexión a la base de datos establecida');

    // Obtener repositorio
    const availabilityRepository = dataSource.getRepository(TeacherAvailability);

    // Verificar disponibilidades existentes
    const existing = await availabilityRepository.find();
    console.log(`📋 Disponibilidades existentes: ${existing.length}`);

    // Limpiar tabla (opcional)
    if (existing.length > 0) {
      console.log('🗑️  Limpiando tabla de disponibilidades...');
      await availabilityRepository.remove(existing);
      console.log('✅ Tabla limpiada');
    }

    console.log('\n💾 Creando disponibilidades horarias...\n');

    // Disponibilidades de prueba
    const disponibilidades = [
      // DOCENTE 1: María González - APROBADA
      {
        docenteId: 1,
        periodoEscolarId: 5, // ✅ ID CORRECTO: Enero-Junio 2025
        programasImparte: [1, 2], // LFT, LTS
        sistemasDisponibles: ['ESCOLARIZADO'],
        modulosEscolarizado: [1, 2, 3, 4], // Todos los módulos
        modulosSabatino: null,
        modulosMaximosSemana: 4,
        disponibilidadProximoPeriodo: true,
        estatus: EstatusDisponibilidad.APROBADO,
        comentariosAdmin: 'Disponibilidad completa aprobada. Excelente flexibilidad horaria.',
        revisadoPor: 1, // SUPER_ADMIN
        fechaRevision: new Date('2025-01-20'),
      },

      // DOCENTE 2: Carlos Ramírez - REVISADO
      {
        docenteId: 2,
        periodoEscolarId: 5, // ✅ ID CORRECTO: Enero-Junio 2025
        programasImparte: [3, 5], // LDO, LCE
        sistemasDisponibles: ['ESCOLARIZADO', 'SABATINO'],
        modulosEscolarizado: [1, 2], // Módulos 1 y 2
        modulosSabatino: [1, 2, 3], // Todos los módulos sabatinos
        modulosMaximosSemana: 3,
        disponibilidadProximoPeriodo: true,
        estatus: EstatusDisponibilidad.REVISADO,
        comentariosAdmin: 'Disponibilidad revisada. Flexible para ambos sistemas.',
        revisadoPor: 1, // SUPER_ADMIN
        fechaRevision: new Date('2025-01-22'),
      },

      // DOCENTE 3: Ana Martínez - PENDIENTE
      {
        docenteId: 3,
        periodoEscolarId: 5, // ✅ ID CORRECTO: Enero-Junio 2025
        programasImparte: [4, 5], // LPP, LCE
        sistemasDisponibles: ['SABATINO'],
        modulosEscolarizado: null,
        modulosSabatino: [1, 2], // Módulos 1 y 2
        modulosMaximosSemana: 2,
        disponibilidadProximoPeriodo: true,
        estatus: EstatusDisponibilidad.PENDIENTE,
        comentariosAdmin: null,
        revisadoPor: null,
        fechaRevision: null,
      },
    ];

    // Guardar en base de datos
    let count = 0;
    for (const disponibilidadData of disponibilidades) {
      const availability = availabilityRepository.create(disponibilidadData);
      await availabilityRepository.save(availability);

      console.log(`✅ Disponibilidad creada:`);
      console.log(`   Docente ID: ${disponibilidadData.docenteId}`);
      console.log(`   Periodo: ${disponibilidadData.periodoEscolarId} (Enero-Junio 2025)`);
      console.log(`   Sistemas: ${disponibilidadData.sistemasDisponibles.join(', ')}`);
      console.log(`   Programas: ${disponibilidadData.programasImparte.length} licenciaturas`);
      console.log(`   Estatus: ${disponibilidadData.estatus}`);
      console.log('');
      count++;
    }

    console.log('================================================');
    console.log('📊 RESUMEN:');
    console.log(`   ✅ Disponibilidades creadas: ${count}`);
    console.log(`   ⭐ APROBADAS: 1 (Docente 1)`);
    console.log(`   📝 REVISADAS: 1 (Docente 2)`);
    console.log(`   ⏳ PENDIENTES: 1 (Docente 3)`);
    console.log('================================================');
    console.log('');
    console.log('🎉 Seeder de disponibilidad horaria ejecutado exitosamente');

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
seedTeacherAvailability()
  .then(() => {
    console.log('✅ Seeder completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al ejecutar seeder:', error);
    process.exit(1);
  });